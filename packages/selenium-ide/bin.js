#!/usr/bin/env node
const { join } = require('path')
const { spawn } = require('child_process')

const { execSync } = require('child_process')
const fs = require('fs/promises')

async function installElectron() {
  // Read package.json
  const packageJson = JSON.parse(
    await fs.readFile(join(__dirname, 'package.json'), 'utf8')
  )
  // Get the Electron version from package.json
  const electronVersion = packageJson.devDependencies.electron

  // Install Electron
  console.log(`Installing Electron ${electronVersion}...`)
  execSync(`npm i electron@${electronVersion}`, {
    cwd: __dirname,
    stdio: 'inherit',
  })
  console.log('Electron installed successfully.')
}

const main = async () => {
  let electronPath
  try {
    electronPath = require('electron')
  } catch (e) {
    await installElectron()
  }
  electronPath = require('electron')
  const appPath = join(__dirname, 'build', 'main-bundle.js')
  const electronProcess = spawn(electronPath, [appPath])
  electronProcess.stdout.on('data', (data) => process.stdout.write(data))
  electronProcess.stderr.on('data', (data) => process.stderr.write(data))
  electronProcess.on('close', (code) => process.exit(code))
}

main()
