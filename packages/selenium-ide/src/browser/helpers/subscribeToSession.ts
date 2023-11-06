import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { project as defaultProject, state as defaultState } from '@seleniumhq/side-api'
import { CoreSessionData } from '@seleniumhq/side-api'

const performSubscription = async (
  updateSession: Dispatch<SetStateAction<CoreSessionData>>
) => {
  useEffect(() => {
    window.sideAPI.state.get().then(updateSession)
    const handler = (path: string, data: any) => {
      const [namespace, method] = path.split('.')
      console.debug('Queueing Mutator', path, data)
      updateSession((session) => {
        // @ts-expect-error - We know this object to be truthy because onMutate always does 
        const newSession = window.sideAPI.mutators[namespace][method](
          session,
          data
        )
        console.debug('Running Mutator', path, data, session, newSession)
        return newSession
      })
    }
    window.sideAPI.state.onMutate.addListener(handler)
    const removeHandler = () => {
      try {
        window.sideAPI.state.onMutate.removeListener(handler)
      } catch (e) {}
    };
    // window.addEventListener('beforeunload', removeHandler)
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
