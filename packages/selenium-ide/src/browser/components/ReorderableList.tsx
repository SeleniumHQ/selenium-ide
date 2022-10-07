import { TableBodyProps } from '@mui/material/TableBody'
import List, { ListProps } from '@mui/material/List'
import React, { FC } from 'react'

export type ReorderableListProps = ListProps & TableBodyProps & {
  bottomOffset: number
  Component?: React.FC | React.ComponentClass
}

const ReorderableList: FC<ReorderableListProps> = ({
  bottomOffset,
  children,
  Component = List,
  sx = {},
  ...props
}) => (
    <Component
      dense
      sx={{
        borderColor: 'primary.main',
        marginBottom: `${bottomOffset}px`,
        overflowY: 'scroll',
        verticalAlign: 'top',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Component>
  )

export default ReorderableList
