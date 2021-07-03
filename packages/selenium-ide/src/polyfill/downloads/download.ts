import browserHandler from 'browser/helpers/Handler'
import { promises as fs } from 'fs'
import mainHandler from 'main/helpers/Handler'

let counter = 0
export interface DownloadsDownloadOpts {
  body: string
  conflictAction: 'uniquify' | 'overwrite' | 'prompt'
  filename: string
  headers: { name: string; value: string }[]
  method: 'GET' | 'POST'
  saveAs: boolean
  url: string
}
export type Shape = (opts: DownloadsDownloadOpts) => Promise<number>

export const browser = browserHandler<Shape>()

const getUniqueFilename = (filename: string) => {
  const parts = filename.split('.')
  return `${parts[0]}${counter++}.${parts[1]}`
}

export const main = mainHandler<Shape>(
  (_path, _session) =>
    async ({ filename, body, conflictAction }) => {
      const uniqueFilename =
        conflictAction === 'uniquify' ? getUniqueFilename(filename) : filename
      await fs.writeFile(uniqueFilename, body, 'utf8')
      return 1
    }
)
