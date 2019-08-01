// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

const path = require('path')
//const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  context: path.resolve(__dirname, 'src'),
  devtool: isProduction ? 'source-map' : 'eval',
  mode: isProduction ? 'production' : 'development',
  entry: {
    background: ['./background'],
    record: ['./content'],
  },
  output: {
    path: path.resolve(__dirname, 'build/assets'),
    filename: '[name].js',
    publicPath: '/assets/',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  module: {
    rules: [
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          // Process JS with Babel.
          {
            test: /\.(js)$/,
            include: [path.resolve(__dirname, 'src')],
            use: [
              {
                loader: 'babel-loader',
                options: {
                  compact: true,
                },
              },
            ],
          },
          // "file" loader makes sure assets end up in the `build` folder.
          // When you `import` an asset, you get its filename.
          // This loader don't uses a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            loader: 'file-loader',
            // Exclude `js` files to keep "css" loader working as it injects
            // it's runtime that would otherwise processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            options: {
              name: 'media/[name].[hash:8].[ext]',
            },
          },
          // ** STOP ** Are you adding a new loader?
          // Make sure to add the new loader(s) before the "file" loader.
        ],
      },
    ],
  },
  plugins: (isProduction
    ? [
        new UglifyJsPlugin({
          uglifyOptions: {
            warnings: false, // Suppress uglification warnings
            ecma: 6,
            compress: {
              ecma: 6,
              evaluate: false,
            },
            output: {
              ecma: 6,
              comments: false,
              beautify: false,
              ascii_only: true,
            },
          },
          sourceMap: true,
          exclude: [/\.min\.js$/gi], // skip pre-minified libs
        }),
      ]
    : []
  ).concat([
    // Copy non-umd assets to vendor
    new CopyWebpackPlugin([
      { from: 'background/config.js', to: './' },
      { from: 'content/prompt.js', to: './' },
      { from: 'content/highlight.css', to: './' },
      { from: 'manifest.json', to: '../' },
      { from: 'icons', to: '../icons' },
    ]),
    // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
    /*new ExtractTextPlugin({
      filename: 'css/[name].[hash:8].css',
    }),*/
  ]),
}
