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
import { RecorderPreprocessor } from '@seleniumhq/side-api'
import api from 'browser/api'
import preload from 'browser/helpers/preload'
import { cb as ElectronInit } from 'browser/helpers/preload-electron'
import Recorder from './preload/recorder'
import { contextBridge, ipcRenderer, webFrame } from 'electron'

// This is a hack to get around the fact that the prompt is not
// available in the renderer process. This is a temporary solution
const polyfill = () => {
  const keys = ['alert', 'confirm', 'prompt']
  keys.forEach((key) => {
    contextBridge.exposeInMainWorld(key + '-polyfill', (...args: any[]) => {
      const result = ipcRenderer.sendSync(key + '-polyfill', ...args)
      return result
    })
    webFrame.executeJavaScript(`window.${key} = window['${key}-polyfill'];`)
  })
}

const recorderProcessors: RecorderPreprocessor[] = []
function injectRecorder() {
  return new Promise<void>((resolve) => {
    const isLoading = document.readyState === 'loading'
    const handler = async () => {
      polyfill()
      setTimeout(async () => {
        console.debug('Initializing the recorder')
        const recorder = new Recorder(window, recorderProcessors)
        recorder.attach()
        resolve()
      }, 500)
    }
    if (isLoading) {
      window.addEventListener('DOMContentLoaded', handler)
    } else {
      handler()
    }
  })
}

preload(
  {
    channels: api.channels,
    menus: {
      openSync: () => api.menus.openSync('playback'),
    },
    plugins: {
      addRecorderPreprocessor: (fn) => {
        recorderProcessors.push(fn)
      },
      getPreloads: api.plugins.getPreloads,
    },
    recorder: api.recorder,
  },
  ElectronInit(true),
  injectRecorder
)
