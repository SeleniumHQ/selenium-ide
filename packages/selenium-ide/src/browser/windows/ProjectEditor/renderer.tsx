import AppWrapper from 'browser/components/AppWrapper'
import renderWhenReady from 'browser/helpers/renderWhenReady'
import React from 'react'
import { Panel, PanelGroup } from 'react-resizable-panels'
import SIDELogger from 'browser/components/Logger'
import PlaybackControls from 'browser/components/PlaybackControls'
import ProjectPlaybackWindow from 'browser/components/PlaybackPanel'
import ProjectEditor from 'browser/components/ProjectEditor'
import { usePanelGroup } from 'browser/hooks/usePanelGroup'
import { SessionContextProviders } from 'browser/contexts/provider'
import ResizeHandle from 'browser/components/ResizeHandle'

const ProjectMainWindow = () => (
  <AppWrapper>
    <SessionContextProviders>
      <PanelGroup
        direction="horizontal"
        id="editor-playback"
        {...usePanelGroup('editor-playback')}
      >
        <Panel id="editor-panel">
          <ProjectEditor />
        </Panel>
        <ResizeHandle id="h-resize-2" y />
        <Panel id="playback-logger-panel">
          <PanelGroup
            direction="vertical"
            id="playback-logger"
            {...usePanelGroup('playback-logger')}
          >
            <PlaybackControls />
            <Panel id="playback-panel">
              <ProjectPlaybackWindow />
            </Panel>
            <ResizeHandle id="playback-logger-resize" x />
            <Panel className="pos-rel" id="logger-panel">
              <SIDELogger />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </SessionContextProviders>
  </AppWrapper>
)

renderWhenReady(ProjectMainWindow)
