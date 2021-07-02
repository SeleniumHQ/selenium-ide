import EventListener from 'browser/helpers/EventListener'

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

export const browser = EventListener<[OnClickData]>()
