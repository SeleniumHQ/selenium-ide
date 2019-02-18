// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import browser from 'webextension-polyfill'
import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import SplitPane from 'react-split-pane'
import classNames from 'classnames'
import { modifier } from 'modifier-keys'
import Tooltip from '../../components/Tooltip'
import storage from '../../IO/storage'
import ProjectStore from '../../stores/domain/ProjectStore'
import seed from '../../stores/seed'
import SuiteDropzone from '../../components/SuiteDropzone'
import PauseBanner from '../../components/PauseBanner'
import ProjectHeader from '../../components/ProjectHeader'
import Navigation from '../Navigation'
import Editor from '../Editor'
import Console from '../Console'
import Modal from '../Modal'
import Changelog from '../../components/Changelog'
import UiState from '../../stores/view/UiState'
import PlaybackState from '../../stores/view/PlaybackState'
import ModalState from '../../stores/view/ModalState'
import '../../side-effects/contextMenu'
import '../../styles/app.css'
import '../../styles/font.css'
import '../../styles/layout.css'
import '../../styles/resizer.css'
import { isProduction, isTest, userAgent } from '../../../common/utils'
import Logger from '../../stores/view/Logs'

import { loadProject, saveProject, loadJSProject } from '../../IO/filesystem'

if (!isTest) {
  const api = require('../../../api')
  browser.runtime.onMessage.addListener(api.default)
}

if (userAgent.os.name === 'Windows') {
  require('../../styles/conditional/scrollbar.css')
  require('../../styles/conditional/button-direction.css')
  require('../../styles/conditional/text.css')
}

const project = observable(new ProjectStore(''))

UiState.setProject(project)

if (isProduction) {
  createDefaultSuite(project, { suite: '', test: '' })
} else {
  seed(project)
}
project.setModified(false)

function createDefaultSuite(
  aProject,
  name = { suite: 'Default Suite', test: 'Untitled' }
) {
  const suite = aProject.createSuite(name.suite)
  const test = aProject.createTestCase(name.test)
  suite.addTestCase(test)
  UiState.selectTest(test)
}

function firefox57WorkaroundForBlankPanel() {
  // TODO: remove this as soon as Mozilla fixes https://bugzilla.mozilla.org/show_bug.cgi?id=1425829
  // browser. windows. create () displays blank windows (panel, popup or detached_panel)
  // The trick to display content is to resize the window...
  // We do not check the browser since this doesn't affect chrome at all

  function getCurrentWindow() {
    return browser.windows.getCurrent()
  }

  getCurrentWindow().then(currentWindow => {
    const updateInfo = {
      width: currentWindow.width,
      height: currentWindow.height + 1, // 1 pixel more than original size...
    }
    browser.windows.update(currentWindow.id, updateInfo)
  })
}

if (browser.windows) {
  firefox57WorkaroundForBlankPanel()
}

