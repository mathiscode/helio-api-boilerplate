/* global describe, it */

import chai from 'chai'
import http from 'chai-http'

import app from '../src/index.js'

chai.use(http)
chai.should()

app.initializeServer()

describe('Helio', () => {
  describe('GET /', () => {
    it('should get 200', done => {
      chai.request(app)
        .get('/')
        .end((err, res) => {
          if (err) throw err
          res.should.have.status(200)
          res.body.should.be.a('object')
          return done()
        })
    })
  })

  describe('GET /user', () => {
    it('should get 401 due to invalid token', done => {
      chai.request(app)
        .get('/user')
        .end((err, res) => {
          if (err) throw err
          res.should.have.status(401)
          return done()
        })
    })
  })
})
