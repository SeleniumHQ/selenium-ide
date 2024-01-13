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
      const el = logContainer.current
      if (!el) return; 
      el.append(
        `${new Date().toLocaleTimeString()} [${level}] ${log}\n`
      )
      el.scrollTo(0, el.scrollHeight)
    }
    window.sideAPI.system.onLog.addListener(handleLog)
    return () => {
      window.sideAPI.system.onLog.removeListener(handleLog)
    }
  }, [logContainer])
  return (
    <>
      <div className="p-1 pos-abs" style={{ top: 0, right: 0 }}>
        <Paper className="p-1" elevation={3} square>
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
      <pre
        className="fill m-0 overflow-y"
        ref={logContainer}
        style={consoleStyle}
      />
    </>
  )
}

export default SIDELogger
