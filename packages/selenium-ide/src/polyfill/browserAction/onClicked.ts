import { TabData } from 'polyfill/types'
import EventListener from 'browser/helpers/EventListener'

export const browser = EventListener<[TabData]>()
