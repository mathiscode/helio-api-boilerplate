const Package = require('./package.json')

const path = require('path')
const nodeExternals = require('webpack-node-externals')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const CreateFileWebpack = require('create-file-webpack')

module.exports = {
  target: 'node',
  mode: 'production',
  externals: [nodeExternals()],

  node: {
    __filename: false,
    __dirname: false
  },

  entry: {
    index: './src/index.js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
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
      { from: 'src/bin/helio', to: 'bin' },
      { context: 'src/assets', from: '**/*', to: 'assets' }
    ]),

    new CreateFileWebpack({
      path: './dist',
      fileName: 'version.json',
      content: `"${Package.version}"`
    })
  ]
}
