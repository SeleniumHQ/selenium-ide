import React, { useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import { LoadedWindow } from 'browser/types'
import { ProjectShape } from 'api/types'

const { sideAPI } = window as LoadedWindow

const ProjectEditor = () => {
  const [project, setProject] = useState<ProjectShape | null>(null)
  useEffect(() => {
    sideAPI.projects.getActive().then((activeProject) => {
      setProject(activeProject)
    })
  }, [])
  const [activeTestID, setActiveTest] = useState<string | null>(null)
  const activeTest = useMemo(() => {
    const tests = project?.tests ?? []
    return tests.find((test) => test.id === activeTestID) || null
  }, [project, activeTestID])
  if (project === null) {
    return <div className="flex-col w-full">Loading project</div>
  }

  return (
    <div className="flex-col w-full">
      <div className="flex-initial">
        <h5 className="text-lg">Project Editor</h5>
      </div>
      <div className="flex-1 flex-row">
        <div className={`w-5/12 overscroll-y-contain max-h`}>
          {project.tests.map((test) => (
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l w-full"
              onClick={() => setActiveTest(test.id)}
              key={test.name}
            >
              {test.name}
            </button>
          ))}
        </div>
        {activeTest !== null && (
          <div className="w-7/12 overscroll-y-contain max-h">
            {activeTest.commands.map((v) => JSON.stringify(v))}
          </div>
        )}
      </div>
    </div>
  )
}

const domContainer = document.querySelector('#root')
ReactDOM.render(React.createElement(ProjectEditor), domContainer)
