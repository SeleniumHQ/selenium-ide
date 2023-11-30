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
import api from 'browser/api'
import apiMutators from 'browser/api/mutator'
import preload from 'browser/helpers/preload'
import { webFrame } from 'electron'
import Recorder from './preload/recorder'

(async () => {
  const plugins = await preload({
    recorder: api.recorder,
    mutators: { recorder: apiMutators.recorder },
  })
  window.addEventListener('DOMContentLoaded', async () => {
    webFrame.executeJavaScript(`
      Object.defineProperty(navigator, 'webdriver', {
        get () {
          return true
        } 
      })
    `)
    setTimeout(async () => {
      console.debug('Initializing the recorder')
      new Recorder(window, plugins.filter(Boolean) as PluginPreloadOutputShape[])
    }, 500)
  })
})();

/**
 * Expose it in the main context
 */
