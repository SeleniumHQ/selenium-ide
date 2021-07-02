import Handler from 'browser/helpers/Handler'

export interface CreateContextMenuOptions {
  checked: boolean
  contexts: string[]
  documentUrlPatterns: string[]
  enabled: boolean
  id: string
  parentId: string | number
  targetUrlPatterns: string[]
  title: string
  itemType: string
  visible: boolean
}

export const browser = Handler<[CreateContextMenuOptions], [number | string]>()
