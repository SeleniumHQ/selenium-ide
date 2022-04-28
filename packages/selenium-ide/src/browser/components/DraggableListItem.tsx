import ListItem, { ListItemProps } from '@mui/material/ListItem'
import React, { MutableRefObject } from 'react'
import { useDrag } from 'react-dnd'

interface DraggableListItemProps extends ListItemProps {
  index: number
  dragType: string
  end: (result: unknown) => unknown
  metadata?: Record<string, unknown>
}

const DraggableListItem: React.FC<DraggableListItemProps> = ({
  children,
  dragType,
  end,
  id,
  index,
  metadata = {},
  sx = {},
  ...props
}) => {
  const ref = React.useRef<HTMLLIElement>()
  const [{ isDragging }, drag] = useDrag({
    type: dragType,
    item: () => {
      return { id, index, ...metadata }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_item, monitor) => {
      if (monitor.didDrop()) {
        const result = monitor.getDropResult()
        end(result)
      }
    }
  })

  drag(ref)

  const wrappedSX = !isDragging
    ? sx
    : {
        ...sx,
        opacity: 0.5,
      }
  return (
    <ListItem
      ref={ref as MutableRefObject<HTMLLIElement>}
      sx={wrappedSX}
      {...props}
    >
      {children}
    </ListItem>
  )
}

export default DraggableListItem
