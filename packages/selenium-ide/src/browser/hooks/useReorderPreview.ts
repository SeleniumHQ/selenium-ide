import React from 'react'
import { reorderList } from 'api/helpers/reorderList'

export type ReorderPreviewInput = { newIndex: number }
export type ReorderPreview = (input: ReorderPreviewInput) => void

type DeriveIDIndexes<T = any> = (entries: T[]) => [T, number][]
const deriveIDIndexes: DeriveIDIndexes = (entries) =>
  entries.map((entry, index) => [entry, index])

const useReorderPreview = <T = any>(
  entries: T[],
  selectedIndexes: number[]
): [[T, number][], ReorderPreview, () => void] => {
  const [preview, setPreview] = React.useState(deriveIDIndexes(entries))
  const resetPreview = () => setPreview(deriveIDIndexes(entries))
  const reorderPreview: ReorderPreview = ({ newIndex }) => {
    const newPreview = reorderList<[T, number]>({
      entries: preview,
      newIndex,
      selectedIndexes,
    })
    setPreview(newPreview)
  }
  return [preview, reorderPreview, resetPreview]
}

export default useReorderPreview
