import Box from '@mui/material/Box'
import React, { useContext } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Main from '../Main'
import { SIDEMainProps } from '../types'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import SIDEDrawer from '../Drawer'
import { usePanelGroup } from 'browser/hooks/usePanelGroup'
import SIDEAppBar from '../AppBar'
import { context } from 'browser/contexts/show-drawer'

const ProjectEditor: React.FC<Pick<SIDEMainProps, 'setTab' | 'tab'>> = ({
  setTab,
  tab,
}) => {
  const showDrawer = useContext(context)
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col height-100 pb-1 ps-1 pt-5 window-drag">
        <div className="flex-initial no-window-drag">
          <SIDEAppBar setTab={setTab} tab={tab} />
        </div>
        <div className="flex-1 no-window-drag">
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
                <PanelResizeHandle className="resize-bar" id="h-resize-1" />
              </>
            )}
            <Panel defaultSize={75} id="editor-panel" order={2}>
              <Box className="fill flex flex-col">
                <Main setTab={setTab} tab={tab} />
              </Box>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </DndProvider>
  )
}

export default ProjectEditor
