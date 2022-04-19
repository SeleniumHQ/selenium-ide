export type ReorderListInput<T> = {
  entries: [T, number][]
  newIndex: number
  selectedIndexes: number[]
}

export type ReorderList<T = any> = (input: ReorderListInput<T>) => T[]

export const reorderList = <T>({
  entries,
  newIndex,
  selectedIndexes,
}: ReorderListInput<T>): [T, number][] => {
  console.log('Reordering', entries, newIndex, selectedIndexes)
  const included = (bool: boolean) => ([_entry, index]: [T, number]) =>
    bool === selectedIndexes.includes(index)
  const untouchedCmds = entries.filter(included(false))
  const movedCmds = entries.filter(included(true))
  untouchedCmds.splice(newIndex, 0, ...movedCmds)
  return untouchedCmds
}

export type ReorderListRawInput<T> = {
  entries: T[]
  newIndex: number
  selectedIndexes: number[]
}
export const reorderListRaw = <T>({
  entries,
  newIndex,
  selectedIndexes,
}: ReorderListRawInput<T>): T[] => {
  const included = (bool: boolean) => (_entry: any, index: number) =>
    bool === selectedIndexes.includes(index)
  const untouchedCmds = entries.filter(included(false))
  const movedCmds = entries.filter(included(true))
  untouchedCmds.splice(newIndex, 0, ...movedCmds)
  return untouchedCmds
}