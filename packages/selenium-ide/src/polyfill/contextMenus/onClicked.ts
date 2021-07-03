import browserEventListener from 'browser/helpers/EventListener'
import mainEventListener from 'main/helpers/EventListener'
export interface OnClickData {
  checked: boolean
  editable: boolean
  frameId: number
  frameUrl: string
  linkUrl: string
  mediaType: string
  menuItemId: string | number
  pageUrl: string
  parentMenuItemId: string | number
  selectionText: string
  srcUrl: string
  wasChecked: boolean
}

export type Shape = (data: OnClickData) => void

export const browser = browserEventListener<[OnClickData]>()
export const main = mainEventListener<[Partial<OnClickData>]>()
