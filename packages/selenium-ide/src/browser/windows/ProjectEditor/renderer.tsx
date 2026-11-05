import AppWrapper from 'browser/components/AppWrapper'
import renderWhenReady from 'browser/helpers/renderWhenReady'
import React from 'react'
import { Group, Panel } from 'react-resizable-panels'
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
      <Group
        orientation="horizontal"
        id="editor-playback"
        {...usePanelGroup('editor-playback')}
      >
        <Panel id="project-editor-panel">
          <ProjectEditor />
        </Panel>
        <ResizeHandle id="h-resize-2" y />
        <Panel id="playback-logger-panel">
          <div className="flex flex-col height-100">
            <PlaybackControls />
            <Group
              className="flex-1"
              orientation="vertical"
              id="playback-logger"
              {...usePanelGroup('playback-logger')}
            >
              <Panel id="playback-panel">
                <ProjectPlaybackWindow />
              </Panel>
              <ResizeHandle id="playback-logger-resize" x />
              <Panel className="pos-rel" id="logger-panel">
                <SIDELogger />
              </Panel>
            </Group>
          </div>
        </Panel>
      </Group>
    </SessionContextProviders>
  </AppWrapper>
)

renderWhenReady(ProjectMainWindow)
