import Paper from '@mui/material/Paper'
import React from 'react'
import { PanelResizeHandle } from 'react-resizable-panels'

export type PluginWindow = {
  name: string
  url: string
}

const sx = {
  backgroundColor: 'primary.main',
}

type ResizeHandleProps = {
  id: string
  x?: boolean
  y?: boolean
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({
  id,
  x = false,
  y = false,
}) => (
  <PanelResizeHandle className="resize-bar" id={id}>
    <Paper
      className={React.useMemo(
        () =>
          ['resize-handle', x ? 'x' : '', y ? 'y' : '']
            .filter(Boolean)
            .join(' '),
        [x, y]
      )}
      sx={sx}
      variant="outlined"
    />
  </PanelResizeHandle>
)

export default ResizeHandle
