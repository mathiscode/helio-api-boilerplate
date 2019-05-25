import express from 'express'
import bcrypt from 'bcryptjs'
import jsonwebtoken from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'

import User from '../models/User'

const router = express.Router()

const errorHandler = (err, req, res, code = 500) => {
  req.Log.error(err)
  if (res) return res.status(code).json({ error: err.toString() })
}

router.get('/', (req, res) => {
  User.findOne({ id: req.user.id }).select('-__v -_id -password')
    .then(user => {
      res.json(user)
    })
    .catch(err => errorHandler(err, req, res))
})

router.post('/auth', (req, res) => {
  const { email, password } = req.body

  User.findOne({ email })
    .then(user => {
      let err = null
      if (!user || !user.validPassword(password)) err = true
      if (err) return res.status(403).json({ error: 'Invalid email address or password' })

      jsonwebtoken.sign({
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles
      }, process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_TIMEOUT || '1h'
      },
      (err, token) => {
        if (err) return res.status(400).json({ error: 'An error occurred authenticating your account' })
        res.set('X-AuthToken', token).json({ token })
      })
    })
})

router.post('/register', (req, res) => {
  const { email, password } = req.body
  // TODO: Validate, implement bot protection, etc

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      req.Log.error(err)
      return res.status(500).json({ error: 'Error hashing your password' })
    }

    User
      .findOne({ email })
      .then(user => {
        if (user) return res.status(403).json({ error: 'That email address is already linked to an account' })

        user = new User({
          id: uuid(),
          email,
          username: email,
          password: hash,
          roles: ['user']
        })

        user.save((err, user) => {
          if (err) return res.status(500).json({ error: 'Error creating your account' })

          jsonwebtoken.sign({
            id: user._id,
            email: user.email,
            username: user.username,
            roles: user.roles
          }, process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_TIMEOUT || '1h'
          },
          (err, token) => {
            if (err) return res.status(400).json({ error: 'An error occurred authenticating your account' })
            res.set('X-AuthToken', token).json({ token })
          })
        })
      })
  })
})

router.get('/client-settings', (req, res) => {
  User.findOne({ id: req.user.id }).select('clientSettings')
    .then(user => {
      res.json({ clientSettings: user.clientSettings })
    })
    .catch(err => errorHandler(err, req, res))
})

router.post('/client-settings', (req, res) => {
  User.findOne({ id: req.user.id }).select('clientSettings')
    .then(user => {
      // Block unreasonable client setting size
      if (Object.prototype.toString.call(req.body) !== '[object Object]') return res.status(400).json({ error: 'Client Settings must be an object' })
      if (Object.keys(req.body).length > 1024) return res.status(400).json({ error: 'Client Settings are too large' })

      user.clientSettings = req.body
      user.save(err => {
        if (err) return errorHandler(err, res)
        res.json({ message: 'Client Settings updated' })
      })
    })
    .catch(err => errorHandler(err, req, res))
})

router.get('/settings', (req, res) => {
  User.findOne({ id: req.user.id })
    .then(user => {
      res.json({ settings: user.settings })
    })
    .catch(err => errorHandler(err, req, res))
})

router.get('/setting/:key', (req, res) => {
  User.findOne({ id: req.user.id })
    .then(user => {
      res.json({ key: req.params.key, value: user.settings[req.params.key] || null })
    })
    .catch(err => errorHandler(err, req, res))
})

router.post('/setting/:key', (req, res) => {
  User.findOne({ id: req.user.id })
    .then(user => {
      user.settings[req.params.key] = req.body.value
      user.save(err => {
        if (err) return errorHandler(err)
        res.json({ message: 'Setting updated' })
      })
    })
    .catch(err => errorHandler(err, req, res))
})

router.get('/profile', (req, res) => {
  User.findOne({ id: req.user.id })
    .then(user => {
      res.json({ profile: user.profile })
    })
    .catch(err => errorHandler(err, req, res))
})

router.get('/profile/:key', (req, res) => {
  User.findOne({ id: req.user.id })
    .then(user => {
      res.json({ key: req.params.key, value: user.profile[req.params.key] || null })
    })
    .catch(err => errorHandler(err, req, res))
})

router.post('/profile/:key', (req, res) => {
  User.findOne({ id: req.user.id })
    .then(user => {
      user.profile[req.params.key] = req.body.value
      user.save(err => {
        if (err) return errorHandler(err, req, res)
        res.json({ message: 'Profile updated' })
      })
    })
    .catch(err => errorHandler(err, req, res))
})

router.get('/username', (req, res) => {
  User.findOne({ id: req.user.id }).select('username')
    .then(user => {
      res.json(user.username)
    })
    .catch(err => errorHandler(err, req, res))
})

router.get('/username/availability', (req, res) => {
  User.countDocuments({ username: req.body.username })
    .then(count => {
      if (count !== 0) return res.status(406).json({ error: 'Username is unavailable' })
      return res.json({ message: 'Username is available' })
    })
    .catch(err => errorHandler(err, req, res))
})

router.patch('/username', (req, res) => {
  User.countDocuments({ username: req.body.username })
    .then(count => {
      if (count !== 0) return res.status(406).json({ error: 'Username is unavailable' })
      User.findOneAndUpdate({ id: req.user.id }, { username: req.body.username })
        .then(user => {
          return res.json({ message: 'Username updated successfully' })
        })
        .catch(err => errorHandler(err, req, res))
    })
})

router.post('/update-password', (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body

  User.findOne({ id: req.user.id })
    .then(user => {
      if (user.validPassword(currentPassword)) {
        if (newPassword === confirmPassword) {
          bcrypt.hash(newPassword, 10, (err, hash) => {
            if (err) {
              req.Log.error(err)
              return res.status(500).json({ error: 'Error hashing your password' })
            }

            user.password = hash
            user.save(err => {
              if (err) return res.status(500).json({ error: 'There was an error saving your new password' })
              return res.json({ message: 'Your password has been updated!' })
            })
          })
        } else {
          return res.status(400).json({ error: 'New passwords did not match' })
        }
      } else {
        return res.status(400).json({ error: 'Current password is invalid' })
      }
    })
})

export default router
