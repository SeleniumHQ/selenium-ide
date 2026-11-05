import React from 'react'
import { GroupImperativeHandle, Layout } from 'react-resizable-panels'

/**
 * Restores a panel group's saved sizes and saves them when they change.
 * Sizes are stored as a list of percentages, in panel order.
 */
export const usePanelGroup = (id: string, disabled = false) => {
  const [ready, setReady] = React.useState(false)
  const groupRef = React.useRef<null | GroupImperativeHandle>(null)
  React.useEffect(() => {
    if (disabled) {
      return setReady(false)
    }
    if (!groupRef.current) return
    window.sideAPI.resizablePanels.getPanelGroup(id).then((values) => {
      const group = groupRef.current
      if (!group) return
      const panelIds = Object.keys(group.getLayout())
      if (panelIds.length === values.length) {
        group.setLayout(
          Object.fromEntries(panelIds.map((panelId, i) => [panelId, values[i]]))
        )
      }
      setReady(true)
    })
  }, [disabled, groupRef])
  const onLayoutChange = React.useCallback(
    (layout: Layout) => {
      if (!ready) return
      window.sideAPI.resizablePanels.setPanelGroup(id, Object.values(layout))
    },
    [ready]
  )
  return {
    groupRef,
    onLayoutChange,
  }
}
