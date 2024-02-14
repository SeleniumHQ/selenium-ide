import React from 'react'
import { ImperativePanelGroupHandle } from 'react-resizable-panels'

export const usePanelGroup = (id: string, disabled = false) => {
  const [ready, setReady] = React.useState(false)
  const ref = React.useRef<null | ImperativePanelGroupHandle>(null)
  React.useEffect(() => {
    if (disabled) {
      return setReady(false)
    }
    if (!ref.current) return
    window.sideAPI.resizablePanels.getPanelGroup(id).then((values) => {
      ref.current?.setLayout(values)
      setReady(true)
    })
  }, [disabled, ref])
  const onLayout = React.useCallback(
    (sizes: number[]) => {
      if (!ready) return
      window.sideAPI.resizablePanels.setPanelGroup(id, sizes)
    },
    [ready]
  )
  return {
    ref,
    reset: () => setReady(false),
    onLayout,
  }
}
