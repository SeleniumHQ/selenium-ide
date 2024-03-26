import Box from '@mui/material/Box'
import SIDEAppBar from 'browser/components/AppBar'
import SIDEDrawer from 'browser/components/Drawer'
import Main from 'browser/components/Main'
import { context } from 'browser/contexts/show-drawer'
import { PROJECT_TAB, TAB } from 'browser/enums/tab'
import { usePanelGroup } from 'browser/hooks/usePanelGroup'
import React, { useContext } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Panel, PanelGroup } from 'react-resizable-panels'
import ResizeHandle from '../ResizeHandle'

export type PluginWindow = {
  name: string
  url: string
}

const ProjectEditor: React.FC = () => {
  const [tab, setTab] = React.useState<TAB>(PROJECT_TAB)
  const showDrawer = useContext(context)
  const [pluginWindows, setPluginWindows] = React.useState<PluginWindow[]>([])
  React.useEffect(() => {
    const handler = (name: string, url: string) => {
      setPluginWindows((prev) => prev.concat({ name, url }))
    }
    window.sideAPI.plugins.onRequestCustomEditorPanel.addListener(handler)
    return () => {
      window.sideAPI.plugins.onRequestCustomEditorPanel.removeListener(handler)
    }
  }, [])
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col height-100 pb-1 ps-1 pt-6 window-drag">
        <div className="flex-initial no-window-drag">
          <SIDEAppBar setTab={setTab} tab={tab} />
        </div>
        <PanelGroup direction="vertical" id="plugin-windows">
          <Panel defaultSize={100} id="plugin-windows-panel">
            <div className="flex-col flex-1 height-100 no-window-drag">
              <PanelGroup
                direction="horizontal"
                id="drawer-editor"
                {...usePanelGroup('drawer-editor', !showDrawer)}
              >
                {showDrawer && (
                  <>
                    <Panel
                      collapsible
                      id="editor-drawer"
                      defaultSize={25}
                      order={1}
                    >
                      <SIDEDrawer tab={tab} />
                    </Panel>
                    <ResizeHandle id="h-resize-1" y />
                  </>
                )}
                <Panel defaultSize={75} id="editor-panel" order={2}>
                  <Box className="fill flex flex-col">
                    <Main setTab={setTab} tab={tab} />
                  </Box>
                </Panel>
              </PanelGroup>
            </div>
          </Panel>
          {pluginWindows.map((pluginWindow, index) => (
            <React.Fragment key={index}>
              <ResizeHandle id={`v-resize-${index}`} x />
              <Panel key={index} id={pluginWindow.name}>
                <iframe
                  className="fill"
                  src={pluginWindow.url}
                  title={pluginWindow.name}
                />
              </Panel>
            </React.Fragment>
          ))}
        </PanelGroup>
      </div>
    </DndProvider>
  )
}

export default ProjectEditor
