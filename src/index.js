import Package from '../package.json'
import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import jwt from 'express-jwt'

// Import mods
import ExampleMod from './mods/example-mod'
import Jokes from 'helio-mod-jokes'

// Import models
// import User from './models/User'

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

console.log('Connecting to database...')
mongoose.connect(process.env.DB_URI, (err) => {
  if (err) {
    console.error(err.toString())
    process.exit(2)
  } else {
    initializeServer()
  }
})

const initializeServer = () => {
  const app = express()

  app.disable('x-powered-by')
  app.use(bodyParser.json())

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
    if (process.env.CONSOLE_ERRORS) console.error('APP ERROR:', err.stack)
    if (err.name === 'UnauthorizedError') return res.status(401).json({ error: 'Invalid token' })
    return res.status(500).json({ error: 'Internal API error' })
  })

  // Start listening for requests
  app.listen(process.env.PORT || 3001)
  console.log(`${process.env.NAME || 'Helio API Server'} listening`)
}
