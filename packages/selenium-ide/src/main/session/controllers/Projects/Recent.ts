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

const removeOne=(list: string[], entry: string)=>{
  const entryIndex = list.indexOf(entry)
  const entryIsIndexed = entryIndex !== -1
  if (entryIsIndexed) {
    list.splice(entryIndex, 1)
  }
  return list
}

export default class RecentProjectsController extends BaseController {
  add(filepath: string) {
    const entries = this.session.store.get('recentProjects')
    const newEntries = addToBeginning(entries, filepath)
    this.session.store.set('recentProjects', newEntries)
    this.session.app.addRecentDocument(filepath)
  }
  remove(filepath: string) {
    const entries = this.session.store.get('recentProjects')
    const newEntries = removeOne(entries, filepath)
    this.session.store.set('recentProjects', newEntries)
    this.session.app.clearRecentDocuments()
    return newEntries
  }
  clear() {
    this.session.store.set('recentProjects', [])
    this.session.app.clearRecentDocuments()
    return true
  }
  get(): string[] {
    return this.session.store.get('recentProjects', [])
  }
}
