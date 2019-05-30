const path = require('path')
const nodeExternals = require('webpack-node-externals')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  target: 'node',
  mode: 'production',
  externals: [nodeExternals()],

  entry: {
    app: './src/index.js'
  },

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },

  plugins: [
    new CleanWebpackPlugin()
  ]
}
