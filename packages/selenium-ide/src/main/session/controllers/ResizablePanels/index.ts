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
    const isWindows = process.platform === 'win32'
    this.cachedPlaybackWindowDimensions = {
      position: [
        panelScreenPosition.x + (isWindows ? 12 : 0),
        panelScreenPosition.y + (isWindows ? 21 : 0),
      ],
      size: [panelScreenPosition.width, panelScreenPosition.height],
    } as {
      position: [number, number]
      size: [number, number]
    }
    return this.cachedPlaybackWindowDimensions!;
  }

  async recalculatePlaybackWindows() {
    const panelDims = await this.getPlaybackWindowDimensions()
    this.session.windows.playbackWindows.forEach((playbackWindow) => {
      playbackWindow.setSize(...panelDims.size)
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
