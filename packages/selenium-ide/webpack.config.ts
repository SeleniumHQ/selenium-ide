import fs from 'fs'
import path from 'path'
import kebabCase from 'lodash/fp/kebabCase'
// eslint-disable-next-line node/no-unpublished-import
import HtmlWebpackPlugin from 'html-webpack-plugin'

interface BaseParameters {
  entry: string
  filename: string
  target: string
}

// Our main process
const configs = [
  {
    entry: path.join(__dirname, 'src', 'main', 'index.ts'),
    filename: 'main',
    target: 'electron-main',
  },
]

const windows = fs.readdirSync(
  path.join(__dirname, 'src', 'browser', 'windows')
)
windows.forEach((element) => {
  const elementPath = path.join(__dirname, 'src', 'browser', 'windows', element)
  const preloadPath = path.join(elementPath, 'preload.ts')
  const filecaseElement = kebabCase(element)
  if (fs.existsSync(preloadPath)) {
    configs.push({
      entry: preloadPath,
      filename: `${filecaseElement}-preload`,
      target: 'electron-preload',
    })
  }
  const rendererPath = path.join(elementPath, 'renderer.tsx')
  if (fs.existsSync(rendererPath)) {
    configs.push({
      entry: rendererPath,
      filename: `${filecaseElement}-renderer`,
      target: 'electron-renderer',
    })
  }
})

module.exports = configs.map(getConfig)

function getConfig({ entry, filename, target }: BaseParameters) {
  return {
    entry,
    // Workaround for ws module trying to require devDependencies
    externals: ['utf-8-validate', 'bufferutil'],
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader',
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
    plugins: filename.includes('renderer') ? getBrowserPlugins(filename) : [],
    output: {
      filename: `${filename}-bundle.js`,
      path: path.resolve(__dirname, 'dist'),
    },
    target,
  }
}

function getBrowserPlugins(filename) {
  const pluginHTML = new HtmlWebpackPlugin({
    filename: `${filename.slice(0, -9)}.html`,
    inject: false,
    templateContent: () => `
      <html>
        <head>
          <script defer src="${filename}-bundle.js"></script>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `,
  })
  return [pluginHTML]
}
