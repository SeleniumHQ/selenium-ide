import Handler from 'browser/helpers/Handler'

export interface DownloadsDownloadOpts {
  body: string
  conflictAction: 'uniquify' | 'overwrite' | 'prompt'
  filename: string
  headers: { name: string; value: string }[]
  method: 'GET' | 'POST'
  saveAs: boolean
  url: string
}

export const browser = Handler<[DownloadsDownloadOpts], [number]>()
