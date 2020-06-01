import '@babel/polyfill'
import EventEmitter from 'events'
import figlet from 'figlet'
import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
// import session from 'express-session'
// import connectMongo from 'connect-mongo'
// import jwt from 'express-jwt'
import jwt from 'jsonwebtoken'
import winston from 'winston'
import { consoleFormat } from 'winston-console-format'
import rateLimit from 'express-rate-limit'
import { MongoDB } from 'winston-mongodb'
import cors from 'cors'

import Package from '../package.json'

// import { Mods, ModModels } from './config'

// Import default models
// import UserModel from './models/User'
// import BlogPostModel from './models/BlogPost'
// import TokenWhitelist from './models/TokenWhitelist'

// export const DefaultModels = [
//   { name: 'User', model: UserModel },
//   { name: 'BlogPost', model: BlogPostModel },
//   { name: 'TokenWhitelist', model: TokenWhitelist }
// ]

// const MongoStore = connectMongo(session)

// let PublicPaths = [
//   '/',
//   ...(process.env.PUBLIC_PATHS ? process.env.PUBLIC_PATHS.split(',') : [])
// ]

class HelioEvents extends EventEmitter {}

class Helio {
  constructor (options) {
    options = this.options = options || {}
    options.middleware = typeof options.middleware === 'function' ? [options.middleware] : options.middleware
    options.middleware = Array.isArray(options.middleware) ? options.middleware : []

    this.apps = options.apps || []
    this.routes = options.routes || []

    const app = this.app = express()
    app.set('HELIO_DB_URI', options.dbUri || process.env.DB_URI)
    app.set('HELIO_JWT_SECRET', options.jwtSecret || process.env.JWT_SECRET)
    app.set('HELIO_JWT_TIMEOUT', options.jwtTimeout || process.env.JWT_TIMEOUT || '1h')
    app.set('HELIO_LOG_TO_DB', options.logToDB || process.env.LOG_TO_DB === 'true')
    app.set('HELIO_CONSOLE_LOG', options.consoleLog || process.env.CONSOLE_LOG === 'true')
    app.set('HELIO_CONSOLE_ERRORS', options.consoleErrors || process.env.CONSOLE_ERRORS === 'true')
    mongoose.set('debug', options.mongooseDebug || process.env.MONGOOSE_DEBUG === 'true' || false)

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
    app.use(bodyParser.urlencoded({ extended: true }))
    if (options.trustProxy) app.set('trust proxy', 1)

    // Setup session storage
    // app.use(session({
    //   secret: process.env.SESSION_SECRET || (Date.now() * Math.random()).toString(36),
    //   store: new MongoStore({ mongooseConnection: mongoose.connection }),
    //   resave: false,
    //   saveUninitialized: false
    // }))

    // Setup static content
    // let staticPath = path.resolve(options.staticPath || './dist/assets')
    // this.log.verbose('Serving static content from:', { staticPath })
    // app.use(express.static(staticPath))

    // Setup rate limiting
    const limiter = rateLimit({
      windowMs: options.rateLimitWindow || process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000,
      max: options.rateLimitMaxRequestsPerWindow || process.env.RATE_LIMIT_MAX_REQUESTS_PER_WINDOW || 100,
      skip: (req, res) => {
        return (
          req.ip === '127.0.0.1' ||
          req.ip === '::ffff:127.0.0.1' ||
          req.ip === '::1' ||
          (options.rateLimitExemptUrls).includes(req.url)
        )
      }
    })

    if (!options.disableRateLimiter) app.use(limiter)

    app.use((req, res, next) => {
      req.log = req.Log = this.log // leaving capitalized Log for backward-compatibility
      req.db = this.db

      const logRequest = () => {
        const info = {
          user: req.user || '*anonymous*',
          url: req.url,
          ip: req.ip,
          rate: req.rateLimit || Infinity // Infinity looks nicer in the logs
        }

        this.log.silly('Incoming request:', info)
      }

      try {
        const authorization = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null

        if (authorization) {
          jwt.verify(authorization, this.app.get('HELIO_JWT_SECRET'), (err, payload) => {
            if (err) {
              req.user = null
              this.log.warn(err.toString())
            } else {
              const tokenMinutesRemaining = Math.floor(((new Date(payload.exp * 1000) - Date.now()) / 1000) / 60)
              res.set('Token-Minutes-Remaining', tokenMinutesRemaining)
              req.user = payload.data ? payload.data.uuid : null
            }

            logRequest()
          })
        }
      } catch (e) {
        this.log.warn(e)
        logRequest()
      }

      return next()
    })

    // Setup any middleware that was passed in
    options.middleware.forEach(mid => app.use(mid))

    // Load Helio Apps
    const appComms = new HelioEvents()
    this.log.verbose(`Loading ${this.apps ? this.apps.length : 0} apps`)

    this.apps && this.apps.forEach(App => {
      const appRouter = express.Router()
      // For convenience, we'll attach appComms to the router
      appRouter.appComms = appComms

      // We instantiate the app and pass in a router, the primary logger, the mongoose instance, and the options
      const appInstance = new App.Loader(appRouter, this.log, mongoose, App.options || {})
      appInstance.router = appRouter

      this.log.silly('Loading app:', { name: appInstance.name, version: appInstance.package ? appInstance.package.version : 'unknown', root: appInstance.root })

      if (appInstance && appInstance.corsAllowedOrigins && appInstance.corsAllowedOrigins.length > 0) {
        app.use(appInstance.root, cors({
          origin: (origin, callback) => {
            if (!origin) return callback(null, true) // allow requests with no origin
            if (!appInstance.corsAllowedOrigins.includes(origin.replace(/\/$/, ''))) { // check with stripped trailing slash for consistency
              this.log.warn('CORS Violation from Origin:', { origin, app: appInstance.name, allowedOrigins: appInstance.corsAllowedOrigins })
              let msg = 'The CORS policy for this site does not allow access from the specified Origin.'
              return callback(new Error(msg), false)
            }

            return callback(null, true)
          }
        }))
      }

      if (appInstance.static) app.use(appInstance.root, express.static(appInstance.static))
      app.use(App.options && App.options.root ? App.options.root : appInstance.root, appInstance.router)
    })

    // Setup core routes
    const registeredRoutes = []

    this.routes.forEach(route => {
      app.use(route.path, route.module)
      registeredRoutes.push(route.path)
    })

    if (registeredRoutes.length > 0) this.log.info('Registered Core Routes:', { routes: registeredRoutes })

    // Root handler
    // -- Migrating to app-based architecture where an app can be defined as root
    // if (!this.rootHandler && !this.options.staticPath) {
    //   this.log.warn('No root handler or static path provided; using defaults.')
    //   app.all('/', (req, res) => {
    //     res.json({
    //       name: options.name || process.env.HELIO_NAME || 'Helio API Server',
    //       version: process.env.SHOW_VERSION ? Package.version : null
    //     })
    //   })
    // }

    // Catch 404
    app.use((req, res, next) => {
      return res.status(404).json({ error: 'Invalid API method' })
    })

    // Catch other errors
    app.use((err, req, res, next) => {
      if (options.consoleErrors && err.name !== 'UnauthorizedError') this.log.error('APP ERROR:', err)
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
      this.log.info(`${this.options.name || process.env.HELIO_NAME || 'Helio API Server'} listening`, listener.address())
      if (typeof callback === 'function') callback(listener)
    })
  }
}

export default Helio
