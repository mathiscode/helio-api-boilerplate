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

export default class {
  constructor (options) {
    options = this.options = options || {}

    this.mods = options.mods || Mods
    this.models = options.models || ModModels

    // Set Core routes to load
    // You should be using a mod instead, but this is here in case you need it
    // format: { path: '/path', module: <Express Router or Middleware Function> }
    this.routes = []

    const app = this.app = express()
    app.set('HELIO_DB_URI', options.mongoose ? null : options.dbUri || process.env.DB_URI)
    app.set('HELIO_MONGOOSE', options.mongoose)
    app.set('HELIO_JWT_SECRET', options.jwtSecret || process.env.JWT_SECRET)
    app.set('HELIO_LOG_TO_DB', options.logToDB || process.env.LOG_TO_DB === 'true')
    app.set('HELIO_CONSOLE_LOG', options.consoleLog || process.env.CONSOLE_LOG === 'true')
    app.set('HELIO_CONSOLE_ERRORS', options.consoleErrors || process.env.CONSOLE_ERRORS === 'true')

    // Setup and connect to database; server will not run until connected
    mongoose.set('useNewUrlParser', true)
    mongoose.set('useFindAndModify', false)
    mongoose.set('useCreateIndex', true)

    let initError = false

    if (!app.get('HELIO_DB_URI') && !app.get('HELIO_MONGOOSE')) initError = 'You must pass dbUri option or have DB_URI environment variable'
    if (!app.get('HELIO_JWT_SECRET')) initError = 'You must pass jwtSecret option or have JWT_SECRET environment variable'

    if (initError) throw new Error(initError)

    // Setup logger
    const LogTransports = options.logTransports || []

    if (process.env.NODE_ENV !== 'testing' && app.get('HELIO_LOG_TO_DB')) LogTransports.push(new MongoDB({ db: app.get('HELIO_DB_URI') || app.get('HELIO_MONGOOSE') }))

    LogTransports.push(new winston.transports.Console({
      format: winston.format.simple(),
      silent: process.env.NODE_ENV === 'testing' || process.env.CONSOLE_LOG === 'false'
    }))

    this.log = winston.createLogger({
      format: winston.format.json(),
      transports: LogTransports
    })

    this.initializeServer(options)
  }

  connectDB () {
    if (this.app.get('HELIO_MONGOOSE')) return

    this.log.info('Connecting to database...')
    mongoose.connect(process.env.DB_URI, (err) => {
      if (err) {
        this.log.error(err.toString())
        throw new Error(err)
      }
    })
  }

  initializeServer (options) {
    const app = this.app
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

    app.use(jwt({ secret: process.env.JWT_SECRET, credentialsRequired: false })) // decode token even on public paths
    app.use(jwt({ secret: process.env.JWT_SECRET, isRevoked: checkTokenRevocation }).unless({ path: PublicPaths })) // protect private paths

    // Setup mod routes
    this.mods.forEach(mod => {
      const Mod = mod.module
      const instance = new Mod(mod)

      if (instance.receiveModels && instance.needModels) {
        const giveModels = ModModels.filter(model => instance.needModels.includes(model.name))
        instance.receiveModels(giveModels)
      }

      app.use(mod.path, instance.router)
      this.log.debug(`[MOD REGISTERED] ${instance.name}`)
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

    if (!this.options.noListen) this.listen(this.options)
  }

  listen (options) {
    // Start listening for requests
    this.app.listen(options.port || process.env.PORT || 3001)
    this.log.info(`${process.env.NAME || 'Helio API Server'} listening`)
  }
}
