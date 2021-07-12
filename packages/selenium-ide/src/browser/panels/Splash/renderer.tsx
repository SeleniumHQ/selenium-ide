import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { LoadedWindow } from 'browser/types'

const { sideAPI } = window as LoadedWindow

const ProjectEditor = () => {
  const [recentProjects, setRecentProjects] = useState<string[]>([])
  useEffect(() => {
    sideAPI.projects.getRecent().then(setRecentProjects)
  }, [])
  const loadProject = async () => {
    const response = await sideAPI.dialogs.open()
    if (response.canceled) return
    sideAPI.projects.load(response.filePaths[0])
  }
  const newProject = () => sideAPI.projects.new()

  return (
    <div className="flex p-1">
      <form className="flex-auto py-7 px-8">
        <div className="flex flex-wrap items-baseline">
          <h1 className="w-full flex-none text-3xl text-black mb-1.5">
            Welcome to Selenium IDE v4
          </h1>
          <div className="text-sm text-gray-500 mb-3">
            Please load a project or create a new one
          </div>
        </div>
        <div className="flex space-x-3 mb-3 text-sm font-semibold uppercase">
          <div className="flex-auto flex space-x-3">
            <button
              className="w-1/2 flex items-center justify-center bg-black text-white py-4"
              onClick={loadProject}
              type="button"
            >
              Load Project
            </button>
            <button
              className="w-1/2 flex items-center justify-center border border-gray-200 py-4"
              onClick={newProject}
              type="button"
            >
              Create New Project
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-baseline mt-3">
          <h3 className="w-full flex-none text-xl text-dark-gray">
            Recent Projects:
          </h3>
          {recentProjects.map((filepath, index) => (
            <span
              className="text-sm text-gray-500 mb-3 mt-3 cursor-pointer"
              key={index}
              onClick={() => sideAPI.projects.load(filepath)}
            >
              {filepath}
            </span>
          ))}
        </div>
      </form>
    </div>
  )
}

const domContainer = document.querySelector('#root')

ReactDOM.render(React.createElement(ProjectEditor), domContainer)
