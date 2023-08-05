#!/usr/bin/env node
import fs from 'fs'
import UpgradeProject from './migrate'

const filepath = process.env[1]

if (!filepath) {
  throw new Error('No file path provided')
}
if (!filepath.endsWith('.side')) {
  throw new Error('File path must be a .side file')
}

const project = JSON.parse(fs.readFileSync(filepath, 'utf8'))
const newProject = UpgradeProject(project)

fs.writeFileSync(filepath, JSON.stringify(newProject, null, 2))

console.log(`Upgraded ${filepath} to version ${newProject.version}`)
