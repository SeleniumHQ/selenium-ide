import { ArgTypes, Commands } from '../../src/neo/models/Command'
const fs = require('fs')
const path = require('path')

export function generateApiDocs() {
  const docs = {}
  docs['commands.md'] = generateCommandMarkdown()
  docs['arguments.md'] = generateArgumentMarkdown()
  Object.keys(docs).forEach(function(filename) {
    writeToDocsFile(filename, docs[filename])
  })
}

function writeToDocsFile(filename, data) {
  const filepath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'docs',
    'api',
    filename
  )
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
  Commands.list.keys().forEach(function(command) {
    const kommand = Commands.list.get(command)
    const params = generateCommandArguments(kommand)
    result += `## \`${kommand.name}\`\n\n`
    result += `${cleanup(kommand.description)}\n\n`
    params ? (result += params) : undefined
    result += `\n`
  })
  return result
}

function generateCommandArguments(command) {
  let result = ''
  const target = generateCommandArgument(command.target)
  const value = generateCommandArgument(command.value)
  if (target || value) result += `<strong>arguments</strong>\n\n`
  target ? (result += target) : undefined
  value ? (result += value) : undefined
  result += '<hr>\n'
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
