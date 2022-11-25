import { promises as fs, existsSync as fsExistsSync } from 'fs'
import path from 'path'

export { emitSuite } from './emit-suite'
export { emitTest } from './emit-test'

export interface FileWriterOpts {
  filename: string
  projectPath: string
}

export async function writeFile(
  relativeOrAbsoluteFilepath: string,
  file: string,
  basePath: string = process.cwd()
) {
  const filepath = path.resolve(basePath, relativeOrAbsoluteFilepath)
  const dir = path.dirname(filepath)
  if (!fsExistsSync(dir)) {
    await fs.mkdir(dir, { recursive: true })
  }
  await fs.writeFile(filepath, file)
}
