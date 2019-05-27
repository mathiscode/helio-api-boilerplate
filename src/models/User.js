import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const Schema = mongoose.Schema({
  id: { type: String, index: true, unique: true },
  username: { type: String, index: true, unique: true },
  email: { type: String, index: true, unique: true },
  password: String,

  roles: [{ type: String }],

  flags: {
    confirmed: { type: Boolean, default: false }
  },

  profile: {
    name: String
  },

  settings: {},
  clientSettings: {},
  serverSettings: {}
}, { timestamps: true })

Schema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

export default mongoose.model('User', Schema)
