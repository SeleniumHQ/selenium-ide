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
import { PluginPreloadOutputShape } from '@seleniumhq/side-api'
import api, { Api, BrowserApiMutators } from 'browser/api'
import mutators from 'browser/api/mutator'
import { contextBridge, ipcRenderer } from 'electron'

export default (
  apiSubset: Partial<Api> & { mutators: Partial<BrowserApiMutators> } = {
    ...api,
    mutators,
  }
) =>
  new Promise<(PluginPreloadOutputShape | null)[]>((resolve) => {
    const loadPluginFromPath = ([pluginPath, preloadPath]: [
      string,
      string
    ]): PluginPreloadOutputShape | null => {
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

    window.sideAPI = apiSubset as Api & { mutators: BrowserApiMutators }

    /**
     * Binds our API on initialization
     */
    process.once('loaded', async () => {
      /**
       * Expose it in the main context
       */
      contextBridge.exposeInMainWorld('sideAPI', window.sideAPI)
      const pluginPaths = await api.plugins.list()
      const preloadPaths = await api.plugins.listPreloadPaths()
      const richPlugins: [string, string][] = pluginPaths.map((p, i) => [
        p,
        preloadPaths[i],
      ])
      const plugins = richPlugins.map(loadPluginFromPath)
      resolve(plugins)
    })
  })
