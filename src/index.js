import '@babel/polyfill'
import path from 'path'
import figlet from 'figlet'
import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import jwt from 'express-jwt'
import winston from 'winston'
import { consoleFormat } from 'winston-console-format'
import rateLimit from 'express-rate-limit'
import { MongoDB } from 'winston-mongodb'

import Package from '../package.json'

import { Mods, ModModels } from './config'

// Import default models
import UserModel from './models/User'
import BlogPostModel from './models/BlogPost'
import TokenWhitelist from './models/TokenWhitelist'

export const DefaultModels = [
  { name: 'User', model: UserModel },
  { name: 'BlogPost', model: BlogPostModel },
  { name: 'TokenWhitelist', model: TokenWhitelist }
]

let PublicPaths = [
  '/',
  ...(process.env.PUBLIC_PATHS ? process.env.PUBLIC_PATHS.split(',') : [])
]

class Helio {
  constructor (options) {
    options = this.options = options || {}
    options.middleware = typeof options.middleware === 'function' ? [options.middleware] : options.middleware
    options.middleware = Array.isArray(options.middleware) ? options.middleware : []

    this.rootHandler = options.rootHandler || null
    this.mods = options.mods || Mods
    this.models = options.models || ModModels
    this.routes = options.routes || []

    // Set Core routes to load
    // You should be using a mod instead, but this is here in case you need it
    // this.routes.push({ path: '/path', module: <Express Router or Middleware Function> })

    const app = this.app = express()
    app.set('HELIO_DB_URI', options.dbUri || process.env.DB_URI)
    app.set('HELIO_JWT_SECRET', options.jwtSecret || process.env.JWT_SECRET)
    app.set('HELIO_JWT_TIMEOUT', options.jwtTimeout || process.env.JWT_TIMEOUT || '1h')
    app.set('HELIO_LOG_TO_DB', options.logToDB || process.env.LOG_TO_DB === 'true')
    app.set('HELIO_CONSOLE_LOG', options.consoleLog || process.env.CONSOLE_LOG === 'true')
    app.set('HELIO_CONSOLE_ERRORS', options.consoleErrors || process.env.CONSOLE_ERRORS === 'true')

    mongoose.set('debug', options.mongooseDebug || false)

    let initError = false

    if (!app.get('HELIO_DB_URI')) initError = 'You must pass dbUri option or have DB_URI environment variable'
    if (!app.get('HELIO_JWT_SECRET')) initError = 'You must pass jwtSecret option or have JWT_SECRET environment variable'

    if (initError) throw new Error(initError)

    // Setup logger
    const LogTransports = options.logTransports || []

    if (process.env.NODE_ENV !== 'testing' && app.get('HELIO_LOG_TO_DB')) LogTransports.push(new MongoDB({ db: app.get('HELIO_DB_URI') }))

    LogTransports.push(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.padLevels(),
        consoleFormat({
          showMeta: true,
          metaStrip: ['timestamp', 'service'],
          inspectOptions: {
            depth: 8,
            colors: true,
            maxArrayLength: Infinity,
            breakLength: 120,
            compact: Infinity
          }
        })
      ),

      silent: process.env.NODE_ENV === 'testing' || !app.get('HELIO_CONSOLE_LOG')
    }))

    this.log = winston.createLogger({
      level: this.options.logLevel || process.env.LOG_LEVEL || 'silly',

      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),

      transports: LogTransports
    })

    const finishSetup = () => {
      this.connectDB()
      this.initializeServer()
    }

    // Finish booting
    if (this.options.hideBanner) return finishSetup()
    figlet.text(this.options.bannerText || 'Helio', {
      font: this.options.bannerFont || 'The Edge',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    }, (err, data) => {
      if (err) this.log.silly('Unable to show banner:', err)
      if (!err) console.log(data)

      finishSetup()
    })
  }

  connectDB () {
    const dbUri = this.app.get('HELIO_DB_URI')
    if (typeof this.options.mongooseOptions !== 'object') this.options.mongooseOptions = {}

    this.options.mongooseOptions = {
      ...{
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true
      },

      ...this.options.mongooseOptions
    }

    this.db = mongoose
      .connect(dbUri, this.options.mongooseOptions)
      .then(data => this.log.verbose('Mongo Database:', { connected: true, uri: dbUri.replace(/:\w+/g, ':****') }))
      .catch(err => {
        this.log.error('Mongoose Connection Error:', err)
        this.log.error('Refusing to continue without usable database. Exiting.')
        process.exit(1)
      })
  }

  initializeServer () {
    this.log.silly('Server initializing', { helio: Package.version })
    const app = this.app
    const options = this.options

    app.disable('x-powered-by')
    app.use(bodyParser.json())
    if (options.trustProxy) app.set('trust proxy', 1)

    // Setup static content
    let staticPath = path.resolve(options.staticPath || './dist/assets')
    this.log.verbose('Serving static content from:', { staticPath })
    app.use(express.static(staticPath))

    // Setup rate limiting
    const limiter = rateLimit({
      windowMs: options.rateLimitWindow || process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000,
      max: options.rateLimitMaxRequestsPerWindow || process.env.RATE_LIMIT_MAX_REQUESTS_PER_WINDOW || 100,
      skip: (req, res) => {
        return (
          req.ip === '127.0.0.1' ||
          req.ip === '::ffff:127.0.0.1' ||
          req.ip === '::1' ||
          (options.rateLimitExemptUrls || ['/jokes']).includes(req.url)
        )
      }
    })

    if (!options.disableRateLimiter) app.use(limiter)

    app.use((req, res, next) => {
      req.log = req.Log = this.log // leaving capitalized Log for backward-compatibility

      this.log.verbose('Incoming request:', {
        url: req.url,
        ip: req.ip,
        rate: req.rateLimit || Infinity // Infinity looks nicer in the logs
      })

      return next()
    })

    // Setup any middleware that was passed in
    options.middleware.forEach(mid => app.use(mid))

    // Setup mods' public paths
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
    const registeredMods = []

    this.mods.forEach(mod => {
      const Mod = mod.module
      const instance = new Mod(mod)

      if (instance.receiveModels && instance.needModels) {
        const giveModels = ModModels.filter(model => instance.needModels.includes(model.name))
        instance.receiveModels(giveModels)
      }

      app.use(mod.path, instance.router)
      registeredMods.push(instance.name)
    })

    if (registeredMods.length > 0) this.log.verbose(`Registered Mods:`, { mods: registeredMods })

    // Setup core routes
    const registeredRoutes = []

    this.routes.forEach(route => {
      app.use(route.path, route.module)
      registeredRoutes.push(route.path)
    })

    if (registeredRoutes.length > 0) this.log.info('Registered Core Routes:', { routes: registeredRoutes })

    // Root handler
    if (!this.rootHandler) {
      if (!this.options.staticPath) this.log.warn('No root handler or static path provided; using defaults.')

      app.use('/', (req, res) => {
        res.json({
          name: options.name || process.env.NAME || 'Helio API Server',
          version: process.env.SHOW_VERSION ? Package.version : null
        })
      })
    }

    // Catch 404
    app.use((req, res, next) => {
      return res.status(404).json({ error: 'Invalid API method' })
    })

    // Catch other errors
    app.use((err, req, res, next) => {
      if (options.consoleErrors && err.name !== 'UnauthorizedError') this.log.error('APP ERROR:', err.stack)
      if (err.name === 'UnauthorizedError') return res.status(401).json({ error: 'Invalid token' })
      return res.status(500).json({ error: 'Internal API error' })
    })

    if (!options.noListen) this.listen()
  }

  listen (callback) {
    // Start listening for requests
    const port = this.options.port || process.env.PORT || 3001
    const listener = this.app.listen(port, () => {
      this.port = listener.address().port
      this.log.info(`${this.options.name || process.env.NAME || 'Helio API Server'} listening`, listener.address())
      if (typeof callback === 'function') callback(listener)
    })
  }
}

export default Helio
