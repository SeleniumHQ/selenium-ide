import React from 'react'

interface TabPanelMultiProps {
  children?: React.ReactElement
  indexes: number[]
  value: number
}

const TabPanelMulti = ({ children, indexes, value }: TabPanelMultiProps): React.ReactElement | null =>
  indexes.includes(value) ? (children as React.ReactElement) : null

export default TabPanelMulti
