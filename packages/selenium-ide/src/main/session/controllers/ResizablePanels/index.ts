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
  async setPanelGroup(id: string, dimensions: number[]) {
    this.session.store.set(`panelGroup.${id}`, dimensions)
  }
  async getPanelScreenPosition(id: string) {
    const projectWindow = await this.session.windows.get('project-main-window')
    const projectWindowBounds = await projectWindow.getBounds()
    const panelGroupPosition =
      (await projectWindow.webContents.executeJavaScript(
        `JSON.parse(JSON.stringify(document.querySelector('[data-panel-id="${id}"]').getBoundingClientRect()))`
      )) as Rect
    return {
      x: Math.round(panelGroupPosition.x + projectWindowBounds.x) + 11,
      y: Math.round(panelGroupPosition.y + projectWindowBounds.y) + 38,
      width: Math.round(panelGroupPosition.width) - 24,
      height: Math.round(panelGroupPosition.height) - 20,
    }
  }
}
