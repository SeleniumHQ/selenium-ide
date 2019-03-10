const fs = require('fs')
const path = require('path')

module.exports = {
  babelrcRoots: fs
    .readdirSync('packages')
    .map(dirname => path.join(process.cwd(), 'packages', dirname))
    .filter(dirpath => {
      const stats = fs.statSync(dirpath)

      return stats.isDirectory()
    }),
}
