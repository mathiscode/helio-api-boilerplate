import '@babel/polyfill'
import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import jwt from 'express-jwt'
import winston from 'winston'
import rateLimit from 'express-rate-limit'
import { MongoDB } from 'winston-mongodb'

import { Mods, ModModels } from './config'
import TokenWhitelist from './models/TokenWhitelist'

let PublicPaths = [
  '/',
  ...(process.env.PUBLIC_PATHS ? process.env.PUBLIC_PATHS.split(',') : [])
]

class Helio {
  constructor (options, middleware = []) {
    options = this.options = options || {}
    options.middleware = typeof options.middleware === 'function' ? [options.middleware] : options.middleware
    options.middleware = Array.isArray(options.middleware) ? options.middleware : []

    this.mods = options.mods || Mods
    this.models = options.models || ModModels

    // Set Core routes to load
    // You should be using a mod instead, but this is here in case you need it
    // format: { path: '/path', module: <Express Router or Middleware Function> }
    this.routes = []

    const app = this.app = express()
    app.set('HELIO_DB_URI', options.dbUri || process.env.DB_URI)
    app.set('HELIO_JWT_SECRET', options.jwtSecret || process.env.JWT_SECRET)
    app.set('HELIO_JWT_TIMEOUT', options.jwtTimeout || process.env.JWT_TIMEOUT || '1h')
    app.set('HELIO_LOG_TO_DB', options.logToDB || process.env.LOG_TO_DB === 'true')
    app.set('HELIO_CONSOLE_LOG', options.consoleLog || process.env.CONSOLE_LOG === 'true')
    app.set('HELIO_CONSOLE_ERRORS', options.consoleErrors || process.env.CONSOLE_ERRORS === 'true')

    mongoose.set('useNewUrlParser', true)
    mongoose.set('useFindAndModify', false)
    mongoose.set('useCreateIndex', true)
    mongoose.set('debug', options.mongooseDebug || false)

    let initError = false

    if (!app.get('HELIO_DB_URI')) initError = 'You must pass dbUri option or have DB_URI environment variable'
    if (!app.get('HELIO_JWT_SECRET')) initError = 'You must pass jwtSecret option or have JWT_SECRET environment variable'

    if (initError) throw new Error(initError)

    // Setup logger
    const LogTransports = options.logTransports || []

    if (process.env.NODE_ENV !== 'testing' && app.get('HELIO_LOG_TO_DB')) LogTransports.push(new MongoDB({ db: app.get('HELIO_DB_URI') }))

    LogTransports.push(new winston.transports.Console({
      format: winston.format.simple(),
      silent: process.env.NODE_ENV === 'testing' || !app.get('HELIO_CONSOLE_LOG')
    }))

    this.log = winston.createLogger({
      format: winston.format.json(),
      transports: LogTransports
    })

    this.connectDB()
    this.initializeServer()
  }

  connectDB () {
    this.log.info('Connecting to database...')
    mongoose.connect(this.app.get('HELIO_DB_URI'), err => {
      if (err) {
        this.log.error(err.toString())
        throw err
      }
    })
  }

  initializeServer () {
    const app = this.app
    const options = this.options

    app.disable('x-powered-by')
    app.use(bodyParser.json())

    // Uncomment the next line if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    // app.set('trust proxy', 1)

    // Setup rate limiting
    const limiter = rateLimit({
      windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000,
      max: process.env.RATE_LIMIT_MAX_REQUESTS_PER_WINDOW || 100,
      skip: (req, res) => req.ip === '127.0.0.1' || req.ip === '::1'
    })

    app.use(limiter)

    // Provide logger to routes
    app.use((req, res, next) => {
      req.Log = this.log
      next()
    })

    // Setup any middleware that was passed in
    options.middleware.forEach(mid => app.use(mid))

    // Setup mods public paths
    this.mods.forEach(mod => {
      const Mod = mod.module
      let instance = new Mod(mod)
      const modPublicPaths = instance.publicPaths || []
      PublicPaths = [...PublicPaths, ...modPublicPaths]
      instance = null
    })

    // Setup JWT authentication
    const checkTokenRevocation = async (req, payload, done) => {
      const inWhitelist = await TokenWhitelist.countDocuments({ token: req.headers.authorization.replace('Bearer ', '') })
      return done(null, !inWhitelist)
    }

    app.use(jwt({ secret: app.get('HELIO_JWT_SECRET'), credentialsRequired: false })) // decode token even on public paths
    app.use(jwt({ secret: app.get('HELIO_JWT_SECRET'), isRevoked: checkTokenRevocation }).unless({ path: PublicPaths })) // protect private paths

    // Setup mod routes
    this.mods.forEach(mod => {
      const Mod = mod.module
      const instance = new Mod(mod)

      if (instance.receiveModels && instance.needModels) {
        const giveModels = ModModels.filter(model => instance.needModels.includes(model.name))
        instance.receiveModels(giveModels)
      }

      app.use(mod.path, instance.router)
      this.log.info(`[MOD REGISTERED] ${instance.name}`)
    })

    // Root handler
    app.get('/', (req, res) => {
      res.json({
        name: options.name || process.env.NAME || 'Helio API Server'
      })
    })

    // Setup core routes
    this.routes.forEach(route => {
      app.use(route.path, route.module)
    })

    // Catch 404
    app.use((req, res, next) => {
      res.status(404).json({ error: 'Invalid API method' })
    })

    // Catch other errors
    app.use((err, req, res, next) => {
      if (options.consoleErrors && err.name !== 'UnauthorizedError') this.log.error('APP ERROR:', err.stack)
      if (err.name === 'UnauthorizedError') return res.status(401).json({ error: 'Invalid token' })
      return res.status(500).json({ error: 'Internal API error' })
    })

    if (!options.noListen) this.listen()
  }

  listen () {
    // Start listening for requests
    const port = this.options.port || process.env.PORT || 3001
    this.app.listen(port)
    this.log.info(`${this.options.name || process.env.NAME || 'Helio API Server'} listening on port ${port}`)
  }
}

export default Helio
