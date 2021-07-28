import { useEffect } from 'react'
import { useImmer } from 'use-immer'
import defaultProject from 'api/models/project'
import defaultState from 'api/models/state'
import { CoreSessionData } from 'api/types'
import { LoadedWindow } from 'browser/types'

const { sideAPI } = window as LoadedWindow

export default () => {
  const [session, updateSession] = useImmer<CoreSessionData>({
    project: defaultProject,
    state: defaultState,
  })
  useEffect(() => {
    Promise.all([sideAPI.commands.get(), sideAPI.projects.getActive()]).then(
      ([commandTypes, project]) => {
        updateSession((session) => {
          session.state.commands = commandTypes
          session.project = project
          session.state.activeTest = project.tests[0].id
          session.state.activeCommand = project.tests[0].commands[0].id
        })
      }
    )
    sideAPI.state.onMutate.addListener((path, { params, result }) => {

    }))
  }, [])
  return [session, updateSession]
}
