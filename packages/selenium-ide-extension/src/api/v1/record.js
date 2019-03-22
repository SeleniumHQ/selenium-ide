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
import UiState from '../../neo/stores/view/UiState'
import { Commands } from '../../neo/models/Command'
import { recordCommand } from '../../neo/IO/SideeX/record'
import { select } from '../../neo/IO/SideeX/find-select'

const router = new Router()

router.get('/tab', (_req, res) => {
  if (!UiState.recorder.lastAttachedTabId) {
    res({ error: 'No active tab found' })
  } else {
    res({ id: UiState.recorder.lastAttachedTabId })
  }
})

router.get('/command', (_req, res) => {
  const test = UiState.displayedTest
  if (test) {
    res({ commands: test.commands.map(cmd => cmd.export()) })
  } else {
    res({ status: 'error', message: 'No test selected' })
  }
})

router.post('/command', (req, res) => {
  recordCommand(req.command, req.target, req.value, req.index, req.select)
  const type =
    Commands.list.has(req.command) && Commands.list.get(req.command).type
  if (req.select && type) {
    select(type, undefined, true)
  }
  res(true)
})

router.put('/command', (req, res) => {
  if (!req.id) {
    res({ status: 'error', message: 'No id sent' })
  } else {
    const test = UiState.displayedTest
    if (test) {
      const command = test.commands.find(cmd => cmd.id === req.id)
      if (command) {
        command.setCommand(req.command || '')
        command.setTarget(req.target || '')
        command.setValue(req.value || '')
        command.setTargets(Array.isArray(req.targets) ? req.targets : [])
        res(true)
      } else {
        res({
          status: 'error',
          message:
            'No command with that id exists in the currently displayed test',
        })
      }
    } else {
      res({ status: 'error', message: 'No test selected' })
    }
  }
})

router.delete('/command', (req, res) => {
  if (!req.id) {
    res({ status: 'error', message: 'No id sent' })
  } else {
    const test = UiState.displayedTest
    if (test) {
      const command = test.commands.find(cmd => cmd.id === req.id)
      if (command) {
        test.removeCommand(command)
        res(true)
      } else {
        res({
          status: 'error',
          message:
            'No command with that id exists in the currently displayed test',
        })
      }
    } else {
      res({ status: 'error', message: 'No test selected' })
    }
  }
})

export default router
