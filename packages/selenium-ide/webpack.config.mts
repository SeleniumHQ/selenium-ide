import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import fs from 'fs'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import kebabCase from 'lodash/fp/kebabCase.js'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import { fileURLToPath } from 'url'
import webpack from 'webpack'
import type { Configuration, WebpackPluginInstance } from 'webpack'
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'

const { SourceMapDevToolPlugin } = webpack
const __dirname = import.meta.dirname

const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = !isProduction
const useHMR = process.env.SIDE_DEV === '1' && isDevelopment

const commonPlugins: WebpackPluginInstance[] = [
  new ForkTsCheckerWebpackPlugin(),
  new SourceMapDevToolPlugin({
    filename: '[file].map',
  }),
]
if (isProduction) {
  commonPlugins.push(new MiniCssExtractPlugin())
}

const commonConfig: Pick<
  Configuration,
  'devtool' | 'externals' | 'mode' | 'module' | 'resolve' | 'output'
> & {
  devServer?: DevServerConfiguration
} = {
  // Source maps come from SourceMapDevToolPlugin above
  devtool: false,
  externals: ['utf-8-validate', 'bufferutil'],
  mode: isProduction ? 'production' : 'development',
  module: {
    rules: [
      {
        exclude: [/selenium-ide\/dist/, /selenium-ide\/build/, /node_modules/],
        test: /\.js$/,
        loader: 'source-map-loader',
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: fileURLToPath(import.meta.resolve('ts-loader')),
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.css$/i,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
        ],
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
      '@mui/base': '@mui/base/modern',
      '@mui/material': '@mui/material/modern',
      '@mui/styled-engine': '@mui/styled-engine/modern',
      '@mui/system': '@mui/system/modern',
      '@mui/utils': '@mui/utils/modern',
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
  .filter((filename) => filename !== 'PlaybackWindowBidi')
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
  devServer: useHMR
    ? {
        devMiddleware: {
          writeToDisk: true,
        },
        hot: isDevelopment,
        port: 8083,
      }
    : undefined,
  entry: Object.fromEntries(rendererEntries),
  plugins: commonPlugins.concat(
    Object.values(rendererEntries).map(
      ([filename]) =>
        getBrowserPlugin(filename) as unknown as WebpackPluginInstance
    )
  ),
  target: 'electron-renderer',
}

const playbackPreloadBidiConfig: Configuration = {
  ...commonConfig,
  entry: {
    'playback-window-bidi-preload': path.join(
      __dirname,
      'src',
      'browser',
      'windows',
      'PlaybackWindowBidi',
      'preload.ts'
    ),
  },
  plugins: commonPlugins,
  target: 'web',
}

const playbackRendererBidiConfig: Configuration = {
  ...commonConfig,
  entry: {
    'playback-window-bidi-renderer': path.join(
      __dirname,
      'src',
      'browser',
      'windows',
      'PlaybackWindowBidi',
      'renderer.tsx'
    ),
  },
  plugins: commonPlugins
    .concat(
      getBrowserPlugin(
        'playback-window-bidi'
      ) as unknown as WebpackPluginInstance
    )
    .concat(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/browser/*.css',
            to: '[name].css',
          },
        ],
      })
    ),
  target: 'web',
}

const mainConfig: Configuration = {
  ...commonConfig,
  entry: {
    main: path.join(__dirname, 'src', 'main', 'index.ts'),
  },
  plugins: commonPlugins,
  target: 'electron-main',
  // These modules load files at runtime on purpose, so webpack can't bundle them:
  // - side-runtime's plugin loader falls back to require(), but the IDE passes
  //   its own loader
  // - selenium-webdriver falls back to atoms in bazel-bin, which only exists in
  //   Selenium's source tree
  // - v8-compile-cache patches Node's module loader
  ignoreWarnings: [
    /side-runtime[\\/]dist[\\/]plugins\.js$/,
    /selenium-webdriver[\\/]lib[\\/]http\.js$/,
    /v8-compile-cache[\\/]v8-compile-cache\.js$/,
  ].map((module) => ({ module, message: /Critical dependency/ })),
}

export default [
  rendererConfig,
  preloadConfig,
  playbackPreloadBidiConfig,
  playbackRendererBidiConfig,
  mainConfig,
]

function getBrowserPlugin(filename: string) {
  const componentName = filename.slice(0, -9)
  const pluginHTML = new HtmlWebpackPlugin({
    filename: `${componentName}.html`,
    inject: false,
    templateContent: () => `
      <!doctype html>
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <link rel="stylesheet" href="index.css" type="text/css">
          ${
            isProduction
              ? `<link rel="stylesheet" href="${filename}.css" type="text/css">\n`
              : ''
          }
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
