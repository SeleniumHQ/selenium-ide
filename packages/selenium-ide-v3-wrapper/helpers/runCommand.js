const { spawn } = require('child_process')
const { join } = require('path')

const seleniumDir = join(process.cwd(), 'node_modules', 'selenium-ide')
module.exports = (command, args = []) => {
  console.log('Running', command, 'in', seleniumDir)
  return new Promise(resolve => {
    const build = spawn(command, args, {
      cwd: seleniumDir,
      env: process.env,
      stdio: 'inherit',
    })
    build.on('exit', code => resolve(code))
  })
}
