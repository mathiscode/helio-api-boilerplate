/*
 *  This mod is included with helio-api-boilerplate instead of as a package to show a real-world use of many features of a mod
 *  See example-mod for full usage information or minimal-mod for a basic starting point
*/

import express from 'express'
import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'

export default class {
  constructor (options) {
    this.options = options
    this.name = options.name || 'Helio Blog Mod'
    const router = this.router = express.Router(options.routerOptions)

    this.needModels = ['BlogPost']

    this.subSchemas = {
      BlogPost: new mongoose.Schema({
        owner: String,
        public: { type: Boolean, default: true },
        title: { type: String, required: true },
        excerpt: String,
        content: { type: String, required: true }
      })
    }

    this.subSchemas.BlogPost.options.toJSON = {
      transform: (doc, ret, options) => {
        delete ret._id
        delete ret.__v
        delete ret.__t
        return ret
      }
    }

    router.get('/', this.getAllMyPosts.bind(this))
    router.post('/', this.addPost.bind(this))
    router.get('/:id', this.getPost.bind(this))
    router.patch('/:id', this.updatePost.bind(this))
    router.delete('/:id', this.deletePost.bind(this))

    const self = this
    router.use((err, req, res, next) => {
      req.Log.error(`[MOD ERROR] (${self.name}) ${err.stack}`)
      return res.status(500).json({ error: err.toString() })
    })
  }

  receiveModels (models) {
    this.models = {}
    this.subModels = {}

    models.forEach(model => { this.models[model.name] = model.model })

    for (const parentModelName in this.subSchemas) {
      const parentModel = this.models[parentModelName]
      const subSchema = this.subSchemas[parentModelName]
      this.subModels[parentModelName] = parentModel.discriminator(this.name, subSchema)
    }
  }

  async getAllMyPosts (req, res, next) {
    try {
      const posts = await this.subModels.BlogPost
        .find({ owner: req.user.id })
        .sort({ createdAt: 'desc' })

      res.json(posts)
    } catch (err) {
      next(err)
    }
  }

  async addPost (req, res, next) {
    try {
      const post = new this.subModels.BlogPost({
        id: uuid(),
        owner: req.user.id,
        public: req.body.public || true,
        title: req.body.title || 'Untitled Blog Post',
        excerpt: req.body.excerpt ? req.body.excerpt.substring(0, 256) : (req.body.content.length > 256 ? req.body.content.substring(0, 256) + '...' : null),
        content: req.body.content
      })

      await post.save()
      res.json(post)
    } catch (err) {
      next(err)
    }
  }

  async getPost (req, res, next) {
    try {
      const post = await this.subModels.BlogPost.findOne({ id: req.params.id, $or: [{ owner: req.user.id }, { public: true }] })
      if (!post) return res.status(404).json({ error: 'Post not found' })
      res.json(post)
    } catch (err) {
      next(err)
    }
  }

  async updatePost (req, res, next) {
    try {
      const updatedPost = await this.subModels.BlogPost.findOneAndUpdate({ id: req.params.id, owner: req.user.id }, { ...req.body }, { new: true })
      res.json(updatedPost)
    } catch (err) {
      next(err)
    }
  }

  async deletePost (req, res, next) {
    try {
      const result = await this.subModels.BlogPost.findOneAndRemove({ id: req.params.id, owner: req.user.id })
      res.json(result)
    } catch (err) {
      next(err)
    }
  }
}
