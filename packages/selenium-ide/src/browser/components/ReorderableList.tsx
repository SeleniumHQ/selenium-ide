import List, { ListProps } from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import React, { FC } from 'react'

export interface ReorderableListProps extends ListProps {
  bottomOffset: number
}

const ReorderableList: FC<ReorderableListProps> = ({
  bottomOffset,
  children,
  subheader,
  sx = {},
  ...props
}) => (
    <List
      dense
      sx={{
        borderColor: 'primary.main',
        marginBottom: `${bottomOffset}px`,
        verticalAlign: 'top',
        ...sx,
      }}
      subheader={(
        <ListSubheader className="lh-36" sx={{ top: '96px', zIndex: 100 }}>
          {subheader}
        </ListSubheader>
      )}
      {...props}
    >
      {children}
    </List>
  )

export default ReorderableList
