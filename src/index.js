import Package from '../package.json'
import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import jwt from 'express-jwt'
import winston from 'winston'
import { MongoDB } from 'winston-mongodb'

// Import mods
import ExampleMod from './mods/example-mod'
import Jokes from 'helio-mod-jokes'

// Import core routes
import UserRouter from './routes/user'

import dotenv from 'dotenv'
dotenv.config()

let PublicPaths = [
  '/',
  '/user/auth',
  '/user/register',
  ...(process.env.PUBLIC_PATHS ? process.env.PUBLIC_PATHS.split(',') : [])
]

// Set mods to load
const Mods = [
  { path: '/example', module: ExampleMod },
  { path: '/jokes', module: Jokes }
]

// Core routes
const routes = [
  { path: '/user', module: UserRouter }
]

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
require('winston-mongodb').MongoDB // eslint-disable-line
if (process.env.CONSOLE_LOG !== 'false') LogTransports.push(new winston.transports.Console({ format: winston.format.simple() }))
if (process.env.LOG_TO_DB) LogTransports.push(new MongoDB({ db: process.env.DB_URI }))

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
  app.use(jwt({ secret: process.env.JWT_SECRET, credentialsRequired: false })) // decode token even on public paths
  app.use(jwt({ secret: process.env.JWT_SECRET }).unless({ path: PublicPaths })) // protect private paths

  // Setup mod routes
  Mods.forEach(options => {
    const Mod = options.module
    const instance = new Mod(options)
    app.use(options.path, instance.router)
  })

  // Root handler
  app.get('/', (req, res) => {
    res.json({
      name: process.env.NAME || 'Helio API Server',
      version: process.env.SHOW_VERSION ? Package.version : null
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
    if (process.env.CONSOLE_ERRORS === 'true') Log.error('APP ERROR:', err.stack)
    if (err.name === 'UnauthorizedError') return res.status(401).json({ error: 'Invalid token' })
    return res.status(500).json({ error: 'Internal API error' })
  })

  // Start listening for requests
  app.listen(process.env.PORT || 3001)
  Log.info(`${process.env.NAME || 'Helio API Server'} listening`)
}

export default app
