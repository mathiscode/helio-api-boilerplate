import '@babel/polyfill'
import Package from '../package.json'
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

// Set Core routes to load
// You should be using a mod instead, but this is here in case you need it
// format: { path: '/path', module: <Express Router or Middleware Function> }
const routes = []

const app = express()

// Setup and connect to database; server will not run until connected
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

let initError = false

if (!process.env.DB_URI) initError = 'You must define a mongodb DB_URI environment variable'
if (!process.env.JWT_SECRET) initError = 'You must define a JWT_SECRET environment variable'

if (!process.env.JWT_SECRET) {
  console.error(initError)
  process.exit(1)
}

// Setup logger
const LogTransports = []

if (process.env.NODE_ENV !== 'testing' && process.env.LOG_TO_DB !== 'false') LogTransports.push(new MongoDB({ db: process.env.DB_URI }))

LogTransports.push(new winston.transports.Console({
  format: winston.format.simple(),
  silent: process.env.NODE_ENV === 'testing' || process.env.CONSOLE_LOG === 'false'
}))

const Log = winston.createLogger({
  format: winston.format.json(),
  transports: LogTransports
})

Log.info('Connecting to database...')
mongoose.connect(process.env.DB_URI, (err) => {
  if (err) {
    Log.error(err.toString())
    process.exit(2)
  } else {
    initializeServer()
  }
})

const initializeServer = app.initializeServer = () => {
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
    req.Log = Log
    next()
  })

  // Setup mods public paths
  Mods.forEach(options => {
    const Mod = options.module
    let instance = new Mod(options)
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
  Mods.forEach(options => {
    const Mod = options.module
    const instance = new Mod(options)

    if (instance.receiveModels && instance.needModels) {
      const giveModels = ModModels.filter(model => instance.needModels.includes(model.name))
      instance.receiveModels(giveModels)
    }

    app.use(options.path, instance.router)
    Log.info(`[MOD REGISTERED] ${instance.name}`)
  })

  // Root handler
  app.get('/', (req, res) => {
    res.json({
      name: process.env.NAME || 'Helio API Server',
      version: process.env.SHOW_VERSION === 'true' ? Package.version : null
    })
  })

  // Setup core routes
  routes.forEach(route => {
    app.use(route.path, route.module)
  })

  // Catch 404
  app.use((req, res, next) => {
    res.status(404).json({ error: 'Invalid API method' })
  })

  // Catch other errors
  app.use((err, req, res, next) => {
    if (process.env.CONSOLE_ERRORS === 'true' && err.name !== 'UnauthorizedError') Log.error('APP ERROR:', err.stack)
    if (err.name === 'UnauthorizedError') return res.status(401).json({ error: 'Invalid token' })
    return res.status(500).json({ error: 'Internal API error' })
  })

  // Start listening for requests
  app.listen(process.env.PORT || 3001)
  Log.info(`${process.env.NAME || 'Helio API Server'} listening`)
}

export default app
