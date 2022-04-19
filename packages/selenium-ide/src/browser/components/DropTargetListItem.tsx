import ListItem, { ListItemProps } from '@mui/material/ListItem'
import { ReorderPreview } from 'browser/hooks/useReorderPreview'
import type { XYCoord, Identifier } from 'dnd-core'
import React, { MutableRefObject } from 'react'
import { useDrop } from 'react-dnd'

interface DropTargetListItemProps extends ListItemProps {
  dragType: string
  index: number
  reorder: ReorderPreview
  reorderConfirm: (oldIndex: number, newIndex: number, item: DragItem) => void
  reorderReset: () => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

const DropTargetListItem: React.FC<DropTargetListItemProps> = ({
  children,
  dragType,
  index,
  reorder,
  reorderConfirm,
  reorderReset,
  ...props
}) => {
  const ref = React.useRef<HTMLLIElement>()
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
    drop(item, monitor) {
      if (monitor.didDrop()) {
        reorderConfirm(item.index, index, item)
      } else {
        reorderReset()
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
      reorder({ newIndex: hoverIndex - 1 })

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  drop(ref)

  return (
    <ListItem
      data-handler-id={handlerId}
      ref={ref as MutableRefObject<HTMLLIElement>}
      {...props}
    >
      {children}
    </ListItem>
  )
}

export default DropTargetListItem
