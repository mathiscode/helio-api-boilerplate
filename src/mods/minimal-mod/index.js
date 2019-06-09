/*
 *  This is a minimal template for a Helio mod.
 *  See example-mod for full usage information or blog-mod for a real-world example
*/

import express from 'express'

export default class {
  constructor (options) {
    this.options = options
    this.name = options.name || 'Example Minimal Helio Mod'
    const router = this.router = express.Router(options.routerOptions)
    this.publicPaths = [options.path]

    router.get('/', this.index.bind(this))

    const self = this
    router.use((err, req, res, next) => {
      req.Log.error(`[MOD ERROR] (${self.name}) ${err.stack}`)
      return res.status(500).json({ error: err.toString() })
    })
  }

  index (req, res, next) {
    const { user } = req
    res.json({ mod: this.name, user })
  }
}
