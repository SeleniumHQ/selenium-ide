// eslint-disable-next-line node/no-extraneous-import
import { IpcMainEvent } from 'electron'

/**
 * Used by the main process to construct the frame tree
 */
export type BrowserShape = (event: IpcMainEvent) => Promise<string>
export type ServerShape = (event: IpcMainEvent) => Promise<string>
