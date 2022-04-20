import { reorderList } from 'api/helpers/reorderList'
import identity from 'lodash/fp/identity'
import React from 'react'

export type ReorderPreviewInput = { newIndex: number }
export type ReorderPreview = (input: ReorderPreviewInput) => void

type DeriveIDIndexes<T = any> = (entries: T[]) => [T, number][]
const deriveIDIndexes: DeriveIDIndexes = (entries) =>
  entries.map((entry, index) => [entry, index])

const useReorderPreview = <T = any>(
  entries: T[],
  selectedIndexes: number[],
  id: (entry: T) => string = identity
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
  React.useEffect(() => {
    resetPreview()
  }, [entries.map(id).join('-')])
  return [preview, reorderPreview, resetPreview]
}

export default useReorderPreview
