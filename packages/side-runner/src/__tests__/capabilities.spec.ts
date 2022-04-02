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

import Capabilities from '../capabilities'

describe('capabilities string parser', () => {
  it('should parse capability key', () => {
    const capabilities = 'browserName=chrome'
    expect(Capabilities.parseString(capabilities)).toEqual({
      browserName: 'chrome',
    })
  })
  it('should parse multiple capabilities keys', () => {
    const capabilities =
      'browserName=chrome platform=MAC unexpectedAlertBehaviour=ignore'
    expect(Capabilities.parseString(capabilities)).toEqual({
      browserName: 'chrome',
      platform: 'MAC',
      unexpectedAlertBehaviour: 'ignore',
    })
  })
  it('should parse quoted capability key', () => {
    const capabilities = 'browserName="chrome"'
    expect(Capabilities.parseString(capabilities)).toEqual({
      browserName: 'chrome',
    })
  })
  it('should parse multiword capability key', () => {
    const capabilities =
      'binary="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"'
    expect(Capabilities.parseString(capabilities)).toEqual({
      binary: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    })
    const capabilities2 =
      "binary='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'"
    expect(Capabilities.parseString(capabilities2)).toEqual({
      binary: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    })
  })
  it('should parse multiple multiword capability keys', () => {
    const expected = {
      browserName: 'internet explorer',
      version: 10,
      platform: 'Windows 8.1',
    }
    const capabilitiesSingleQuotes =
      "browserName='internet explorer' version=10.0 platform='Windows 8.1'"
    expect(Capabilities.parseString(capabilitiesSingleQuotes)).toEqual(expected)
    const capabilitiesDoubleQuotes =
      'browserName="internet explorer" version=10.0 platform="Windows 8.1"'
    expect(Capabilities.parseString(capabilitiesDoubleQuotes)).toEqual(expected)
  })
  it('should parse boolean capability key', () => {
    const capabilities = 'javascriptEnabled=false databaseEnabled=true'
    expect(Capabilities.parseString(capabilities)).toEqual({
      javascriptEnabled: false,
      databaseEnabled: true,
    })
  })
  it('should parse integer capability key', () => {
    const capabilities = 'elementScrollBehavior=1'
    expect(Capabilities.parseString(capabilities)).toEqual({
      elementScrollBehavior: 1,
    })
  })
  it('should parse dot-notation capability key', () => {
    const capabilities = 'webdriver.remote.sessionid=someId'
    expect(Capabilities.parseString(capabilities)).toEqual({
      webdriver: {
        remote: {
          sessionid: 'someId',
        },
      },
    })
  })
  it('should parse multiple dot-notation capability key', () => {
    const capabilities = `
webdriver.remote.sessionid=someId
webdriver.remote.username=username
    `
    expect(Capabilities.parseString(capabilities)).toEqual({
      webdriver: {
        remote: {
          sessionid: 'someId',
          username: 'username',
        },
      },
    })
  })
  it('should parse dot-notation arrays', () => {
    const capabilities = 'chromeOptions.args=[disable-infobars, headless]'
    expect(Capabilities.parseString(capabilities)).toEqual({
      chromeOptions: {
        args: ['disable-infobars', 'headless'],
      },
    })
  })
  it('should parse space separated capability keys', () => {
    const capabilities =
      'browserName =chrome platform= MAC unexpectedAlertBehaviour = ignore'
    expect(Capabilities.parseString(capabilities)).toEqual({
      browserName: 'chrome',
      platform: 'MAC',
      unexpectedAlertBehaviour: 'ignore',
    })
  })
  it('should trim the capability values', () => {
    const capabilities =
      'platform="  macOS 10.13   " chromeOptions.args=[   disable-infobars  ,  headless   ]'
    expect(Capabilities.parseString(capabilities)).toEqual({
      platform: 'macOS 10.13',
      chromeOptions: {
        args: ['disable-infobars', 'headless'],
      },
    })
  })
  it('should parse urls in list', () => {
    const capabilities = 'bypass=[http://localhost:434, http://localhost:321]'
    expect(Capabilities.parseString(capabilities)).toEqual({
      bypass: ['http://localhost:434', 'http://localhost:321'],
    })
  })
})
