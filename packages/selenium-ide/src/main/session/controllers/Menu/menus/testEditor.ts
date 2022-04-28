import { getActiveCommandIndex, getActiveTest } from 'api/helpers/getActiveData'
import { Menu } from 'electron'
import { MenuComponent, Session } from 'main/types'

export const pluralize = (str: string, num: number) =>
  num < 2 ? str : `${str}s`

export const commandList: MenuComponent = (session) => async () => {
  const sessionData = await session.state.get()
  const editorState = sessionData.state.editor
  const copiedCommandCount = editorState.copiedCommands.length
  const selectedCommandCount = editorState.selectedCommandIndexes.length
  return [
    {
      accelerator: 'X',
      click: async () => {
        await session.api.state.setCopiedCommands()
        await session.api.tests.removeSteps(
          sessionData.state.activeTestID,
          sessionData.state.editor.selectedCommandIndexes
        )
      },
      enabled: Boolean(selectedCommandCount),
      label: pluralize('Cut Command', selectedCommandCount),
    },
    {
      accelerator: 'C',
      click: async () => {
        await session.api.state.setCopiedCommands()
      },
      enabled: Boolean(selectedCommandCount),
      label: pluralize('Copy Command', selectedCommandCount),
    },
    {
      accelerator: 'V',
      click: async () => {
        await session.api.tests.addSteps(
          sessionData.state.activeTestID,
          Math.max(getActiveCommandIndex(sessionData) - 1),
          sessionData.state.editor.copiedCommands
        )
      },
      enabled: Boolean(copiedCommandCount),
      label: pluralize('Paste Command', copiedCommandCount),
    },
    {
      accelerator: 'D',
      click: async () => {
        const cmds = getActiveTest(sessionData).commands
        const allCommandsDisabled =
          sessionData.state.editor.selectedCommandIndexes
            .map((index) => cmds[index])
            .findIndex((cmd) => !cmd.command.startsWith('//')) === -1

        session.api.tests.toggleStepDisability(!allCommandsDisabled)
      },
      enabled: Boolean(selectedCommandCount),
      label: pluralize('Disable Command', selectedCommandCount),
    },
    {
      accelerator: 'Delete',
      click: async () => {
        await session.api.tests.removeSteps(
          sessionData.state.activeTestID,
          sessionData.state.editor.selectedCommandIndexes
        )
      },
      enabled: Boolean(selectedCommandCount),
      label: pluralize('Delete Command', selectedCommandCount),
    },
    {
      accelerator: 'Backspace',
      acceleratorWorksWhenHidden: true,
      click: async () => {
        await session.api.tests.removeSteps(
          sessionData.state.activeTestID,
          sessionData.state.editor.selectedCommandIndexes
        )
      },
      enabled: Boolean(selectedCommandCount),
      label: pluralize('Delete Command', selectedCommandCount),
      visible: false,
    },
  ]
}

export const recorderList = (session: Session) => async () => {
  const sessionData = await session.state.get()
  const editorState = sessionData.state.editor
  const selectedCommandCount = editorState.selectedCommandIndexes.length
  return [
    {
      accelerator: 'CommandOrControl+R',
      enabled: selectedCommandCount === 1,
      label: 'Record From Here',
      click: async () => {
        await session.api.recorder.start()
      },
    },
  ]
}

export const playbackList: MenuComponent = (session) => async () => {
  const sessionData = await session.state.get()
  const editorState = sessionData.state.editor
  const selectedCommandCount = editorState.selectedCommandIndexes.length
  return [
    {
      click: async () => {
        const activeTest = getActiveTest(sessionData)
        await session.api.playback.play(sessionData.state.activeTestID, [
          0,
          activeTest.commands.findIndex(
            (cmd) => cmd.id === sessionData.state.activeCommandID
          ),
        ])
      },
      enabled: selectedCommandCount === 1,
      label: 'Play To Here',
    },
    {
      accelerator: 'CommandOrControl+P',
      click: async () => {
        const activeTest = getActiveTest(sessionData)
        await session.api.playback.play(sessionData.state.activeTestID, [
          activeTest.commands.findIndex(
            (cmd) => cmd.id === sessionData.state.activeCommandID
          ),
          activeTest.commands.length - 1,
        ])
      },
      enabled: selectedCommandCount === 1,
      label: 'Play From Here',
    },
    {
      click: async () => {
        const activeTest = getActiveTest(sessionData)
        await session.api.playback.play(sessionData.state.activeTestID, [
          activeTest.commands.findIndex(
            (cmd) => cmd.id === sessionData.state.activeCommandID
          ),
          activeTest.commands.length - 1,
        ])
      },
      enabled: selectedCommandCount === 1,
      label: 'Play This Step',
    },
    {
      accelerator: 'CommandOrControl+Shift+P',
      click: async () => {
        await session.api.playback.play(sessionData.state.activeTestID)
      },
      label: 'Play From Start',
    },
  ]
}

export const testEditorCommands: MenuComponent = (session) => async () => {
  const commands = await commandList(session)()
  const recorder = await recorderList(session)()
  const playback = await playbackList(session)()
  return [
    ...commands,
    { type: 'separator' },
    ...recorder,
    { type: 'separator' },
    ...playback,
  ]
}

const testEditorMenu = (session: Session) => async () => {
  const menuItems = await testEditorCommands(session)()
  return Menu.buildFromTemplate(menuItems)
}

export default testEditorMenu
