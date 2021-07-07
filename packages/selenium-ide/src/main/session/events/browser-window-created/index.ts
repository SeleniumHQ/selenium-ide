import { Session } from 'main/types'
import WindowEntry from '../../classes/windows/Entry'

export default (session: Session) => {
  const { app, windows } = session
  app.on('browser-window-created', (_event, window) => {
    const entry = new WindowEntry(session, window)
    session.windows.create(entry)
    const { id } = entry
    window.on('closed', () => {
      if (windows.has(id)) {
        windows.delete(id)
      }
      windows.onDelete(id)
    })
    window.on('focus', () => {
      windows.onSelect(entry.id)
    })
    window.on('ready-to-show', () => {
      window.show()
      window.focus()
    })
  })
}
