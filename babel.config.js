const fs = require('fs')
const path = require('path')

module.exports = {
  babelrcRoots: fs
    .readdirSync(path.join(__dirname, 'packages'))
    .map(dirname => path.join(__dirname, 'packages', dirname))
    .filter(dirpath => {
      const stats = fs.statSync(dirpath)

      return stats.isDirectory()
    }),
  overrides: [
    {
      presets: ['@babel/preset-typescript'],
      test: /\.tsx?$/,
    },
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '8',
        },
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-class-properties',
  ],
}
