import { Session } from '../../../types/server'

export default ({ window }: Session) => async (path: string) =>
  await window.webContents.session.loadExtension(path)
