import { CoreSessionData } from '@seleniumhq/side-api'
import React from 'react'
import MainHeader from '../../components/Main/Header'
import SuiteEditor from './Editor'
import SuiteViewer from './Viewer'

const SuitesTab: React.FC<{ session: CoreSessionData }> = ({ session }) => {
  const Component =
    session.state.editor.suiteMode === 'editor' ? SuiteEditor : SuiteViewer

  return (
    <>
      <MainHeader />
      <Component session={session} />
    </>
  )
}

export default SuitesTab
