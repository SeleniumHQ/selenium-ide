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
import Router from '../../router'
import Manager from '../../plugin/manager'
import logger from '../../neo/stores/view/Logs'
import { LogTypes } from '../../neo/ui-models/Log'
import playbackRouter from './playback'
import recordRouter from './record'
import exportRouter from './export'
import popupRouter from './popup'
import UiState from '../../neo/stores/view/UiState'
import WindowSession from '../../neo/IO/window-session'
import ModalState from '../../neo/stores/view/ModalState'
import { loadJSProject } from '../../neo/IO/filesystem'
import manager from '../../plugin/manager'

const router = new Router()

const errors = {
  cannotAccessInControlMode: {
    errorCode: 'CannotAccessInControlMode',
    error: 'Selenium IDE is controlled by a different extension.',
  },
  missingPlugin: {
    errorCode: 'MissingPlugin',
    error: 'Plugin is not registered.',
  },
  missingController: {
    errorCode: 'missingController',
    error: 'No controller specified.',
  },
  missingProject: {
    errorCode: 'MissingProject',
    error: 'Project is missing.',
  },
}

function isFromController(req) {
  return Manager.controller && manager.controller.id === req.sender
}

function controlledOnly(req, res) {
  if (!Manager.controller || isFromController(req)) {
    return Promise.resolve()
  } else {
    res(errors.cannotAccessInControlMode)
    return Promise.reject()
  }
}

function tryOverrideControl(req) {
  if (!ModalState.welcomeState.completed) {
    ModalState.hideWelcome()
  }
  WindowSession.focusIDEWindow()
  return ModalState.showAlert({
    title: 'Assisted Control',
    description: `${req.name} is trying to control Selenium IDE`,
    confirmLabel: 'Restart and Allow access',
    cancelLabel: 'Deny access',
  }).then(r => {
    if (r) {
      const plugin = {
        id: req.sender,
        name: req.name,
        version: req.version,
        commands: req.commands,
        dependencies: req.dependencies,
        jest: req.jest,
        exports: req.exports,
      }
      return browser.runtime.sendMessage({ restart: true, controller: plugin })
    } else {
      return Promise.reject()
    }
  })
}

router.get('/health', (req, res) => {
  res(Manager.hasPlugin(req.sender))
})

router.post('/register', (req, res) => {
  controlledOnly(req, res).then(() => {
    const plugin = {
      id: req.sender,
      name: req.name,
      version: req.version,
      commands: req.commands,
      dependencies: req.dependencies,
      jest: req.jest,
      exports: req.exports,
    }
    Manager.registerPlugin(plugin)
    res(true)
  })
})

router.post('/log', (req, res) => {
  controlledOnly(req, res).then(() => {
    if (req.type === LogTypes.Error) {
      logger.error(`${Manager.getPlugin(req.sender).name}: ${req.message}`)
    } else if (req.type === LogTypes.Warning) {
      logger.warn(`${Manager.getPlugin(req.sender).name}: ${req.message}`)
    } else {
      logger.log(`${Manager.getPlugin(req.sender).name}: ${req.message}`)
    }
    res(true)
  })
})

router.get('/project', (_req, res) => {
  controlledOnly(_req, res).then(() => {
    res({ id: UiState.project.id, name: UiState.project.name })
  })
})

router.post('/control', (req, res) => {
  if (isFromController(req)) {
    res(true)
  } else {
    tryOverrideControl(req)
      .then(() => res(true))
      .catch(() => res(false))
  }
})

router.post('/close', (req, res) => {
  controlledOnly(req, res).then(() => {
    // Not allow close if is not control mode.
    if (!UiState.isControlled) {
      return res(false)
    }
    const plugin = Manager.getPlugin(req.sender)
    if (!plugin) return res(errors.missingPlugin)
    if (!UiState.isSaved()) {
      ModalState.showAlert({
        title: 'Close project without saving',
        description: `${
          plugin.name
        } is trying to close a project, are you sure you want to load this project and lose all unsaved changes?`,
        confirmLabel: 'proceed',
        cancelLabel: 'cancel',
      }).then(result => {
        if (result) {
          window.close()
          res(true)
        }
      })
      res(false)
    } else {
      window.close()
      res(true)
    }
  })
})

//Using '/private/' as a prefix for internal APIs
router.post('/private/close', res => {
  window.close()
  res(true)
})

router.post('/private/connect', (req, res) => {
  if (req.controller && req.controller.id) {
    Manager.controller = req.controller
    UiState.startConnection()
    Manager.registerPlugin(req.controller)
    return res(true)
  } else {
    return res(errors.missingController)
  }
})

router.post('/project', (req, res) => {
  controlledOnly(req, res).then(() => {
    const plugin = Manager.getPlugin(req.sender)
    if (!plugin) return res(errors.missingPlugin)
    if (!req.project) return res(errors.missingProject)

    if (!UiState.isSaved()) {
      WindowSession.focusIDEWindow()
      ModalState.showAlert({
        title: 'Open project without saving',
        description: `${
          plugin.name
        } is trying to load a project, are you sure you want to load this project and lose all unsaved changes?`,
        confirmLabel: 'proceed',
        cancelLabel: 'cancel',
      }).then(result => {
        if (result) {
          loadJSProject(UiState.project, req.project)
          ModalState.completeWelcome()
          res(true)
        }
      })
    } else {
      WindowSession.focusIDEWindow()
      loadJSProject(UiState.project, req.project)
      ModalState.completeWelcome()
      res(true)
    }
    res(false)
  })
})

router.use('/playback', playbackRouter)
router.use('/record', recordRouter)
router.use('/export', exportRouter)
router.use('/popup', popupRouter)

export default router
