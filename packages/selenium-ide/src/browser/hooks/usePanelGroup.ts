import React from 'react'
import { ImperativePanelGroupHandle } from 'react-resizable-panels'

export const usePanelGroup = (id: string) => {
  const [ready, setReady] = React.useState(false)
  const ref = React.useRef<null | ImperativePanelGroupHandle>(null)
  React.useEffect(() => {
    if (!ref.current) return
    window.sideAPI.resizablePanels.getPanelGroup(id).then((values) => {
      ref.current?.setLayout(values)
      setReady(true)
    })
  }, [ref])
  const onLayout = React.useCallback(
    (sizes: number[]) => {
      if (!ready) return
      window.sideAPI.resizablePanels.setPanelGroup(id, sizes)
    },
    [ready]
  )
  return {
    ref,
    onLayout,
  }
}
