import seleniumIDEV3DistPath from '@seleniumhq/selenium-ide-v3-wrapper/constants/distPath'
import { Api } from '../types'

export default async function buildExtension(
  api: Api
): Promise<Electron.Extension> {
  return await api.server.extensions.load(seleniumIDEV3DistPath)
}
