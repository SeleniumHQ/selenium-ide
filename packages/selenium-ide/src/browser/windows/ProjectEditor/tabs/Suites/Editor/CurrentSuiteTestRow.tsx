import { Close } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import Box from '@mui/material/Box'
import ListItemText from '@mui/material/ListItemText'
import { state } from '@seleniumhq/side-api'
import { TestShape } from '@seleniumhq/side-model'
import ReorderableListItem from 'browser/components/ReorderableListItem'
import { ReorderPreview } from 'browser/hooks/useReorderPreview'
import React, { FC } from 'react'

const camelToTitleCase = (text: string) => {
  const result = text.replace(/([A-Z])/g, ' $1')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

const commandTextFormat = { color: 'primary.main', typography: 'body2' }

interface CurrentSuiteTestRowProps {
  activeSuite: string
  index: number
  reorder: ReorderPreview
  reorderReset: () => void
  selected: boolean
  test: TestShape
}

const CurrentSuiteTestRow: FC<CurrentSuiteTestRowProps> = ({
  activeSuite,
  index,
  reorder,
  reorderReset,
  selected,
  test,
}) => (
  <ReorderableListItem
    className="pos-rel"
    divider
    dragType="TEST"
    id={test.id}
    index={index}
    onContextMenu={async () => {
      await window.sideAPI.state.updateTestSelection(
        index,
        false,
        true,
        false
      )
      await window.sideAPI.menus.open('testEditor', test.id)
    }}
    onClick={async (e) => {
      const selectBatch = e.shiftKey
      const addEntry = !e.altKey && (e.ctrlKey || e.metaKey || e.shiftKey)
      const clearSelection = !e.altKey && !e.shiftKey && !e.ctrlKey
      await window.sideAPI.state.updateTestSelection(
        index,
        selectBatch,
        addEntry,
        clearSelection
      )
    }}
    reorder={(_oldIndex, newIndex) => reorder({ newIndex })}
    reorderConfirm={(_oldIndex, newIndex, item) => {
      // @ts-expect-error
      if (!item.add) {
        window.sideAPI.suites.reorderTests(activeSuite, newIndex)
      }
    }}
    reorderReset={reorderReset}
    secondaryAction={
        <IconButton
          edge="end"
          onClick={() => window.sideAPI.suites.removeTests(activeSuite, [test.id])}
          size="small"
        >
          <Close />
        </IconButton>
    }
    selected={selected}
    select={window.sideAPI.state.updateTestSelection}
  >
    <ListItemText
      disableTypography
      primary={<Box sx={commandTextFormat}>{state.userPrefs.camelCaseNamesPref === "Yes" ? camelToTitleCase(test.name) : test.name }</Box>}
    />
  </ReorderableListItem>
)

export default CurrentSuiteTestRow
