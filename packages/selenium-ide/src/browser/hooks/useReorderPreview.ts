import { reorderList } from 'api/helpers/reorderList'
import identity from 'lodash/fp/identity'
import React from 'react'

export type ReorderPreviewInput = { newIndex: number }
export type ReorderPreview = (input: ReorderPreviewInput) => void

const addIndexes = <T>(entries: T[]): [T, number][] =>
  entries.map((entry, index) => [entry, index])

const useReorderPreview = <T = any>(
  entries: T[],
  selectedIndexes: number[],
  id: (entry: T) => string = identity
): [[T, number][], ReorderPreview, () => void] => {
  const [preview, setPreview] = React.useState(addIndexes(entries.map(id)))
  const resetPreview = () => setPreview(addIndexes(entries.map(id)))
  const reorderPreview: ReorderPreview = ({ newIndex }) => {
    const newPreview = reorderList({
      entries: preview,
      newIndex,
      selectedIndexes,
    })
    setPreview(newPreview)
  }
  React.useEffect(() => {
    resetPreview()
  }, [entries.map(id).join('-')])
  return [
    preview.map(([_id, index]) => [entries[index], index]),
    reorderPreview,
    resetPreview,
  ]
}

export default useReorderPreview
