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

import config from './config'

const hooks = []

export async function emit(project, options = config, snapshot) {
  const configHooks = (await Promise.all(
    hooks.map(hook => hook({ name: project.name }))
  )).join('')
  if (!options.skipStdLibEmitting) {
    return `global.Key = require('selenium-webdriver').Key;global.URL = require('url').URL;global.BASE_URL = configuration.baseUrl || '${
      project.url
    }';let vars = {};${configHooks}${snapshot ? snapshot : ''}`
  } else {
    if (configHooks) {
      return {
        snapshot: configHooks,
      }
    } else {
      return {
        skipped: true,
      }
    }
  }
}

function registerHook(hook) {
  hooks.push(hook)
}

export default {
  emit,
  registerHook,
}
