#!/usr/bin/env node
import fs from 'fs'
import UpgradeProject from './migrate'

const inputFilepath = process.argv[2]
const outputFilepath = process.argv[3]
console.log(process.argv)
if (!inputFilepath) {
  throw new Error('No input file path provided')
}
if (!outputFilepath) {
  throw new Error('No output file path provided')
}
if (!inputFilepath.endsWith('.side')) {
  throw new Error('Input file path must be a .side file')
}

const project = JSON.parse(fs.readFileSync(inputFilepath, 'utf8'))
const newProject = UpgradeProject(project)

fs.writeFileSync(outputFilepath, JSON.stringify(newProject, null, 2))

console.log(
  `Upgraded ${inputFilepath} to version ${newProject.version} and saved to ${outputFilepath}`
)
