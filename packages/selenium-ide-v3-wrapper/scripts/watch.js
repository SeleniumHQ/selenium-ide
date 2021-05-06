const runCommand = require('../helpers/runCommand')

runCommand('yarn', ['watch']).then(process.exit)
