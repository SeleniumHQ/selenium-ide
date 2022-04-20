import { TestShape } from '@seleniumhq/side-model'
import { useEffect } from 'react'

export interface useKeyboundNavInput {
  activeSuite: string
  bottomOffset: number
  selectedIndexes: number[]
  tests: TestShape[]
}

const traverseKeys: KeyboardEvent['key'][] = ['ArrowUp', 'ArrowDown']

const useKeyboundNav =
  (select: typeof window.sideAPI.state.updateTestSelection) =>
  <T>(entries: T[], selectedIndexes: number[]) => {
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (traverseKeys.includes(e.key)) {
          let activeIndex = 0
          if (selectedIndexes.length) {
            activeIndex = selectedIndexes.slice(-1)[0]
          }
          const nextIndex =
            e.key === 'ArrowUp' ? activeIndex - 1 : activeIndex + 1
          const nextEntry = entries[nextIndex]
          if (nextEntry) {
            const removeKey = e.altKey
            const anyAddKey = e.shiftKey || e.ctrlKey || e.metaKey
            select(
              nextIndex,
              e.shiftKey,
              !removeKey && anyAddKey,
              !removeKey && !anyAddKey
            )
          }
        }
      }
      window.addEventListener('keydown', handler)
      return () => window.removeEventListener('keydown', handler)
    }, [selectedIndexes.join('-')])
  }

export default useKeyboundNav
