import fs from 'fs'
import path from 'path'
// eslint-disable-next-line node/no-unpublished-import
import CopyWebpackPlugin from 'copy-webpack-plugin'
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

const panels = fs.readdirSync(path.join(__dirname, 'src', 'browser', 'panels'))
panels.forEach((element) => {
  const elementPath = path.join(__dirname, 'src', 'browser', 'panels', element)
  const preloadPath = path.join(elementPath, 'preload.ts')
  const filecaseElement = element
    .replace(/([A-Z])/g, '-$1')
    .slice(1)
    .toLowerCase()
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
  const tailwindDist = path.join(
    require.resolve('tailwindcss'),
    '..',
    '..',
    'dist'
  )
  const pluginCopy = new CopyWebpackPlugin({
    patterns: [
      {
        from: path.join(tailwindDist, 'tailwind.min.css'),
        to: path.join(__dirname, 'dist'),
      },
      {
        from: path.join(tailwindDist, 'tailwind-dark.min.css'),
        to: path.join(__dirname, 'dist'),
      },
    ],
  })
  const pluginHTML = new HtmlWebpackPlugin({
    filename: `${filename.slice(0, -9)}.html`,
    inject: false,
    templateContent: () => `
      <html>
        <head>
          <link rel="stylesheet" href="tailwind.min.css">
          <link rel="stylesheet" href="tailwind-dark.min.css">
          <script defer src="${filename}-bundle.js"></script>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `,
  })
  return [pluginCopy, pluginHTML]
}
