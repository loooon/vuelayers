// This the Webpack config for building UMD all-in-one lib
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const utils = require('./utils')
const config = require('./config')
const baseWebpackConfig = require('./webpack.base.conf')

const isProduction = process.env.NODE_ENV === 'production'

const webpackConfig = merge(baseWebpackConfig, {
  devtool: '#source-map',
  output: {
    filename: isProduction ? '[name].min.js' : '[name].js',
    library: config.fullname,
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: utils.vueLoaderConfig(true)
      },
      ...utils.styleLoaders({
        sourceMap: true,
        extract: isProduction
      })
    ]
  },
  externals: {
    vue: {
      root: 'Vue',
      amd: 'vue',
      commonjs: 'vue',
      commonjs2: 'vue'
    }
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
      PKG_NAME: `'${config.name}'`,
      PKG_FULLNAME: `'${config.fullname}'`,
      PKG_VERSION: `'${config.version}'`
    }),
    ...( isProduction ? [ new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: {
        warnings: false
      },
      sourceMap: true
    }) ] : [] ),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: isProduction ? '[name].min.css' : '[name].css'
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin()
  ]
})

module.exports = (env = {}) => {
  if (env.report) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
  }

  return webpackConfig
}
