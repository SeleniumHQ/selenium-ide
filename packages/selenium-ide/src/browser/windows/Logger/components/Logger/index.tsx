import Delete from '@mui/icons-material/Delete'
import { Paper } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import { LogLevel } from 'electron-log'
import React from 'react'

const consoleStyle = {
  fontSize: '0.75rem',
  lineHeight: '1.2',
}

const SIDELogger: React.FC = () => {
  const logContainer = React.useRef<HTMLPreElement>(null)
  React.useEffect(() => {
    const handleLog = (level: LogLevel, log: string) => {
      logContainer.current?.append(
        `${new Date().toLocaleTimeString()} [${level}] ${log}\n`
      )
      window.scrollTo(0, logContainer.current?.scrollHeight ?? 0)
    }
    window.sideAPI.system.onLog.addListener(handleLog)
    return () => {
      window.sideAPI.system.onLog.removeListener(handleLog)
    }
  }, [logContainer])
  return (
    <>
      <pre ref={logContainer} style={consoleStyle} />
      <div className="p-1 pos-fixed" style={{ top: 0, right: 0 }}>
        <Paper className="p-1" elevation={3}>
          <IconButton
            onClick={() => {
              if (logContainer.current) {
                logContainer.current.innerHTML = ''
              }
            }}
          >
            <Delete />
          </IconButton>
        </Paper>
      </div>
    </>
  )
}

export default SIDELogger
