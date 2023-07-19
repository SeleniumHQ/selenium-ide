import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import fs from 'fs'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import kebabCase from 'lodash/fp/kebabCase'
import path from 'path'
import {
  Configuration,
  SourceMapDevToolPlugin,
  WebpackPluginInstance,
} from 'webpack'

const commonPlugins: WebpackPluginInstance[] = [
  new ForkTsCheckerWebpackPlugin(),
  new SourceMapDevToolPlugin({
    filename: '[file].map',
  }),
]
const commonConfig: Pick<
  Configuration,
  'devtool' | 'externals' | 'mode' | 'module' | 'resolve' | 'output'
> = {
  devtool: 'source-map',
  externals: ['utf-8-validate', 'bufferutil'],
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        exclude: [/selenium-ide\/dist/, /selenium-ide\/build/, /node_modules/],
        test: /\.js$/,
        loader: 'source-map-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    alias: {
      api: path.resolve(__dirname, 'src/api'),
      browser: path.resolve(__dirname, 'src/browser'),
      main: path.resolve(__dirname, 'src/main'),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
}

// Our renderer and preload files
const windowData = fs
  .readdirSync(path.join(__dirname, 'src', 'browser', 'windows'))
  .map((filename) => [
    kebabCase(filename),
    path.join(__dirname, 'src', 'browser', 'windows', filename),
  ])

// Preload entries
const preloadEntries = windowData
  .filter(([, filepath]) => fs.existsSync(path.join(filepath, 'preload.ts')))
  .map(([name, filepath]) => [
    `${name}-preload`,
    path.join(filepath, 'preload.ts'),
  ])

const preloadConfig: Configuration = {
  ...commonConfig,
  entry: Object.fromEntries(preloadEntries),
  plugins: commonPlugins,
  target: 'electron-preload',
}

// Renderer entries
const rendererEntries = windowData
  .filter(([, filepath]) => fs.existsSync(path.join(filepath, 'renderer.tsx')))
  .map(([name, filepath]) => [
    `${name}-renderer`,
    path.join(filepath, 'renderer.tsx'),
  ])

const rendererConfig: Configuration = {
  ...commonConfig,
  entry: Object.fromEntries(rendererEntries),
  plugins: commonPlugins.concat(
    Object.values(rendererEntries).map(
      ([filename]) =>
        getBrowserPlugin(filename) as unknown as WebpackPluginInstance
    ),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/browser/*.css',
          to: '[name].css',
        },
      ],
    })
  ),
  target: 'electron-renderer',
}

const mainConfig: Configuration = {
  ...commonConfig,
  entry: {
    main: path.join(__dirname, 'src', 'main', 'index.ts'),
  },
  plugins: commonPlugins,
  target: 'electron-main',
}

export default [mainConfig, preloadConfig, rendererConfig]

function getBrowserPlugin(filename: string) {
  const componentName = filename.slice(0, -9)
  const pluginHTML = new HtmlWebpackPlugin({
    filename: `${componentName}.html`,
    inject: false,
    templateContent: () => `
      <!doctype html>
      <html>
        <head>
          <link rel="stylesheet" href="index.css" type="text/css">
          <script defer src="${filename}-bundle.js"></script>
        </head>
        <body>
          <div id="root">
            <div id="loading"></div>
          </div>
        </body>
      </html>
    `,
  })
  return pluginHTML
}
