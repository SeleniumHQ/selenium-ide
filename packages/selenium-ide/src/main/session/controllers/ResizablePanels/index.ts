import { Session } from 'main/types'
import BaseController from '../Base'

type Rect = {
  x: number
  y: number
  width: number
  height: number
}

const resizablePanelDefaults: Record<string, number[]> = {
  'drawer-editor': [30, 70],
  'editor-playback': [30, 70],
  'playback-logger': [80, 20],
}

/**
 * This just contains a tiny api for persisting and getting the state of resizable panels
 */
export default class ResizablePanelsController extends BaseController {
  constructor(session: Session) {
    super(session)
  }
  async getPanelGroup(id: string) {
    const currentValue = this.session.store.get<string, number[]>(
      `panelGroup.${id}`
    )
    const defaultValue = resizablePanelDefaults?.[id]
    if (defaultValue) {
      if (!currentValue || currentValue.length !== defaultValue.length) {
        return defaultValue
      }
    }
    return currentValue || [50, 50]
  }

  cachedPlaybackWindowDimensions: {
    position: [number, number]
    size: [number, number]
  } | null = null

  async getPlaybackWindowDimensions() {
    const panelScreenPosition = await this.getPanelScreenPosition(
      'playback-panel'
    )
    const offset = { x: 0, y: 0 }
    switch (process.platform) {
      case 'win32':
        offset.x = 6
        offset.y = 24
        break
      case 'darwin':
        offset.x = 0
        offset.y = -29
        break
      default:
        offset.x = 0
        offset.y = 0
    }
    this.cachedPlaybackWindowDimensions = {
      position: [
        panelScreenPosition.x + offset.x,
        panelScreenPosition.y + offset.y,
      ],
      size: [panelScreenPosition.width, panelScreenPosition.height],
    } as {
      position: [number, number]
      size: [number, number]
    }
    return this.cachedPlaybackWindowDimensions!
  }

  async recalculatePlaybackWindows() {
    const { active, height, width } =
      this.session.state.state.editor.overrideWindowSize
    const panelDims = await this.getPlaybackWindowDimensions()
    if (active) {
      this.session.windows.resizePlaybackWindows(width, height)
    } else {
      this.session.windows.resizePlaybackWindows(...panelDims.size)
    }
    this.session.windows.playbackWindows.forEach((playbackWindow) => {
      playbackWindow.setPosition(...panelDims.position)
    })
  }

  async setPanelGroup(id: string, dimensions: number[]) {
    this.session.store.set(`panelGroup.${id}`, dimensions)
    this.recalculatePlaybackWindows()
  }

  async getPanelScreenPosition(id: string) {
    const projectWindow = await this.session.windows.get('project-editor')
    const projectWindowBounds = await projectWindow.getBounds()
    const panelGroupPosition =
      (await projectWindow.webContents.executeJavaScript(
        `JSON.parse(JSON.stringify(document.querySelector('[data-panel-id="${id}"]').getBoundingClientRect()))`
      )) as Rect
    // Holy shit what are these numbers even related to :\
    return {
      x: Math.round(panelGroupPosition.x + projectWindowBounds.x) + 2,
      y: Math.round(panelGroupPosition.y + projectWindowBounds.y) + 30,
      width: Math.round(panelGroupPosition.width) - 5,
      height: Math.round(panelGroupPosition.height) - 3,
    }
  }
}
