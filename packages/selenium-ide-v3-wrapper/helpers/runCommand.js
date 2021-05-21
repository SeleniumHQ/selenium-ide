const { spawn } = require('child_process')
const seleniumIDEV3RepoPath = require('../constants/repoPath')

module.exports = (command, args = []) => {
  console.log('Running', command, 'in', seleniumIDEV3RepoPath)
  return new Promise(resolve => {
    const build = spawn(command, args, {
      cwd: seleniumIDEV3RepoPath,
      env: process.env,
      stdio: 'inherit',
    })
    build.on('exit', code => resolve(code))
  })
}
