import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import defaultProject from 'api/models/project'
import defaultState from 'api/models/state'
import { CoreSessionData } from 'api/types'

const performSubscription = async (
  updateSession: Dispatch<SetStateAction<CoreSessionData>>
) => {
  useEffect(() => {
    window.sideAPI.state.get().then(updateSession)
    const handler = (path: string, data: any) => {
      const [namespace, method] = path.split('.')
      console.debug('Queueing Mutator', path, data)
      updateSession((session) => {
        // @ts-expect-error
        const newSession = window.sideAPI.mutators[namespace][method](
          session,
          data
        )
        console.debug('Running Mutator', path, data, session, newSession)
        return newSession
      })
    }
    window.sideAPI.state.onMutate.addListener(handler)
    const removeHandler = () => window.sideAPI.state.onMutate.removeListener(handler)
    window.addEventListener('beforeunload', removeHandler)
    return removeHandler
  }, [])
}

export default () => {
  const [session, updateSession] = useState<CoreSessionData>({
    project: defaultProject,
    state: defaultState,
  })
  performSubscription(updateSession)
  return session
}
