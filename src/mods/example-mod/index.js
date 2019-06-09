/*
 *  This is a full-featured template for a Helio mod.
*/

import express from 'express'
import mongoose from 'mongoose' // Only necessary if you need to extend inbound models

export default class {
  constructor (options) {
    this.options = options
    this.name = options.name || 'Example Helio Mod'
    const router = this.router = express.Router(options.routerOptions)

    // Comment the next line out if you don't want any public paths, or modify as needed
    this.publicPaths = [options.path, new RegExp(`^${options.path}/.*`)] // Everything is public

    // Specify which models you need in this mod
    this.needModels = ['User']

    // This defines schemas used to create submodels, which inherit from the parent model
    // format: { ParentModelName: new mongoose.Schema({ newProperty: MongooseSchemaType }) }
    this.subSchemas = {
      User: new mongoose.Schema({
        myData: {
          field1: String,
          field2: { type: Number, required: true },
          field3: { type: Date, default: Date.now },
          field4: Boolean,
          field5: [{ type: String, default: 'Field5 Data' }]
        }
      })
    }

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
    this.subModels = {}

    // This will assign each model to this.models.ModelName
    models.forEach(model => { this.models[model.name] = model.model })

    // This will generate submodels based on this.subSchemas
    // In your route methods, access submodels with this.subModels.ModelName; eg. this.subModels.User
    for (const parentModelName in this.subSchemas) {
      const parentModel = this.models[parentModelName]
      const subSchema = this.subSchemas[parentModelName]
      this.subModels[parentModelName] = parentModel.discriminator(this.name, subSchema)
    }
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
