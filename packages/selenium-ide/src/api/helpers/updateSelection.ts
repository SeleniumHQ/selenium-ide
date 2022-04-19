import difference from 'lodash/difference'
import uniq from 'lodash/uniq'

export type UpdateSelection = (
  indexes: number[],
  selectionIndexes: number[],
  prevIndex: number,
  command: [number, boolean, boolean, boolean]
) => number[]

export const updateSelection: UpdateSelection = (
  indexes,
  selectionIndexes,
  prevIndex,
  [index, add, batch, clear]
) => {
  let newIndexes = [index]
  if (clear) {
    return newIndexes
  }
  if (batch) {
    const min = Math.min(prevIndex, index)
    const max = Math.max(prevIndex, index) + 1
    newIndexes = indexes.slice(min, max)
  }
  if (add) {
    return uniq(selectionIndexes.concat(newIndexes))
  }
  return difference(selectionIndexes, newIndexes)
}
