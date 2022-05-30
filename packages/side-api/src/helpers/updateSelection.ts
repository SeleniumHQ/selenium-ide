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
  [index, batch, add, clear]
) => {
  let newIndexes = [index]
  if (clear) {
    return newIndexes
  }
  if (batch) {
    const min = Math.min(prevIndex, index)
    const max = Math.max(prevIndex, index) + 1
    newIndexes = indexes.slice(min, max)
    if (prevIndex > index) {
      newIndexes.reverse()
    }
  }
  const filteredIndexes = selectionIndexes.filter((index) =>
    !newIndexes.includes(index)
  )
  if (add) {
    return filteredIndexes.concat(newIndexes)
  }
  return filteredIndexes
}
