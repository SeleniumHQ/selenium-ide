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

import FatalError from '../../../errors/fatal'
import NoResponseError from '../../../errors/no-response'
import PlaybackState, { PlaybackStates } from '../../stores/view/PlaybackState'
import { canExecuteCommand } from '../../../plugin/commandExecutor'
import { createPlaybackTree } from '../../playback/playback-tree'
import { ControlFlowCommandChecks } from '../../models/Command'
import Logger from '../../stores/view/Logs'
import { isProduction } from '../../../common/utils'

let baseUrl = ''
let ignoreBreakpoint = false
let breakOnNextCommand = false
let executor = undefined

export function play(currUrl, exec, variables) {
  baseUrl = currUrl
  ignoreBreakpoint = false
  breakOnNextCommand = false
  executor = exec
  initPlaybackTree()
  return prepareToPlay(variables)
    .then(executionLoop)
    .then(finishPlaying)
    .catch(catchPlayingError)
}

export function playSingleCommand(command) {
  breakOnNextCommand = false
  initPlaybackTree(command)
  return runNextCommand().catch(catchPlayingError)
}

export function resumePlayback() {
  ignoreBreakpoint = true
  playAfterConnectionFailed()
}

function initPlaybackTree(command) {
  const queue = command ? [command] : PlaybackState.runningQueue
  try {
    if (
      PlaybackState.runningQueue.length === 1 &&
      ControlFlowCommandChecks.isControlFlow(queue[0].command)
    ) {
      reportError(
        "Unable to execute control flow command by itself. You can execute this \
        command by running the entire test or by right-clicking on the command \
        and selecting 'Play from here'.",
        false,
        0
      )
    } else {
      let playbackTree = createPlaybackTree(queue, PlaybackState.isPlayFromHere)
      PlaybackState.setCurrentExecutingCommandNode(
        playbackTree.startingCommandNode
      )
    }
  } catch (error) {
    reportError(error.message, false, error.index)
  }
}

function playAfterConnectionFailed() {
  if (PlaybackState.isSingleCommandRunning) {
    prepareToPlayAfterConnectionFailed()
      .then(runNextCommand)
      .catch(catchPlayingError)
  } else {
    prepareToPlayAfterConnectionFailed()
      .then(executionLoop)
      .then(finishPlaying)
      .catch(catchPlayingError)
  }
}

function didFinishQueue() {
  return !PlaybackState.currentExecutingCommandNode
}

function isStopping() {
  return (
    !PlaybackState.isPlaying || PlaybackState.paused || PlaybackState.isStopping
  )
}

function isCallStackEmpty() {
  return !PlaybackState.callstack.length
}

function executionLoop() {
  if (didFinishQueue() && !isCallStackEmpty()) {
    PlaybackState.unwindTestCase()
    return executionLoop()
  } else if (isStopping() || didFinishQueue()) {
    return false
  }

  return runNextCommand()
}

function runNextCommand() {
  const command = PlaybackState.currentExecutingCommandNode.command
  const stackIndex = PlaybackState.callstack.length
    ? PlaybackState.callstack.length - 1
    : undefined
  PlaybackState.setCommandState(command.id, PlaybackStates.Pending)
  if (!PlaybackState.isSingleCommandRunning) {
    // breakpoint
    if (
      !PlaybackState.breakpointsDisabled &&
      !ignoreBreakpoint &&
      (command.isBreakpoint || breakOnNextCommand)
    ) {
      PlaybackState.break(command)
      breakOnNextCommand = false
    } else if (ignoreBreakpoint) ignoreBreakpoint = false
    // we need to ignore breakOnNextCommand once, to make sure it actually hits the next command
    if (PlaybackState.breakOnNextCommand) {
      breakOnNextCommand = true
    }
    // paused
    if (isStopping()) return false
  }
  // TODO: this is a hack, find a way to put this inside ext-command
  if (
    !executor.isAlive() &&
    PlaybackState.currentExecutingCommandNode.command.command !== 'selectWindow'
  ) {
    executor.throwAliveError()
  } else if (
    PlaybackState.currentExecutingCommandNode.isWebDriverCommand(executor) ||
    PlaybackState.currentExecutingCommandNode.isExtCommand(executor)
  ) {
    return doDelay().then(() => {
      return PlaybackState.currentExecutingCommandNode
        .execute(executor)
        .then(result => {
          // we need to set the stackIndex manually because run command messes with that
          PlaybackState.setCommandStateAtomically(
            command.id,
            stackIndex,
            PlaybackStates.Passed
          )
          PlaybackState.setCurrentExecutingCommandNode(result.next)
        })
        .then(PlaybackState.isSingleCommandRunning ? () => {} : executionLoop)
    })
  } else if (isImplicitWait(command)) {
    notifyWaitDeprecation(command)
    return PlaybackState.isSingleCommandRunning
      ? Promise.resolve()
      : executionLoop()
  } else {
    return doPreWait()
      .then(doPreparation)
      .then(doPrePageWait)
      .then(doPageWait)
      .then(doAjaxWait)
      .then(doDomWait)
      .then(doDelay)
      .then(doCommand)
      .then(PlaybackState.isSingleCommandRunning ? () => {} : executionLoop)
  }
}

