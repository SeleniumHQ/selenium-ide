import merge from 'lodash/merge'
import { GenericData, GenericEntry } from './Entry'

export default abstract class GenericList<
  ENTRY extends GenericEntry<GenericData>
> {
  entries: ENTRY[] = []
  /**
   * Our CRUD operations
   */
  create(entry: ENTRY): ENTRY {
    this.entries.push(entry)
    return entry
  }
  delete(id: number): ENTRY {
    const index = this.entries.findIndex((entry) => (entry.id = id))
    const [entry] = this.entries.splice(index, 1)
    return entry
  }
  update(id: number, updates: Partial<ENTRY['data']>): ENTRY {
    const { entries } = this
    const index = entries.findIndex((entry) => (entry.id = id))
    const entry = entries[index]
    merge(entry.data, updates)
    return entry
  }
  read(id: number): ENTRY {
    return this.entries.find((entry) => entry.id === id) as ENTRY
  }
  /**
   * Utility info methods
   */
  has(id: number): boolean {
    return Boolean(this.entries.find((entry) => entry.id === id))
  }
  readIndex(index: number): ENTRY {
    return this.entries[index]
  }
  query(data: Partial<ENTRY>) {
    return this.entries.filter((entry) => {
      for (const key in data) {
        if (data[key] !== entry[key]) {
          return false
        }
      }
      return true
    })
  }
}
