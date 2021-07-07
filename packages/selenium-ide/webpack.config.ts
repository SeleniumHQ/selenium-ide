const path = require('path')

const base = ({ entry, filename, target }) => ({
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
        test: /\.(sass|scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    alias: {
      browser:
        filename === 'main'
          ? path.resolve(__dirname, 'src/stub')
          : path.resolve(__dirname, 'src/browser'),
      main:
        filename === 'main'
          ? path.resolve(__dirname, 'src/main')
          : path.resolve(__dirname, 'src/stub'),
      polyfill: path.resolve(__dirname, 'src/polyfill'),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: `${filename}-bundle.js`,
    path: path.resolve(__dirname, 'dist'),
  },
  target,
})

const preloadConfig = {
  entry: path.join(__dirname, 'src', 'browser', 'preload', 'index.ts'),
  filename: 'preload',
  target: 'electron-preload',
}
const rendererConfig = {
  entry: path.join(__dirname, 'src', 'browser', 'renderer', 'index.ts'),
  filename: 'renderer',
  target: 'electron-renderer',
}
const mainConfig = {
  entry: path.join(__dirname, 'src', 'main', 'index.ts'),
  filename: 'main',
  target: 'electron-main',
}
module.exports = [preloadConfig, rendererConfig, mainConfig].map(base)
