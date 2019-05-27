import mongoose from 'mongoose'

const Schema = mongoose.Schema({
  id: { type: String, index: true, unique: true }
}, { timestamps: true })

export default mongoose.model('BlogPost', Schema)
