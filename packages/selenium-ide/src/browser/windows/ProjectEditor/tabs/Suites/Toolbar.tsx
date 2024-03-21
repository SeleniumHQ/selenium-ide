import React, { FC, useContext } from 'react'
import EditorToolbar from 'browser/components/Drawer/EditorToolbar'
import SuiteCreateDialog from './SuiteCreateDialog'
import { context as activeTestContext } from 'browser/contexts/active-test'
import { context as suiteModeContext } from 'browser/contexts/suite-mode'
import { context } from 'browser/contexts/suites'
import SuiteDeleteDialog from './SuiteDeleteDialog'

const SuitesToolbar: FC<{ children?: React.ReactNode }> = ({
  children = null,
}) => {
  const { activeSuiteID } = useContext(activeTestContext)
  const suiteMode = useContext(suiteModeContext)
  const suites = useContext(context)
  const [confirmNew, setConfirmNew] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const activeSuite = React.useMemo(
    () => suites.find((s) => s.id === activeSuiteID),
    [activeSuiteID, suites]
  )
  return (
    <>
      <SuiteCreateDialog open={confirmNew} setOpen={setConfirmNew} />
      <SuiteDeleteDialog
        open={confirmDelete}
        setOpen={setConfirmDelete}
        suiteID={activeSuiteID}
        suiteName={activeSuite?.name ?? ''}
      />
      <EditorToolbar
        addText="Add Suite"
        onAdd={() => setConfirmNew(true)}
        removeText="Remove Suite"
        onRemove={suites.length > 1 ? () => setConfirmDelete(true) : undefined}
        editText="Edit Suites"
        onEdit={
          suiteMode === 'viewer'
            ? async () => window.sideAPI.state.toggleSuiteMode('editor')
            : undefined
        }
        viewText="Run Suites"
        onView={
          suiteMode === 'editor'
            ? async () => window.sideAPI.state.toggleSuiteMode('viewer')
            : undefined
        }
      >
        {children}
      </EditorToolbar>
    </>
  )
}

export default SuitesToolbar
