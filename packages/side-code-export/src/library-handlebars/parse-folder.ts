import { readFile, readdir } from 'fs/promises'
import handlebar from 'handlebars'
import { sep } from 'path'

const requiredDirectories = [
  'commands',
  'control_flow',
  'extras',
  'hooks',
  'locators',
  'selection',
  'syntax',
]

export const helperFromTemplate = (template: string) => {
  const compiled = handlebar.compile(template)
  handlebar.registerHelper(template, compiled)
}

export const registerHandlebarFileTemplateAsHelper = async (path: string) => {
  const name = path.split(sep).pop()?.split('.')[0]
  const extension = path.split('.').pop()
  switch (extension) {
    case 'handlebars':
      handlebar.registerHelper(
        name!,
        handlebar.compile(await readFile(path, 'utf8'))
      )
      break
    case 'js':
      handlebar.registerHelper(name!, (await import(path)).default)
      break
    default:
      throw new Error(`Unsupported file extension: ${extension}`)
  }
}

export const collectFilepaths = async (folderPath: string): Promise<string[]> =>
  (await readdir(folderPath)).map((file) => `${folderPath}${sep}${file}`)

export const parseFormat = async (folderPath: string) => {
  const tld = await readdir(folderPath)
  const directories = tld.filter((file) => requiredDirectories.includes(file))
  requiredDirectories.forEach((directory) => {
    if (!directories.includes(directory)) {
      throw new Error(
        `Missing required directory: ${directory} in ${folderPath}`
      )
    }
  })
  const syntaxHelpers = await collectFilepaths(`${folderPath}${sep}syntax`)
  await Promise.all(syntaxHelpers.map(registerHandlebarFileTemplateAsHelper))
}