function prepareToPlay(variables) {
  return executor.init(
    baseUrl,
    PlaybackState.currentRunningTest.id,
    {
      // softInit will try to reconnect to the last session for the sake of running the command if possible
      softInit:
        PlaybackState.isSingleCommandRunning || PlaybackState.isPlayFromHere,
    },
    variables
  )
}

function prepareToPlayAfterConnectionFailed() {
  return Promise.resolve(true)
}

async function finishPlaying() {
  if (!PlaybackState.paused) {
    if (executor.cleanup) {
      await executor.cleanup()
    }
    PlaybackState.finishPlaying()
  }
}

function catchPlayingError(message) {
  if (executor.isReceivingEndError && executor.isReceivingEndError(message)) {
    setTimeout(function() {
      playAfterConnectionFailed()
    }, 100)
  } else {
    reportError(
      message instanceof Error || message.message ? message.message : message
    )
    finishPlaying()
  }
}

function reportError(error, nonFatal, index) {
  let id
  if (!isNaN(index)) {
    id = PlaybackState.runningQueue[index].id
  } else if (PlaybackState.currentExecutingCommandNode) {
    id = PlaybackState.currentExecutingCommandNode.command.id
  } else if (PlaybackState.playFromHereCommandId) {
    id = PlaybackState.playFromHereCommandId
  }
  let message = error
  if (
    error.message ===
    'this.playingFrameLocations[this.currentPlayingTabId] is undefined'
  ) {
    message =
      'The current tab is invalid for testing (e.g. about:home), surf to a webpage before using the extension'
  }
  PlaybackState.setCommandState(
    id,
    nonFatal ? PlaybackStates.Failed : PlaybackStates.Fatal,
    message
  )
}

function doPreWait() {
  return executor.waitForPageToLoad().then(() => true)
}

function doPreparation() {
  return executor.sendMessage('waitPreparation', '', '').then(function() {
    return true
  })
}

function doPrePageWait() {
  return executor.sendMessage('prePageWait', '', '').then(function(response) {
    if (response && response.new_page) {
      return doPrePageWait()
    } else {
      return true
    }
  })
}

function doPageWait(_res, pageTime, pageCount = 0) {
  return executor.sendMessage('pageWait', '', '').then(function(response) {
    if (pageTime && Date.now() - pageTime > 30000) {
      reportError('Page Wait timed out after 30000ms')
      return true
    } else if (response && response.page_done) {
      return true
    } else {
      pageCount++
      if (pageCount == 1) {
        pageTime = Date.now()
      }
      return doPageWait(false, pageTime, pageCount)
    }
  })
}

function doAjaxWait(_res, ajaxTime, ajaxCount = 0) {
  return executor.sendMessage('ajaxWait', '', '').then(function(response) {
    if (ajaxTime && Date.now() - ajaxTime > 30000) {
      reportError('Ajax Wait timed out after 30000ms')
      return true
    } else if (response && response.ajax_done) {
      return true
    } else {
      ajaxCount++
      if (ajaxCount == 1) {
        ajaxTime = Date.now()
      }
      return doAjaxWait(false, ajaxTime, ajaxCount)
    }
  })
}

function doDomWait(_res, domTime, domCount = 0) {
  return executor.sendMessage('domWait', '', '').then(function(response) {
    if (domTime && Date.now() - domTime > 30000) {
      reportError('DOM Wait timed out after 30000ms')
      return true
    } else if (response && Date.now() - response.dom_time < 400) {
      domCount++
      if (domCount == 1) {
        domTime = Date.now()
      }
      return doDomWait(false, domTime, domCount)
    } else {
      return true
    }
  })
}

function doCommand(_res, implicitTime = Date.now(), implicitCount = 0) {
  if (
    !PlaybackState.isSingleCommandRunning &&
    (!PlaybackState.isPlaying ||
      PlaybackState.isStopping ||
      PlaybackState.paused)
  )
    return
  const { command } = PlaybackState.currentExecutingCommandNode.command

  let count = 0
  function checkPageStatus(resolve, reject) {
    if (count > 60) {
      reportError('Timed out after 30000ms')
      reject('Window not Found')
    }
    if (!executor.getPageStatus()) {
      count++
    } else {
      resolve()
    }
  }

  let p = Promise.resolve()

  if (!executor.getPageStatus()) {
    p = new Promise(function(resolve, reject) {
      let interval
      let res = () => {
        clearInterval(interval)
        return resolve()
      }
      let rej = () => {
        clearInterval(interval)
        return reject()
      }
      interval = setInterval(() => checkPageStatus(res, rej)(), 500)
    })
  }

  p = Promise.resolve()

  return p
    .then(
      () =>
        canExecuteCommand(command)
          ? doPluginCommand(
              PlaybackState.currentExecutingCommandNode,
              implicitTime,
              implicitCount
            )
          : doSeleniumCommand(
              PlaybackState.currentExecutingCommandNode,
              implicitTime,
              implicitCount
            )
    )
    .then(result => {
      if (result) {
        PlaybackState.setCurrentExecutingCommandNode(result.next)
      }
    })
}

