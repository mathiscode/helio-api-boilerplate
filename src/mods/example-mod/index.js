/*
 *  This is a simple template for a Helio mod.
*/

import express from 'express'

export default class {
  constructor (options) {
    this.name = options.name || 'Example Helio Mod'
    const router = this.router = express.Router()

    // Comment the next line out if you don't want any public paths, or modify as needed
    this.publicPaths = [options.path, new RegExp(`^${options.path}/.*`)]

    // Specify which models you need in this mod
    this.needModels = ['User']

    // Setup your routes here; bind(this) if you need access to the mod itself
    router.get('/', this.index.bind(this))
    router.get('/add/:x/:y', this.add)
    router.get('/test-error', this.testError)

    // This is the mod's error handler
    const self = this
    router.use((err, req, res, next) => {
      req.Log.error(`[MOD ERROR] (${self.name}) ${err.stack}`)
      return res.status(500).json({ error: err.toString() })
    })
  }

  // This function receives models requested with this.needModels
  // Access them in route methods with this.models.ModelName
  receiveModels (models) {
    this.models = {}

    models.forEach(model => {
      this.models[model.name] = model.model
    })
  }

  // Now implement your route methods:
  index (req, res, next) {
    const { user } = req
    res.json({ mod: this.name, user })
  }

  add (req, res, next) {
    let { x, y } = req.params
    x = parseFloat(x)
    y = parseFloat(y)

    res.json(x + y)
  }

  testError (req, res, next) {
    next(new Error('Intentional Error'))
  }
}
