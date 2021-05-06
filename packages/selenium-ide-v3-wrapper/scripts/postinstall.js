const runCommand = require('../helpers/runCommand')

runCommand('peru', ['sync']).then(code => {
  if (code) return process.exit(code)
  runCommand('yarn').then(process.exit)
})
