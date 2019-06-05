const path = require('path')
const nodeExternals = require('webpack-node-externals')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  target: 'node',
  mode: 'production',
  externals: [nodeExternals()],

  entry: {
    index: './src/index.js'
  },

  output: {
    filename: '[name].js',
    library: 'Helio',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  },

  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin([
      { from: 'src/server.js', to: 'server.js' }
    ])
  ]
}
