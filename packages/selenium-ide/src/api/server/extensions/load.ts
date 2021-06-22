import { Session } from '../../../types/server'

export default (session: Session) => async (path: string) =>
  await session.window.webContents.session.loadExtension(path)