@DragDropContext(HTML5Backend)
@observer
export default class Panel extends React.Component {
  constructor(props) {
    super(props)
    this.state = { project }
    this.parseKeyDown = this.parseKeyDown.bind(this)
    this.keyDownHandler = window.document.body.onkeydown = this.handleKeyDown.bind(
      this
    )
    if (isProduction) {
      // the handler writes the size to the extension storage, which throws in development
      this.resizeHandler = window.addEventListener(
        'resize',
        this.handleResize.bind(this, window)
      )
      this.quitHandler = window.addEventListener('beforeunload', e => {
        if (project.modified) {
          const confirmationMessage =
            'You have some unsaved changes, are you sure you want to leave?'

          e.returnValue = confirmationMessage
          return confirmationMessage
        }
      })
      this.moveInterval = setInterval(() => {
        storage.set({
          origin: {
            top: window.screenY,
            left: window.screenX,
          },
        })
      }, 3000)
    }
  }
  handleResize(currWindow) {
    UiState.setWindowHeight(currWindow.innerHeight)
    storage.set({
      size: {
        height: currWindow.outerHeight,
        width: currWindow.outerWidth,
      },
    })
  }
  parseKeyDown(e) {
    modifier(e)
    return {
      key: e.key.toUpperCase(),
      primaryAndShift: e.primaryKey && e.shiftKey,
      onlyPrimary: e.primaryKey && !e.secondaryKey,
      noModifiers: !e.primaryKey && !e.secondaryKey,
    }
  }
  handleKeyDown(e) {
    const keyComb = this.parseKeyDown(e)
    // when editing these, remember to edit the button's tooltip as well
    if (keyComb.primaryAndShift && keyComb.key === 'N') {
      e.preventDefault()
      this.loadNewProject()
    } else if (keyComb.onlyPrimary && keyComb.key === 'N') {
      e.preventDefault()
    } else if (keyComb.onlyPrimary && keyComb.key === 'S') {
      e.preventDefault()
      saveProject(this.state.project)
    } else if (keyComb.onlyPrimary && keyComb.key === 'O' && this.openFile) {
      e.preventDefault()
      this.openFile()
    } else if (keyComb.onlyPrimary && keyComb.key === '1') {
      // test view
      e.preventDefault()
      UiState.changeView(UiState.views[+keyComb.key - 1])
    } else if (keyComb.onlyPrimary && keyComb.key === '2') {
      // suite view
      e.preventDefault()
      UiState.changeView(UiState.views[+keyComb.key - 1])
    } else if (keyComb.onlyPrimary && keyComb.key === '3') {
      // execution view
      e.preventDefault()
      UiState.changeView(UiState.views[+keyComb.key - 1])
    } else if (keyComb.primaryAndShift && e.code === 'KeyR' && isProduction) {
      // run suite
      e.preventDefault()
      if (PlaybackState.canPlaySuite) {
        PlaybackState.playSuiteOrResume()
      }
    } else if (keyComb.onlyPrimary && keyComb.key === 'R' && isProduction) {
      // run test
      e.preventDefault()
      if (!PlaybackState.isPlayingSuite) {
        PlaybackState.playTestOrResume()
      }
    } else if (keyComb.onlyPrimary && keyComb.key === 'P') {
      // pause
      e.preventDefault()
      PlaybackState.pauseOrResume()
    } else if (keyComb.onlyPrimary && keyComb.key === '.') {
      // stop
      e.preventDefault()
      PlaybackState.abortPlaying()
    } else if (keyComb.onlyPrimary && keyComb.key === "'") {
      // step over
      e.preventDefault()
      PlaybackState.stepOver()
    } else if (keyComb.onlyPrimary && keyComb.key === 'Y') {
      // disable breakpoints
      e.preventDefault()
      PlaybackState.toggleDisableBreakpoints()
    } else if (keyComb.onlyPrimary && keyComb.key === 'U') {
      // record
      e.preventDefault()
      if (!PlaybackState.isPlaying) {
        UiState.toggleRecord()
      }
    }
  }
  handleKeyDownAlt(e) {
    // The escape key is used in internal dialog modals to cancel. But the key
    // bubbles to the body event listener in Panel's ctor. Moving the event
    // listener into the top-level div in render prevents the keys from being
    // recognized unless an internal component has focus (e.g., selecting a test,
    // a test command, or an element within the command form).
    //
    // To fix, separating the key handling into two functions. One with just escape
    // that will live on the top-level div. The other with the remaining keys that
    // will live in an event listener on document.body.
    const key = this.parseKeyDown(e)
    if (key.noModifiers && key.key === 'ESCAPE') {
      UiState.toggleConsole()
    }
  }
  async loadNewProject() {
    if (!UiState.isSaved()) {
      const choseProceed = await ModalState.showAlert({
        title: 'Create without saving',
        description:
          'Are you sure you would like to create a new project without saving the current one?',
        confirmLabel: 'proceed',
        cancelLabel: 'cancel',
      })
      if (choseProceed) {
        await UiState.stopRecording({ nameNewTest: false })
        this.createNewProject()
      }
    } else if (UiState.isRecording) {
      const choseProceed = await ModalState.showAlert({
        title: 'Stop recording',
        description:
          'Leaving this project and creating a new one will stop the recording process. Would you like to continue?',
        confirmLabel: 'proceed',
        cancelLabel: 'cancel',
      })
      if (choseProceed) {
        await UiState.stopRecording({ nameNewTest: false })
        this.createNewProject()
      }
    } else {
      this.createNewProject()
    }
  }
  async createNewProject() {
    const name = await ModalState.renameProject()
    const newProject = observable(new ProjectStore(name))
    createDefaultSuite(newProject)
    loadJSProject(this.state.project, newProject.toJS())
    Logger.clearLogs()
    newProject.setModified(false)
  }
  componentWillUnmount() {
    if (isProduction) {
      clearInterval(this.moveInterval)
      window.removeEventListener('resize', this.resizeHandler)
      window.removeEventListener('beforeunload', this.quitHandler)
    }
  }
  render() {
    return (
      <div className="container" onKeyDown={this.handleKeyDownAlt.bind(this)}>
        <SuiteDropzone
          loadProject={loadProject.bind(undefined, this.state.project)}
        >
          <SplitPane
            split="horizontal"
            minSize={UiState.minContentHeight}
            maxSize={UiState.maxContentHeight}
            size={UiState.windowHeight - UiState.consoleHeight}
            onChange={size => UiState.resizeConsole(window.innerHeight - size)}
            style={{
              position: 'initial',
            }}
          >
            <div className="wrapper">
              <PauseBanner />
              <ProjectHeader
                title={this.state.project.name}
                changed={this.state.project.modified}
                changeName={this.state.project.changeName}
                openFile={openFile => {
                  this.openFile = openFile
                }}
                load={loadProject.bind(undefined, this.state.project)}
                save={() => saveProject(this.state.project)}
                new={this.loadNewProject.bind(this)}
              />
              <div
                className={classNames('content', {
                  dragging: UiState.navigationDragging,
                })}
              >
                <SplitPane
                  split="vertical"
                  minSize={UiState.minNavigationWidth}
                  maxSize={UiState.maxNavigationWidth}
                  size={UiState.navigationWidth}
                  onChange={UiState.resizeNavigation}
                >
                  <Navigation
                    tests={UiState.filteredTests}
                    suites={this.state.project.suites}
                    duplicateTest={this.state.project.duplicateTestCase}
                  />
                  <Editor
                    url={this.state.project.url}
                    urls={this.state.project.urls}
                    setUrl={this.state.project.setUrl}
                    test={UiState.displayedTest}
                    callstackIndex={UiState.selectedTest.stack}
                  />
                </SplitPane>
              </div>
            </div>
            <Console
              height={UiState.consoleHeight}
              restoreSize={UiState.restoreConsoleSize}
            />
          </SplitPane>
          <Modal
            project={this.state.project}
            createNewProject={this.createNewProject.bind(this)}
          />
          <Changelog />
          <Tooltip />
        </SuiteDropzone>
      </div>
    )
  }
}
