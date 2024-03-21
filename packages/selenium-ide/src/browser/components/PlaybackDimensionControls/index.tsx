import TabUnselectedIcon from '@mui/icons-material/TabUnselected'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React, { useContext } from 'react'
import { Checkbox, Tooltip } from '@mui/material'
import { context } from 'browser/contexts/session'

const {
  state: { set },
} = window.sideAPI

const fieldStyle = { width: 60 }
const inputProps = {
  sx: {
    paddingLeft: 0.5,
    paddingRight: 0.5,
  },
}

const PlaybackDimensionControls: React.FC = () => {
  const session = useContext(context)
  const [panelWidth, setPanelWidth] = React.useState(0)
  const [panelHeight, setPanelHeight] = React.useState(0)
  const { active, width, height } = session.state.editor.overrideWindowSize
  React.useEffect(() => {
    if (active) {
      return
    }
    const playbackPanel = document.querySelector(
      '[data-panel-id="playback-panel"]'
    )!
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect
        setPanelWidth(Math.round(width))
        setPanelHeight(Math.round(height))
      }
    })
    observer.observe(playbackPanel)
    return () => observer.disconnect()
  }, [active])
  return (
    <>
      <Tooltip
        placement="left"
        title="Force panel window dimensions (will zoom out if larger than panel and crop if smaller)"
      >
        <Box
          className="flex flex-row flex-initial ps-3"
          justifyContent="center"
          sx={{
            cursor: 'pointer',
          }}
          onClick={() =>
            set('editor.overrideWindowSize', {
              active: !active,
              width: panelWidth,
              height: panelHeight,
            })
          }
        >
          <TabUnselectedIcon className="height-100" />
          <Checkbox checked={active} size="small" disableRipple />
        </Box>
      </Tooltip>
      <Box className="flex flex-col flex-initial pe-3" justifyContent="center">
        <Typography>W</Typography>
      </Box>
      <Box className="flex-initial">
        <TextField
          disabled={!active}
          inputProps={inputProps}
          onChange={(e: any) => {
            const val = Number(e.target.value)
            if (!isNaN(val)) {
              set('editor.overrideWindowSize.width', val)
            }
          }}
          margin="none"
          size="small"
          sx={fieldStyle}
          value={active ? width : panelWidth}
        />
      </Box>
      <Box className="flex flex-col flex-initial px-3" justifyContent="center">
        <Typography>H</Typography>
      </Box>
      <Box className="flex-initial pe-4">
        <TextField
          disabled={!active}
          inputProps={inputProps}
          onChange={(e: any) => {
            const val = Number(e.target.value)
            if (!isNaN(val)) {
              set('editor.overrideWindowSize.height', val)
            }
          }}
          margin="none"
          size="small"
          sx={fieldStyle}
          value={active ? height : panelHeight}
        />
      </Box>
    </>
  )
}

export default PlaybackDimensionControls
