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

const router = new Router()

const errors = {
  cannotAccessInControlMode: {
    errorCode: 'CannotAccessInControlMode',
    error: 'Selenium IDE is controlled by a different extension.',
  },
  missingPlugin: {
    errorCode: 'MissingPlugin',
    error: 'Plugin is not registered',
  },
  missingConnectionId: {
    errorCode: 'MissingConnectionId',
    error: 'No connection Id specified',
  },
  missingProject: {
    errorCode: 'MissingProject',
    error: 'Plugin is not registered',
  },
}

function checkControl(req) {
  return Manager.controller &&
    Manager.controller.connectionId != req.connectionId
    ? Promise.reject()
    : Promise.resolve()
}

function controlledOnly(req, res) {
  return checkControl(req).catch(() => {
    res(errors.cannotAccessInControlMode)
    return errors.cannotAccessInControlMode
  })
}

function tryOverrideControl(req) {
  if (!req.connectionId) return
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
        connectionId: req.connectionId,
        version: req.version,
        commands: req.commands,
        dependencies: req.dependencies,
        jest: req.jest,
        exports: req.exports,
      }
      browser.runtime.sendMessage({ restart: true, controller: plugin })
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
  checkControl(req)
    .then(() => {
      if (UiState.isControlled) {
        // Already in control mode with the same connection id.
        res(true)
      } else {
        // Already in non-control mode.
        tryOverrideControl(req)
          .then(() => res(true))
          .catch(() => res(false))
      }
    })
    .catch(() => {
      // Already in control mode but another connection come.
      tryOverrideControl(req)
        .then(() => res(true))
        .catch(() => res(false))
    })
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
        description: `${plugin.name} is trying to close a project, are you sure you want to load this project and lose all unsaved changes?`,
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

router.post('/_close', res => {
  window.close()
  res(true)
})

router.post('/_connect', (req, res) => {
  if (req.controller.connectionId) {
    Manager.controller = req.controller
    UiState.startConnection()
    Manager.registerPlugin(req.controller)
    return res(true)
  } else {
    return res(errors.missingConnectionId)
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
        description: `${plugin.name} is trying to load a project, are you sure you want to load this project and lose all unsaved changes?`,
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
