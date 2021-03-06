/* global before, describe, it */

import chai from 'chai'
import http from 'chai-http'
import newman from 'newman'

import Helio from '../src/index.js'

chai.use(http)
chai.should()

const helio = new Helio({ noListen: true })
const { app } = helio

describe('Helio', () => {
  before(done => {
    helio.listen(listener => {
      console.log('  Ephemeral Port:', listener.address().port)
      return done()
    })
  })

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

  describe('Newman Tests', () => {
    it('should run the Users collection successfully', done => {
      const environment = require('./postman/postman_environment.json')
      environment.values.find(val => val.key === 'baseUrl').value = `http://localhost:${helio.port}`

      newman.run({
        collection: './test/postman/collections/UsersMod.json',
        environment: environment,
        reporters: 'cli',
        reporter: {
          cli: { noBanner: true, noSummary: true }
        }
      }, (err, summary) => {
        if (err) return done(err)
        if (summary.run.failures.length) return done(new Error('Newman tests failed'))
        return done()
      })
    }).timeout(30000)
  })
})
