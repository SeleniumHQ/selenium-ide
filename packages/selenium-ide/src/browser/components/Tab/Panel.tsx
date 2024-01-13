import React from 'react'

interface TabPanelProps {
  children?: React.ReactElement
  dir?: string
  index: number
  value: number
}

const TabPanel = ({
  children,
  value,
  index,
}: TabPanelProps): React.ReactElement | null =>
  value === index ? (children as React.ReactElement) : null

export default TabPanel
