import storage from '../../../store'
import { Session } from 'main/types'

export default class PluginsController {
  constructor(session: Session) {
    this.session = session
  }
  session: Session
  async attach(filepath: string) {
    const plugins = storage.get<'plugins'>('plugins', [])
    if (plugins.indexOf(filepath) !== -1) return true
    storage.set<'plugins'>('plugins', plugins.concat(filepath))
    return true
  }
  async detach(filepath: string) {
    const plugins = storage.get<'plugins'>('plugins', [])
    const index = plugins.indexOf(filepath)
    if (index === -1) return true
    storage.set<'plugins'>('plugins', plugins.splice(index, 1))
    return true
  }
  async list() {
    return storage.get<'plugins'>('plugins')
  }
}