function doSeleniumCommand(commandNode, implicitTime, implicitCount) {
  const { id, command, target } = commandNode.command
  return commandNode.execute(executor).then(function(result) {
    if (result.result !== 'success') {
      // implicit
      if (isElementNotFound(result.result)) {
        return doImplicitWait(
          result.result,
          id,
          target,
          implicitTime,
          implicitCount
        )
      } else {
        let isVerify = /^verify/.test(command)
        PlaybackState.setCommandState(
          id,
          isVerify ? PlaybackStates.Failed : PlaybackStates.Fatal,
          result.result
        )
        return result
      }
    } else {
      PlaybackState.setCommandState(id, PlaybackStates.Passed)
      return result
    }
  })
}

function getPluginOptions(node) {
  return {
    commandId: node.command.id,
    isNested: !!PlaybackState.callstack.length,
    runId: PlaybackState.runId,
    testId: PlaybackState.currentRunningTest.id,
    frameId: executor.getCurrentPlayingFrameId(),
    tabId: executor.getCurrentPlayingTabId(),
    windowId: executor.getCurrentPlayingWindowId(),
  }
}

function doPluginCommand(commandNode, implicitTime, implicitCount) {
  const { id, target } = commandNode.command
  return PlaybackState.currentExecutingCommandNode
    .execute(executor, getPluginOptions(commandNode))
    .then(node => {
      PlaybackState.setCommandState(
        id,
        node.result.status ? node.result.status : PlaybackStates.Passed,
        (node.result && node.result.message) || undefined
      )
      return node
    })
    .catch(err => {
      if (isElementNotFound(err.message)) {
        return doImplicitWait(
          err.message,
          id,
          target,
          implicitTime,
          implicitCount
        )
      } else {
        PlaybackState.setCommandState(
          id,
          err instanceof FatalError || err instanceof NoResponseError
            ? PlaybackStates.Fatal
            : PlaybackStates.Failed,
          err.message
        )
        return { next: undefined }
      }
    })
}

function isElementNotFound(error) {
  return (
    error.match(/Element[\s\S]*?not (found|visible)/) ||
    error === 'Element is not currently visible and may not be manipulated'
  )
}

async function doLocatorFallback() {
  const node = PlaybackState.currentExecutingCommandNode
  const targets = node.command.targets
  let result
  const options = canExecuteCommand(node.command.command)
    ? getPluginOptions(node)
    : undefined

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i][0]
    result = await node.execute(executor, options, target)
    if (result.hasOwnProperty('next')) {
      PlaybackState.setCommandState(node.command.id, PlaybackStates.Passed)
      Logger.warn(
        `Element found with secondary locator ${target}. To use it by default, update the test step to use it as the primary locator.`
      )
      break
    }
  }

  return result
}

function getImplicitTimeout() {
  return isProduction ? 30000 : 5000
}

function doImplicitWait(error, commandId, target, implicitTime, implicitCount) {
  const timeout = getImplicitTimeout()
  if (isStopping()) {
    PlaybackState.setCommandState(
      commandId,
      PlaybackStates.Fatal,
      'Playback aborted'
    )
    return false
  } else if (isElementNotFound(error)) {
    if (implicitTime && Date.now() - implicitTime > timeout) {
      return doLocatorFallback().then(result => {
        if (result && result.result === 'success') return result
        reportError(`Implicit Wait timed out after ${timeout}ms`)
        implicitCount = 0
        implicitTime = ''
      })
    } else {
      implicitCount++
      if (implicitCount == 1) {
        implicitTime = Date.now()
      }
      PlaybackState.setCommandState(
        commandId,
        PlaybackStates.Pending,
        `Trying to find ${target}...`
      )
      return doCommand(false, implicitTime, implicitCount)
    }
  }
}

function doDelay() {
  return new Promise(res => {
    if (PlaybackState.currentExecutingCommandNode.next === undefined) {
      return res(true)
    } else {
      setTimeout(() => {
        return res(true)
      }, PlaybackState.delay)
    }
  })
}

function notifyWaitDeprecation(command) {
  reportError(
    `${command} is deprecated, Selenium IDE waits automatically instead`,
    true
  )
}

function isImplicitWait(command) {
  return command == 'waitForPageToLoad'
}
