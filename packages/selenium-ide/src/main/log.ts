import { app } from 'electron'
import log, { LogMessage } from 'electron-log'
import { existsSync, writeFileSync } from 'fs'
import { join } from 'node:path'
import { inspect } from 'util'
import { Session } from 'main/types'

export const configureLogging = () => {
  // Configure logging
  const logFile = Date.now() + '.main.log'
  const logPath = join(app.getPath('logs'), logFile)
  const logFileExists = existsSync(logPath)
  if (!logFileExists) {
    writeFileSync(logPath, '')
  }
  log.transports.file.resolvePath = () => join(app.getPath('logs'), logFile)
  Object.assign(console, log.functions)
}

// Wire up logging to the frontend
export const connectSessionLogging = (session: Session) => {
  const sessionTransport = (msg: LogMessage) =>
    session.api.system.onLog.dispatchEvent(msg.level, inspect(msg.data))
  sessionTransport.level = 'debug' as const
  log.transports.session = sessionTransport
}