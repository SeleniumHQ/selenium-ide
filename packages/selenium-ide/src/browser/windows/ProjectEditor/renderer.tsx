import AppWrapper from 'browser/components/AppWrapper'
import renderWhenReady from 'browser/helpers/renderWhenReady'
import subscribeToSession from 'browser/helpers/subscribeToSession'
import React from 'react'
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels'
import SIDELogger from 'browser/components/Logger'
import PlaybackControls from 'browser/components/PlaybackControls'
import ProjectPlaybackWindow from 'browser/components/PlaybackPanel'
import ProjectEditor from 'browser/components/ProjectEditor'
import { TAB, TESTS_TAB } from 'browser/enums/tab'
import { usePanelGroup } from 'browser/hooks/usePanelGroup'

const ProjectMainWindow = () => {
  const session = subscribeToSession()
  const [tab, setTab] = React.useState<TAB>(TESTS_TAB)
  return (
    <AppWrapper>
      <PanelGroup
        direction="horizontal"
        id="editor-playback"
        {...usePanelGroup('editor-playback')}
      >
        <Panel id="editor-panel">
          <ProjectEditor session={session} setTab={setTab} tab={tab} />
        </Panel>
        <PanelResizeHandle className="resize-bar" id="h-resize-2" />
        <Panel id="playback-logger-panel">
          <PanelGroup
            direction="vertical"
            id="playback-logger"
            {...usePanelGroup('playback-logger')}
          >
            <PlaybackControls session={session} />
            <Panel id="playback-panel">
              <ProjectPlaybackWindow />
            </Panel>
            <PanelResizeHandle
              className="resize-bar"
              dir="vertical"
              id="playback-logger-resize"
            />
            <Panel className="pos-rel" id="logger-panel">
              <SIDELogger />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </AppWrapper>
  )
}

renderWhenReady(ProjectMainWindow)
