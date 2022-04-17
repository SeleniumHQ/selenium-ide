import ListItem, { ListItemProps } from '@mui/material/ListItem'
import type { XYCoord, Identifier } from 'dnd-core'
import React, { MutableRefObject } from 'react'
import { useDrag, useDrop } from 'react-dnd'


interface ReorderableListItemProps extends ListItemProps {
  id: string
  index: number
  dragType: string
  reorder: (oldIndex: number, newIndex: number, item: DragItem) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

const ReorderableListItem: React.FC<ReorderableListItemProps> = ({
  children,
  dragType,
  id,
  index,
  reorder,
  sx = {},
  ...props
}) => {
  const ref = React.useRef<HTMLLIElement>();
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: dragType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    // @ts-expect-error
    drop(item) {
      return {
        oldIndex: item.index,
        newIndex: index,
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      reorder(dragIndex, hoverIndex, item)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: dragType,
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        reorder(index, item.index, item as DragItem)
      }
    },
    item: () => {
      return { id, index }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref))

  const wrappedSX = !isDragging
    ? sx
    : {
        ...sx,
        opacity: 0.5,
      }
  return (
    <ListItem
      data-handler-id={handlerId}
      ref={ref as MutableRefObject<HTMLLIElement>}
      sx={wrappedSX}
      {...props}
    >
      {children}
    </ListItem>
  )
}

export default ReorderableListItem
