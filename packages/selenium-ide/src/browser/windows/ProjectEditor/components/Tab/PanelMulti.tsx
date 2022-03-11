import React from 'react'

interface TabPanelMultiProps {
  children?: React.ReactNode
  dir?: string
  indexes: number[]
  value: number
}

const TabPanelMulti: React.FC<TabPanelMultiProps> = ({ children, value, indexes, ...other }) => (
  <div
    role="tabpanel"
    hidden={!indexes.includes(value)}
    id={`full-width-tabpanel-${indexes.join('-')}`}
    aria-labelledby={`full-width-tab-${indexes.join('-')}`}
    {...other}
  >
    {indexes.includes(value) && children}
  </div>
)

export default TabPanelMulti;
