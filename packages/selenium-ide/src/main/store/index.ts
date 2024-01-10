import { StateShape, UserPrefs } from '@seleniumhq/side-api'
import { defaultUserPrefs } from '@seleniumhq/side-api/dist/models/state'
import { window as Logger } from 'browser/windows/Logger/controller'
import { window as ProjectEditor } from 'browser/windows/ProjectEditor/controller'
import { window as PlaybackWindow } from 'browser/windows/PlaybackWindow/controller'
import Store from 'electron-store'
import { BrowserInfo } from 'main/types'
import config from './config'

export interface StorageSchema {
  config: typeof config
  browserInfo: BrowserInfo
  panelGroups: Record<string, number[]>
  plugins: string[]
  projectStates: Record<
    string,
    Omit<StateShape, 'playback' | 'recorder' | 'status'>
  >
  recentProjects: string[]
  windowSize: [number, number]
  windowPosition: [number, number]
  windowSizeLogger: [number, number]
  windowPositionLogger: [number, number]
  windowSizePlayback: [number, number]
  windowPositionPlayback: [number, number]
  userPrefs: UserPrefs
}

export default () => {
  const LoggerController = Logger()
  const ProjectEditorController = ProjectEditor()
  const PlaybackWindowController = PlaybackWindow()

  const store = new Store<StorageSchema>({
    defaults: {
      browserInfo: {
        browser: 'electron',
        useBidi: false,
        version: '',
      },
      config,
      panelGroups: {
        'editor-playback': [25, 75],
        'playback-logger': [80, 20],
      },
      plugins: [],
      projectStates: {},
      recentProjects: [],
      windowSize: [
        ProjectEditorController.width!,
        ProjectEditorController.height!,
      ],
      windowPosition: [ProjectEditorController.x!, ProjectEditorController.y!],
      windowSizeLogger: [LoggerController.width!, LoggerController.height!],
      windowPositionLogger: [LoggerController.x!, LoggerController.y!],
      windowSizePlayback: [
        PlaybackWindowController.width!,
        PlaybackWindowController.height!,
      ],
      windowPositionPlayback: [
        PlaybackWindowController.x!,
        PlaybackWindowController.y!,
      ],
      userPrefs: defaultUserPrefs,
    },
  })
  return store
}
