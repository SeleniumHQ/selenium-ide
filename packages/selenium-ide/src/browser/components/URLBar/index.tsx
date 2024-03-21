import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React from 'react'
import { TabShape } from '../PlaybackTabBar/tab'

const {
  windows: { navigatePlaybackWindow },
} = window.sideAPI

const URLBar: React.FC<{ tab: null | TabShape }> = ({ tab }) => {
  const tabURL = tab?.url ?? ''
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (ref.current) {
      ref.current.value = tabURL
    }
  }, [tabURL])
  return (
    <>
      <Box className="flex flex-col flex-initial" justifyContent="center">
        <Typography>URL</Typography>
      </Box>
      <Box className="flex-1 justify-content-center no-window-drag px-3">
        <TextField
          className="width-100"
          inputProps={{
            ['data-url']: true,
          }}
          inputRef={ref}
          onKeyDown={(e) => {
            const value = (e.target as HTMLInputElement).value
            if (e.key === 'Enter') {
              navigatePlaybackWindow(tab!.id, value)
            }
          }}
          margin="none"
          size="small"
        />
      </Box>
    </>
  )
}

export default URLBar
