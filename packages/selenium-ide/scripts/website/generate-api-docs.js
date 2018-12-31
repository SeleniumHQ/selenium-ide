const fs = require('fs')
const path = require('path')

let Commands
let ArgTypes
let filePath

if (process.env.SCRIPT_EXEC) {
  Commands = require('./Commands').Commands
  ArgTypes = require('./ArgTypes').ArgTypes
  filePath = path.join(__dirname, '..', '..', 'docs', 'api')
} else {
  Commands = require('../../src/neo/models/Command/Commands').Commands
  ArgTypes = require('../../src/neo/models/Command/ArgTypes').ArgTypes
  filePath = path.join(__dirname, '..', '..', '..', '..', 'docs', 'api')
}

export function generateApiDocs() {
  const docs = {}
  docs['commands.md'] = generateCommandMarkdown()
  docs['arguments.md'] = generateArgumentMarkdown()
  Object.keys(docs).forEach(function(filename) {
    writeToDocsFile(filename, docs[filename])
  })
}

function writeToDocsFile(filename, data) {
  const filepath = path.join(filePath, filename)
  fs.writeFileSync(filepath, data)
}

export function generateArgumentMarkdown() {
  let result = ''
  result += `---\nid: arguments\ntitle: Arguments\nsidebar_label: Arguments\n---\n\n`
  Object.keys(ArgTypes).forEach(function(arg) {
    result += `## ${arg}\n\n`
    result += `name: ${ArgTypes[arg].name}\n\n`
    result += `description: ${cleanup(ArgTypes[arg].description)}\n`
    result += '<hr>\n\n'
  })
  return result
}

export function generateCommandMarkdown() {
  let result = ''
  result += `---\nid: commands\ntitle: Commands\nsidebar_label: Commands\n---\n\n`
  Commands.forEach(function(command) {
    const kommand = command[1]
    const params = generateCommandArguments(kommand)
    const example = generateExampleSnippet(kommand)
    result += `## \`${kommand.name}\`\n\n`
    result += `${cleanup(kommand.description)}\n\n`
    params ? (result += params) : undefined
    example ? (result += example) : undefined
    result += '<hr>\n'
    result += `\n`
  })
  return result
}

function generateExampleSnippet(command) {
  let result
  if (command.example) {
    result = `<strong>example</strong>`
    result += `\n\n`
    result += `command | target | value\n`
    result += `--- | --- | ---`
    result += `\n`
    result += `${command.example}`
    result += `\n\n`
  }
  return result
}

function generateCommandArguments(command) {
  let result = ''
  const target = generateCommandArgument(command.target)
  const value = generateCommandArgument(command.value)
  if (target || value) result += `<strong>arguments</strong>\n\n`
  target ? (result += target) : undefined
  value ? (result += value) : undefined
  return result
}

function generateCommandArgument(argument) {
  return argument
    ? `- ${crossLink(argument, 'arguments.md')}: ${argument.description}\n\n`
    : undefined
}

function cleanup(string) {
  if (string) return string.replace(/\n/g, '').replace(/\s+/g, ' ')
}

function crossLink(object, fileName) {
  return object
    ? `[${object.name}](${fileName}#${object.name.replace(/\s/g, '')})`
    : undefined
}
