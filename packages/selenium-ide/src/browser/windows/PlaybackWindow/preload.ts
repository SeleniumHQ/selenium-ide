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

;(async () => {
  console.log('Preloading?')
  const plugins = await preload({
    recorder: api.recorder,
    mutators: { recorder: apiMutators.recorder },
  })
  console.log('Preloading!')
  console.log('Executing webframe script?')
  webFrame.executeJavaScript(`
      Object.defineProperty(navigator, 'webdriver', {
        get () {
          return true
        } 
      })
    `)
  console.log('Executed webframe script?')
  console.log('Initializing the recorder')
  const recorder = new Recorder(
    window,
    plugins.filter(Boolean) as PluginPreloadOutputShape[]
  )
  recorder.attach()
  console.log('Recorder initialized')
})()
