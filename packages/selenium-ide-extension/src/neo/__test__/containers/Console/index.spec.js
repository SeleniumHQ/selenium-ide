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

jest.mock('../../../IO/storage')
jest.mock('../../../side-effects/playback-logging')
import React from 'react'
import {
  cleanup,
  fireEvent,
  renderIntoDocument,
  waitForElement,
} from 'react-testing-library'
import Console from '../../../containers/Console'
import Logger from '../../../stores/view/Logs'

describe('<Console />', () => {
  afterEach(cleanup)
  it('should render', () => {
    const { container } = renderIntoDocument(<Console />)
    const console = container.querySelector('.console')
    const tabBar = container.querySelector('.tabbar')
    const viewPort = container.querySelector('.viewport')
    const logs = container.querySelector('.logs')
    expect(console).toBeInTheDocument()
    expect(tabBar).toBeInTheDocument()
    expect(viewPort).toBeInTheDocument()
    expect(logs).toBeInTheDocument()
  })
  it('should not display an unread log notification when viewing the log tab', () => {
    const { container } = renderIntoDocument(<Console />)
    Logger.log('blah')
    const unreadLogNotification = container.querySelector('.log.unread')
    expect(unreadLogNotification).toBeNull()
  })
  it('should display an unread log notification when viewing the reference tab)', async () => {
    const { container } = renderIntoDocument(<Console />)
    const referenceTab = container.querySelector('.reference')
    fireEvent.click(referenceTab)
    await waitForElement(() => container.querySelector('.command-reference'))
    Logger.log('blah')
    const unreadLogNotification = container.querySelector('.log.unread')
    expect(unreadLogNotification).toBeInTheDocument()
  })
})
