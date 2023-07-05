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

export const registerHandlebarFileTemplateAsHelper = async (
  folderPath: string
) => {
  const filenames = await readdir(folderPath)
  const paths = filenames.map((file) => `${folderPath}${sep}${file}`)
  const files = await Promise.all(
    paths.map((path) =>
      path.endsWith('.handlebars') ? readFile(path) : import(path)
    )
  )
  filenames.forEach((name, index) => {
    const file = files[index]
    const isHandlebarTemplate = name.endsWith('.handlebars')
    if (!isHandlebarTemplate) {
      handlebar.registerHelper(name, file.default)
      return
    }
    const template = handlebar.compile(file.toString())
    handlebar.registerHelper(file.name, template)
  })
}

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
  registerHandlebarFileTemplateAsHelper(`${folderPath}${sep}syntax`)
}
