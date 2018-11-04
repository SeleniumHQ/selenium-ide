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

import ConfigurationEmitter from '../src/configuration'

describe('configuration code emitter', () => {
  it('should emit project configuration', () => {
    const project = {
      url: 'http://www.seleniumhq.org',
    }
    return expect(ConfigurationEmitter.emit(project)).resolves.toBe(
      `global.Key = require('selenium-webdriver').Key;global.URL = require('url').URL;global.BASE_URL = configuration.baseUrl || '${
        project.url
      }';let vars = {};`
    )
  })
  it('should skip emitting project configuration when skipStdLibEmitting is set and there are no config hooks', () => {
    const project = {
      url: 'http://www.seleniumhq.org',
    }
    return expect(
      ConfigurationEmitter.emit(project, { skipStdLibEmitting: true })
    ).resolves.toEqual({
      skipped: true,
    })
  })
  it('should append the configuration snapshot to the config', () => {
    const project = {
      url: 'http://www.seleniumhq.org',
    }
    const snapshot = 'extra global config'
    return expect(
      ConfigurationEmitter.emit(project, undefined, snapshot)
    ).resolves.toBe(
      `global.Key = require('selenium-webdriver').Key;global.URL = require('url').URL;global.BASE_URL = configuration.baseUrl || '${
        project.url
      }';let vars = {};${snapshot}`
    )
  })
  it('should emit a snapshot of the hooks when skipStdLibEmitting is set', () => {
    const project = {
      url: 'http://www.seleniumhq.org',
    }
    ConfigurationEmitter.registerHook(() => 'some config code')
    return expect(
      ConfigurationEmitter.emit(project, { skipStdLibEmitting: true })
    ).resolves.toEqual({
      snapshot: 'some config code',
    })
  })
})
