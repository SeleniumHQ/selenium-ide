const runCommand = require('../helpers/runCommand')

runCommand('yarn', ['build']).then(process.exit)
