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

export default function createRecorderSyncronizer({
  sessionId,
  executeAsyncScript,
  switchToWindow,
  getWindowHandle,
  logger,
}) {
  const pendingWindows = {}
  const syncedWindows = {}

  async function onStoreWindowHandle({ windowHandle, windowHandleName }) {
    pendingWindows[windowHandle] = windowHandleName
    await syncWindowHandle(windowHandle)
  }

  async function onWindowAppeared({ windowHandle, windowHandleName }) {
    if (!syncedWindows[windowHandle]) {
      pendingWindows[windowHandle] = windowHandleName
    }
  }

  async function onWindowSwitched({ windowHandle }) {
    if (pendingWindows[windowHandle]) {
      await syncWindowHandle(windowHandle)
    } else if (!syncedWindows[windowHandle] && logger) {
      logger.error(
        `Tried to switch to window handle ${windowHandle} without it appearing first (onWindowAppeared was not called for it)`
      )
    }
  }

  async function syncActiveContext() {
    await executeAsyncScript(
      `return window.__side.setActiveContext("${sessionId}")`
    )
  }

  async function syncAllPendingWindows() {
    const pendingHandles = Object.keys(pendingWindows)

    if (pendingHandles.length) {
      const originalHandle = await getWindowHandle()

      for (let handle of pendingHandles) {
        await switchToWindow(handle)
        await syncWindowHandle(handle)
      }

      await switchToWindow(originalHandle)
    }
  }

  async function syncWindowHandle(windowHandle) {
    await executeAsyncScript(
      `return window.__side.setWindowHandle("${pendingWindows[windowHandle]}", "${sessionId}")`
    )
    syncedWindows[windowHandle] = pendingWindows[windowHandle]
    delete pendingWindows[windowHandle]
  }

  return {
    hooks: {
      onStoreWindowHandle,
      onWindowAppeared,
      onWindowSwitched,
    },
    syncActiveContext,
    syncAllPendingWindows,
  }
}
