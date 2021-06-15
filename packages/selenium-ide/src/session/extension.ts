import seleniumIDEV3DistPath from '@seleniumhq/selenium-ide-v3-wrapper/constants/distPath'
import { ServerApi } from './api'

export default async function buildExtension(
  api: ServerApi
): Promise<Electron.Extension> {
  return await api.server.extensions.load(seleniumIDEV3DistPath)
}
