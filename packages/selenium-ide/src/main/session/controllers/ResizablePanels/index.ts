import { Session } from 'main/types'
import BaseController from '../Base'

type Rect = {
  x: number
  y: number
  width: number
  height: number
}

const resizablePanelDefaults: Record<string, number[]> = {
  'editor-playback': [25, 75],
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
    return this.session.store.get(
      `panelGroup.${id}`,
      resizablePanelDefaults?.[id] ?? [50, 50]
    )
  }
  async recalculatePlaybackWindows() {
    const panelScreenPosition = await this.getPanelScreenPosition(
      'playback-panel'
    )
    const isWindows = process.platform === 'win32'
    this.session.windows.playbackWindows.forEach((playbackWindow) => {
      playbackWindow.setSize(
        panelScreenPosition.width,
        panelScreenPosition.height
      )
      playbackWindow.setPosition(
        panelScreenPosition.x + (isWindows ? 12 : 0),
        panelScreenPosition.y + (isWindows ? 21 : 0)
      )
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
    return {
      x: Math.round(panelGroupPosition.x + projectWindowBounds.x) + 2,
      y: Math.round(panelGroupPosition.y + projectWindowBounds.y) + 30,
      width: Math.round(panelGroupPosition.width) - 5,
      height: Math.round(panelGroupPosition.height) - 3,
    }
  }
}
