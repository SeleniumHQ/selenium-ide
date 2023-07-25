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
import api from 'browser/api'
import apiMutators from 'browser/api/mutator'
import { contextBridge, ipcRenderer, webFrame } from 'electron'
import { identity } from 'lodash/fp'
import Recorder from './preload/recorder'

const pluginFromPath = ([pluginPath, preloadPath]: [string, string]) => {
  try {
    const pluginPreload = __non_webpack_require__(preloadPath)
    const pluginHandler =
      typeof pluginPreload === 'function'
        ? pluginPreload
        : pluginPreload.default
    return pluginHandler((...args: any[]) =>
      ipcRenderer.send(`message-${pluginPath}`, ...args)
    )
  } catch (e) {
    console.error(e)
    return null
  }
}

/**
 * Expose it in the main context
 */
window.addEventListener('DOMContentLoaded', async () => {
  webFrame.executeJavaScript(`
    Object.defineProperty(navigator, 'webdriver', {
      get () {
        return true
      } 
    })
  `)
  window.sideAPI = {
    recorder: api.recorder,
    // @ts-expect-error
    mutators: { recorder: apiMutators.recorder },
  }
  const pluginPaths = await api.plugins.list()
  const preloadPaths = await api.plugins.listPreloadPaths()
  const richPlugins: [string, string][] = pluginPaths.map((p, i) => [p, preloadPaths[i]])
  const plugins = richPlugins.map(pluginFromPath).filter(identity)

  contextBridge.exposeInMainWorld('sideAPI', window.sideAPI)
  setTimeout(async () => {
    console.debug('Initializing the recorder')
    new Recorder(window, plugins)
  }, 500)
})
