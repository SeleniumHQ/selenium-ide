import React, { useEffect } from 'react'

export const useHeightFromElement = (id: string): number => {
  const [bottomOffset, setBottomOffset] = React.useState(0)

  useEffect(() => {
    const element = document.getElementById(id) as HTMLElement
    const observer = new MutationObserver(() => {
      console.log('Mutating?', element.clientHeight);
      setBottomOffset((element.clientHeight ?? 0))
    })
    observer.observe(element, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
    }
  }, [])
  return bottomOffset
}
