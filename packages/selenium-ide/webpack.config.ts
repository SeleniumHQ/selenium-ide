import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import fs from 'fs'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import kebabCase from 'lodash/fp/kebabCase'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
// eslint-disable-next-line node/no-unpublished-import
import ReactRefreshTypeScript from 'react-refresh-typescript'
import {
  Configuration,
  SourceMapDevToolPlugin,
  WebpackPluginInstance,
} from 'webpack'
// eslint-disable-next-line node/no-unpublished-import
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'

const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = !isProduction

const commonPlugins: WebpackPluginInstance[] = [
  new ForkTsCheckerWebpackPlugin(),
  new SourceMapDevToolPlugin({
    filename: '[file].map',
  }),
]
if (isProduction) {
  commonPlugins.push(new MiniCssExtractPlugin())
}
if (isDevelopment) {
  commonPlugins.push(new ReactRefreshWebpackPlugin())
}

const commonConfig: Pick<
  Configuration,
  'devtool' | 'externals' | 'mode' | 'module' | 'resolve' | 'output'
> & {
  devServer?: DevServerConfiguration
} = {
  devServer: {
    hot: isDevelopment,
    port: 8081,
  },
  devtool: 'source-map',
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
        // eslint-disable-next-line node/no-unpublished-require
        loader: require.resolve('ts-loader'),
        options: {
          getCustomTransformers: () => ({
            before: [isDevelopment && ReactRefreshTypeScript()].filter(Boolean),
          }),
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
  devServer: {
    ...commonConfig.devServer,
    port: 8083,
  },
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
  devServer: {
    ...commonConfig.devServer,
    port: 8084,
  },
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
  devServer: {
    ...commonConfig.devServer,
    port: 8085,
  },
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
  devServer: {
    ...commonConfig.devServer,
    port: 8086,
  },
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
  devServer: {
    ...commonConfig.devServer,
    port: 8087,
  },
  entry: {
    main: path.join(__dirname, 'src', 'main', 'index.ts'),
  },
  plugins: commonPlugins,
  target: 'electron-main',
}

export default [
  mainConfig,
  preloadConfig,
  rendererConfig,
  playbackPreloadBidiConfig,
  playbackRendererBidiConfig,
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
