import storage from 'main/store'
import BaseController from '../Base'

const addToBeginning = (prevList: string[], entry: string) => {
  const list = prevList.slice()
  const entryIndex = list.indexOf(entry)
  const entryIsIndexed = entryIndex !== -1
  if (entryIsIndexed) {
    list.splice(entryIndex, 1)
  }
  list.unshift(entry)
  while (list.length > 10) {
    list.pop()
  }
  return list
}

export default class RecentProjectsController extends BaseController {
  add(filepath: string) {
    const entries = storage.get<'recentProjects'>('recentProjects', [])
    const newEntries = addToBeginning(entries, filepath)
    storage.set<'recentProjects'>('recentProjects', newEntries)
    this.session.app.addRecentDocument(filepath)
  }
  clear() {
    storage.set<'recentProjects'>('recentProjects', [])
    this.session.app.clearRecentDocuments()
    return true
  }
  get(): string[] {
    return storage.get<'recentProjects'>('recentProjects', [])
  }
}
