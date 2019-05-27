import mongoose from 'mongoose'

const Schema = mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true })

Schema.index({ createdAt: 1 }, { expires: process.env.JWT_TIMEOUT || '1h' })

export default mongoose.model('TokenWhitelist', Schema)
