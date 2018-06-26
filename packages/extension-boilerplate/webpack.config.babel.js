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

import path from "path";
import webpack from "webpack";
import ExtractTextPlugin from "extract-text-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import autoprefixer from "autoprefixer";

const isProduction = process.env.NODE_ENV === "production";

export default {
  context: path.resolve(__dirname, "src"),
  devtool: isProduction ? "source-map" : false,
  entry: {
    content: ["./content"],
    background: ["./background"]
  },
  output: {
    path: path.resolve(__dirname, "build/assets"),
    filename: "[name].js",
    publicPath: "/assets/",
    libraryTarget: "umd"
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"]
  },
  module: {
    rules: [
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          // "url" loader works just like "file" loader but it also embeds
          // assets smaller than specified size as data URLs to avoid requests.
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: "url-loader",
            options: {
              limit: 10000,
              name: "media/[name].[hash:8].[ext]"
            }
          },
          // Process JS with Babel.
          {
            test: /\.(jsx?)$/,
            include: [
              path.resolve(__dirname, "src")
            ],
            use: [
              {
                loader: "babel-loader",
                options: {
                  compact: true
                }
              }
            ]
          },
          // Process css
          {
            test: /\.css$/,
            loader: [
              require.resolve("style-loader"),
              {
                loader: require.resolve("css-loader"),
                options: {
                  importLoaders: 1
                }
              },
              {
                loader: require.resolve("postcss-loader"),
                options: {
                  // Necessary for external CSS imports to work
                  // https://github.com/facebookincubator/create-react-app/issues/2677
                  ident: "postcss",
                  plugins: () => [
                    require("postcss-flexbugs-fixes"),
                    autoprefixer({
                      browsers: [
                        ">1%",
                        "last 4 versions",
                        "Firefox ESR",
                        "not ie < 9" // React doesn't support IE8 anyway
                      ],
                      flexbox: "no-2009"
                    })
                  ]
                }
              }
            ]
            // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
          },
          // "file" loader makes sure assets end up in the `build` folder.
          // When you `import` an asset, you get its filename.
          // This loader don't uses a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            loader: "file-loader",
            // Exclude `js` files to keep "css" loader working as it injects
            // it's runtime that would otherwise processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/\.jsx?$/, /\.html$/, /\.json$/],
            options: {
              name: "media/[name].[hash:8].[ext]"
            }
          }
          // ** STOP ** Are you adding a new loader?
          // Make sure to add the new loader(s) before the "file" loader.
        ]
      }
    ]
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    // Copy non-umd assets to vendor
    new CopyWebpackPlugin([
      { from: "manifest.json", to: "../" },
      { from: "icons", to: "../icons" }
    ]),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
    // It is absolutely essential that NODE_ENV was set to production here.
    new webpack.DefinePlugin({
      "process.env": {
        "NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        "SIDE_ID": JSON.stringify(process.env.SIDE_ID)
      }
    }),
    // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
    new ExtractTextPlugin({
      filename: "css/[name].[hash:8].css"
    }),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
};
