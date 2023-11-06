import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import fs from 'fs'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import kebabCase from 'lodash/fp/kebabCase'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import {
  Configuration,
  SourceMapDevToolPlugin,
  WebpackPluginInstance,
} from 'webpack'

const isProduction = process.env.NODE_ENV === 'production'

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
> = {
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
        loader: 'ts-loader',
        exclude: /node_modules/,
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
  const title =
    componentName === 'playback-window'
      ? ''
      : componentName
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
  const pluginHTML = new HtmlWebpackPlugin({
    filename: `${componentName}.html`,
    inject: false,
    templateContent: () => `
      <!doctype html>
      <html>
        <head>
          ${title ? `<title>${title}</title>` : ''}
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
