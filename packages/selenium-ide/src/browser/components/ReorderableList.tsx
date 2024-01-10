import { TableBodyProps } from '@mui/material/TableBody'
import List, { ListProps } from '@mui/material/List'
import React, { FC } from 'react'

export type ReorderableListProps = ListProps & TableBodyProps & {
  Component?: React.FC | React.ComponentClass
}

const ReorderableList: FC<ReorderableListProps> = ({
  children,
  Component = List,
  sx = {},
  ...props
}) => (
    <Component
      dense
      sx={{
        borderColor: 'primary.main',
        verticalAlign: 'top',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Component>
  )

export default ReorderableList
