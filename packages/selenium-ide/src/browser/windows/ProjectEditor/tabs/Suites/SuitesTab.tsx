import React from 'react'
import SuiteEditor from './Editor'
import SuiteViewer from './Viewer'

const SuitesTab: React.FC<any> = (props) => {
  const [isEditing, setIsEditing] = React.useState(false)

  if (isEditing) {
    return <SuiteEditor setIsEditing={setIsEditing} {...props} />
  } else {
    return <SuiteViewer setIsEditing={setIsEditing} {...props} />
  }
}

export default SuitesTab
