import React from 'react'

interface TabPanelProps {
  children?: React.ReactNode
  dir?: string
  index: number
  value: number
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <>
    {value === index && children}
  </>
)

export default TabPanel;
