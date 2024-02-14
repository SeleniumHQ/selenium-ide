import Box from '@mui/material/Box'
import { loadingID } from '@seleniumhq/side-api/dist/constants/loadingID'
import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Main from '../Main'
import { SIDEMainProps } from '../types'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import SIDEDrawer from '../Drawer'
import { usePanelGroup } from 'browser/hooks/usePanelGroup'
import SIDEAppBar from '../AppBar'

const ProjectEditor: React.FC<
  Pick<SIDEMainProps, 'session' | 'setTab' | 'tab'>
> = ({ session, setTab, tab }) => {
  const showDrawer = session.state.editor.showDrawer
  if (session.project.id === loadingID) {
    return <div id="loading" />
  }
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col height-100">
        <div className="flex-initial">
          <SIDEAppBar session={session} setTab={setTab} tab={tab} />
        </div>
        <div className="flex-1">
          <PanelGroup
            direction="horizontal"
            id="drawer-editor"
            {...usePanelGroup('drawer-editor', !showDrawer)}
          >
            {showDrawer && (
              <>
                <Panel collapsible id="editor-drawer" defaultSize={25} order={1}>
                  <SIDEDrawer session={session} tab={tab} />
                </Panel>
                <PanelResizeHandle className="resize-bar" id="h-resize-1" />
              </>
            )}
            <Panel defaultSize={75} id="editor-panel" order={2}>
              <Box className="fill flex flex-col">
                <Main session={session} setTab={setTab} tab={tab} />
              </Box>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </DndProvider>
  )
}

export default ProjectEditor
