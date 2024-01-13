import { hasID } from '@seleniumhq/side-api'
import {
  getActiveCommand,
  getActiveCommandIndex,
  getActiveTest,
} from '@seleniumhq/side-api/dist/helpers/getActiveData'
import { MenuComponent, Session } from 'main/types'
import { menuFactoryFromCommandFactory } from '../utils'

export const pluralize = (str: string, num: number) =>
  num < 2 ? str : `${str}s`

export const commandList: MenuComponent = (session) => () => {
  const sessionData = session.state.get()
  const editorState = sessionData.state.editor
  const copiedCommandCount = editorState.copiedCommands.length
  const selectedCommandCount = editorState.selectedCommandIndexes.length
  return [
    {
      accelerator: 'CommandOrControl+Shift+X',
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
      accelerator: 'CommandOrControl+Shift+C',
      click: async () => {
        await session.api.state.setCopiedCommands()
      },
      enabled: Boolean(selectedCommandCount),
      label: pluralize('Copy Command', selectedCommandCount),
    },
    {
      accelerator: 'CommandOrControl+Shift+V',
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
      accelerator: 'CommandOrControl+Shift+D',
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
    {
      accelerator: 'CommandOrControl+Shift+A',
      click: async () => {
        await session.api.tests.addSteps(
          sessionData.state.activeTestID,
          Math.max(0, getActiveCommandIndex(sessionData)),
          [{ command: 'click', target: '', value: '' }]
        )
      },
      enabled: true,
      label: 'Append Command',
    },
    {
      accelerator: 'CommandOrControl+Shift+I',
      click: async () => {
        await session.api.tests.addSteps(
          sessionData.state.activeTestID,
          Math.max(0, getActiveCommandIndex(sessionData) - 1),
          [{ command: 'click', target: '', value: '' }]
        )
      },
      enabled: true,
      label: 'Insert Command',
    },
  ]
}

export const recorderList = (session: Session) => () => {
  const selectedCommandCount =
    session.state.state.editor.selectedCommandIndexes.length
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

export const playbackList: MenuComponent =
  (session) => (_commandID?: string) => {
    const selectedCommandCount =
      session.state.state.editor.selectedCommandIndexes.length
    return [
      {
        click: async () => {
          const sessionData = await session.state.get()
          const commandID: string =
            _commandID || getActiveCommand(sessionData).id
          const activeTest = getActiveTest(sessionData)
          await session.api.playback.play(sessionData.state.activeTestID, [
            0,
            activeTest.commands.findIndex((cmd) => cmd.id === commandID),
          ])
        },
        label: 'Play To Here',
      },
      {
        accelerator: 'CommandOrControl+P',
        click: async () => {
          const sessionData = await session.state.get()
          const commandID: string =
            _commandID || getActiveCommand(sessionData).id
          const activeTest = getActiveTest(sessionData)
          await session.api.playback.play(sessionData.state.activeTestID, [
            activeTest.commands.findIndex((cmd) => cmd.id === commandID),
            -1,
          ])
        },
        enabled: selectedCommandCount === 1,
        label: 'Play From Here',
      },
      {
        click: async () => {
          const sessionData = await session.state.get()
          const commandID: string =
            _commandID || getActiveCommand(sessionData).id
          const activeTest = getActiveTest(sessionData)
          const index = activeTest.commands.findIndex(hasID(commandID))
          await session.api.playback.play(sessionData.state.activeTestID, [
            index,
            index,
          ])
        },
        enabled: selectedCommandCount === 1,
        label: 'Play This Step',
      },
      {
        accelerator: 'CommandOrControl+Shift+P',
        click: async () => {
          const sessionData = await session.state.get()
          await session.api.playback.play(sessionData.state.activeTestID)
        },
        label: 'Play From Start',
      },
    ]
  }

export const commands: MenuComponent = (session) => () => {
  const commands = commandList(session)()
  const recorder = recorderList(session)()
  const playback = playbackList(session)()
  return [
    ...commands,
    { type: 'separator' },
    ...recorder,
    { type: 'separator' },
    ...playback,
  ]
}

export default menuFactoryFromCommandFactory(commands)
