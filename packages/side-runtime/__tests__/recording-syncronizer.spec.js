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

import createRecorderSyncronizer from '../src/recording-syncronizer'

describe('recording syncronizer', () => {
  it('should sync the current window', async () => {
    const executeAsyncScript = jest.fn()
    const {
      hooks: { onStoreWindowHandle },
    } = createRecorderSyncronizer({
      sessionId: 'default',
      executeAsyncScript,
    })

    await onStoreWindowHandle({ windowHandle: '1', windowHandleName: 'first' })

    expect(executeAsyncScript.mock.calls[0][0]).toMatchSnapshot()
  })

  it('should sync a new window when switching to it', async () => {
    const executeAsyncScript = jest.fn()
    const {
      hooks: { onWindowAppeared, onWindowSwitched },
    } = createRecorderSyncronizer({
      sessionId: 'default',
      executeAsyncScript,
    })

    await onWindowAppeared({ windowHandle: '1', windowHandleName: 'first' })
    await onWindowSwitched({ windowHandle: '1' })

    expect(executeAsyncScript.mock.calls[0][0]).toMatchSnapshot()
  })

  it('should not sync a window if switched to it twice', async () => {
    const executeAsyncScript = jest.fn()
    const {
      hooks: { onWindowAppeared, onWindowSwitched },
    } = createRecorderSyncronizer({
      sessionId: 'default',
      executeAsyncScript,
    })

    await onWindowAppeared({ windowHandle: '1', windowHandleName: 'first' })
    await onWindowSwitched({ windowHandle: '1' })
    await onWindowSwitched({ windowHandle: '1' })

    expect(executeAsyncScript).toHaveBeenCalledTimes(1)
  })

  it('should log if tried to switch to a window that has no handle', async () => {
    const executeAsyncScript = jest.fn()
    const error = jest.fn()
    const {
      hooks: { onWindowSwitched },
    } = createRecorderSyncronizer({
      sessionId: 'default',
      executeAsyncScript,
      logger: { error },
    })

    await onWindowSwitched({ windowHandle: '1' })

    expect(error.mock.calls[0][0]).toMatchSnapshot()
  })

  it('should sync a new window when called if onWindowSwitched was not called for it', async () => {
    const executeAsyncScript = jest.fn()
    const switchToWindow = jest.fn()
    const getWindowHandle = jest.fn()
    const {
      hooks: { onWindowAppeared },
      syncAllPendingWindows,
    } = createRecorderSyncronizer({
      sessionId: 'default',
      executeAsyncScript,
      switchToWindow,
      getWindowHandle,
    })

    await onWindowAppeared({ windowHandle: '1', windowHandleName: 'first' })
    await syncAllPendingWindows()

    expect(getWindowHandle).toHaveBeenCalledTimes(1)
    expect(switchToWindow).toHaveBeenCalledTimes(2)
    expect(executeAsyncScript.mock.calls[0][0]).toMatchSnapshot()
  })

  it('should not sync a new window more than once when called', async () => {
    const executeAsyncScript = jest.fn()
    const switchToWindow = jest.fn()
    const getWindowHandle = jest.fn()
    const {
      hooks: { onWindowAppeared },
      syncAllPendingWindows,
    } = createRecorderSyncronizer({
      sessionId: 'default',
      executeAsyncScript,
      switchToWindow,
      getWindowHandle,
    })

    await onWindowAppeared({ windowHandle: '1', windowHandleName: 'first' })
    await syncAllPendingWindows()
    await syncAllPendingWindows()

    expect(getWindowHandle).toHaveBeenCalledTimes(1)
    expect(switchToWindow).toHaveBeenCalledTimes(2)
    expect(executeAsyncScript).toHaveBeenCalledTimes(1)
  })

  it('should sync one window through hooks and one when asked', async () => {
    const executeAsyncScript = jest.fn()
    const switchToWindow = jest.fn()
    const getWindowHandle = jest.fn()
    const {
      hooks: { onWindowAppeared, onWindowSwitched },
      syncAllPendingWindows,
    } = createRecorderSyncronizer({
      sessionId: 'default',
      executeAsyncScript,
      switchToWindow,
      getWindowHandle,
    })

    await onWindowAppeared({ windowHandle: '1', windowHandleName: 'first' })
    await onWindowSwitched({ windowHandle: '1' })
    expect(executeAsyncScript).toHaveBeenCalledTimes(1)
    await onWindowAppeared({ windowHandle: '2', windowHandleName: 'second' })
    await syncAllPendingWindows()
    expect(executeAsyncScript).toHaveBeenCalledTimes(2)
  })

  it('should sync the active context', async () => {
    const executeAsyncScript = jest.fn()
    const { syncActiveContext } = createRecorderSyncronizer({
      sessionId: 'default',
      executeAsyncScript,
    })

    await syncActiveContext()

    expect(executeAsyncScript.mock.calls[0][0]).toMatchSnapshot()
  })
})
