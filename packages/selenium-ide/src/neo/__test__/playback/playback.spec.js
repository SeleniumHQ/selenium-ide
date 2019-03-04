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

import Playback, {
  PlaybackEvents,
  PlaybackStates,
  CommandStates,
} from '../../playback/playback'
import { AssertionError, VerificationError } from '../../playback/errors'
import FakeExecutor from '../util/FakeExecutor'

describe('Playback', () => {
  describe('Playback test queue', () => {
    it('should play a test', async () => {
      const test = [
        {
          command: 'open',
          target: '',
          value: '',
        },
        {
          command: 'open',
          target: '',
          value: '',
        },
        {
          command: 'open',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
      })
      await playback.play(test)
      expect(executor.doOpen).toHaveBeenCalledTimes(3)
    })

    it('should fail to play a test with an unknown command', async () => {
      const test = [
        {
          command: 'fail',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      const playback = new Playback({
        executor,
      })
      return expect(playback.play(test)).rejects.toBeInstanceOf(Error)
    })

    it('should pass a test with a failing verify', async () => {
      const test = [
        {
          command: 'verifyText',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doVerifyText = jest.fn(async () => {
        throw new VerificationError('failed to verify')
      })
      const playback = new Playback({
        executor,
      })
      expect(async () => await playback.play(test)).not.toThrow()
    })

    it('should play a single command', async () => {
      const command = {
        command: 'open',
        target: '',
        value: '',
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
      })
      await playback.playSingleCommand(command)
      expect(executor.doOpen).toHaveBeenCalledTimes(1)
    })
  })

  describe('resume', () => {
    it('resume a paused test', async () => {
      const test = [
        {
          id: 1,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 2,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 3,
          command: 'open',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(() => psetTimeout(10))
      const playback = new Playback({
        executor,
      })
      const cb = jest.fn()
      playback.on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults = []
      playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, r =>
        commandResults.push(r)
      )
      const playbackPromise = playback.play(test).catch(() => {})

      await psetTimeout(15)
      await playback.pause()
      await psetTimeout(15)
      await playback.resume()
      await playbackPromise

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(5)
      expect(results[0].state).toBe(PlaybackStates.PREPARATION)
      expect(results[1].state).toBe(PlaybackStates.PLAYING)
      expect(results[2].state).toBe(PlaybackStates.PAUSED)
      expect(results[3].state).toBe(PlaybackStates.PLAYING)
      expect(results[4].state).toBe(PlaybackStates.FINISHED)

      expect(commandResults).toMatchSnapshot()
    })

    it("resume is a no-op if test isn't paused", async () => {
      const test = [
        {
          id: 1,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 2,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 3,
          command: 'open',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(() => psetTimeout(0))
      const playback = new Playback({
        executor,
      })
      const playbackPromise = playback.play(test).catch(() => {})
      expect(() => playback.resume()).not.toThrow()

      await playbackPromise
    })

    it('resume after hitting a breakpoint', async () => {
      const test = [
        {
          id: 1,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 2,
          command: 'open',
          target: '',
          value: '',
          isBreakpoint: true,
        },
        {
          id: 3,
          command: 'open',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(() => psetTimeout(10))
      const playback = new Playback({
        executor,
      })
      const cb = jest.fn()
      playback.on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults = []
      playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, r =>
        commandResults.push(r)
      )
      const playbackPromise = playback.play(test).catch(() => {})

      await psetTimeout(15)
      await playback.resume()
      await playbackPromise

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(5)
      expect(results[0].state).toBe(PlaybackStates.PREPARATION)
      expect(results[1].state).toBe(PlaybackStates.PLAYING)
      expect(results[2].state).toBe(PlaybackStates.BREAKPOINT)
      expect(results[3].state).toBe(PlaybackStates.PLAYING)
      expect(results[4].state).toBe(PlaybackStates.FINISHED)

      expect(commandResults).toMatchSnapshot()
    })
  })

  describe('stop', () => {
    it('should stop a test', async () => {
      const test = [
        {
          id: 1,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 2,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 3,
          command: 'open',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(() => psetTimeout(10))
      const playback = new Playback({
        executor,
      })
      const cb = jest.fn()
      playback.on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults = []
      playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, r =>
        commandResults.push(r)
      )
      const playbackPromise = playback.play(test).catch(() => {})

      await psetTimeout(15)
      await playback.stop()
      await playbackPromise

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(3)
      expect(results[0].state).toBe(PlaybackStates.PREPARATION)
      expect(results[1].state).toBe(PlaybackStates.PLAYING)
      expect(results[2].state).toBe(PlaybackStates.STOPPED)

      expect(commandResults).toMatchSnapshot()
    })

    it('should stop a paused test', async () => {
      const test = [
        {
          id: 1,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 2,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 3,
          command: 'open',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(() => psetTimeout(10))
      const playback = new Playback({
        executor,
      })
      const cb = jest.fn()
      playback.on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults = []
      playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, r =>
        commandResults.push(r)
      )
      const playbackPromise = playback.play(test).catch(() => {})

      await psetTimeout(15)
      await playback.pause()
      await psetTimeout(15)
      await playback.stop()
      await playbackPromise

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(4)
      expect(results[0].state).toBe(PlaybackStates.PREPARATION)
      expect(results[1].state).toBe(PlaybackStates.PLAYING)
      expect(results[2].state).toBe(PlaybackStates.PAUSED)
      expect(results[3].state).toBe(PlaybackStates.STOPPED)

      expect(commandResults).toMatchSnapshot()
    })
  })

  describe('abort', () => {
    it('should abort a test', async () => {
      const test = [
        {
          id: 1,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 2,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 3,
          command: 'open',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(() => psetTimeout(10))
      const playback = new Playback({
        executor,
      })
      const cb = jest.fn()
      playback.on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults = []
      playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, r =>
        commandResults.push(r)
      )
      const playbackPromise = playback.play(test).catch(() => {})

      await psetTimeout(15)
      await playback.abort()
      await playbackPromise

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(3)
      expect(results[0].state).toBe(PlaybackStates.PREPARATION)
      expect(results[1].state).toBe(PlaybackStates.PLAYING)
      expect(results[2].state).toBe(PlaybackStates.ABORTED)

      expect(commandResults).toMatchSnapshot()
    })

    it('should abort a test after attempting to stop', async () => {
      const test = [
        {
          id: 1,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 2,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 3,
          command: 'open',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(() => psetTimeout(10))
      const playback = new Playback({
        executor,
      })
      const cb = jest.fn()
      playback.on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults = []
      playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, r =>
        commandResults.push(r)
      )
      const playbackPromise = playback.play(test).catch(() => {})

      await psetTimeout(15)
      playback.stop()
      await psetTimeout(2)
      await playback.abort()
      await playbackPromise

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(3)
      expect(results[0].state).toBe(PlaybackStates.PREPARATION)
      expect(results[1].state).toBe(PlaybackStates.PLAYING)
      expect(results[2].state).toBe(PlaybackStates.ABORTED)

      expect(commandResults).toMatchSnapshot()
    })

    it('should abort a paused test', async () => {
      const test = [
        {
          id: 1,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 2,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 3,
          command: 'open',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(() => psetTimeout(10))
      const playback = new Playback({
        executor,
      })
      const cb = jest.fn()
      playback.on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults = []
      playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, r =>
        commandResults.push(r)
      )
      const playbackPromise = playback.play(test).catch(() => {})

      await psetTimeout(15)
      await playback.pause()
      await psetTimeout(15)
      await playback.abort()
      await playbackPromise

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(4)
      expect(results[0].state).toBe(PlaybackStates.PREPARATION)
      expect(results[1].state).toBe(PlaybackStates.PLAYING)
      expect(results[2].state).toBe(PlaybackStates.PAUSED)
      expect(results[3].state).toBe(PlaybackStates.ABORTED)

      expect(commandResults).toMatchSnapshot()
    })
  })

  describe('pause on exceptions', () => {
    it('should pause until the command is fixed', async () => {
      const test = [
        {
          id: 1,
          command: 'open',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        throw new Error('error')
      })
      const playback = new Playback({
        executor,
        options: {
          pauseOnExceptions: true,
        },
      })
      const cb = jest.fn()
      playback.on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults = []
      playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, r =>
        commandResults.push(r)
      )
      const playbackPromise = playback.play(test).catch(() => {})

      await psetTimeout(5)
      await playback.resume()
      await psetTimeout(5)
      executor.doOpen.mockImplementation(async () => {})
      await playback.resume()
      await psetTimeout(100)
      await playbackPromise

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(7)
      expect(results[0].state).toBe(PlaybackStates.PREPARATION)
      expect(results[1].state).toBe(PlaybackStates.PLAYING)
      expect(results[2].state).toBe(PlaybackStates.BREAKPOINT)
      expect(results[3].state).toBe(PlaybackStates.PLAYING)
      expect(results[4].state).toBe(PlaybackStates.BREAKPOINT)
      expect(results[5].state).toBe(PlaybackStates.PLAYING)
      expect(results[6].state).toBe(PlaybackStates.FINISHED)

      expect(commandResults).toMatchSnapshot()
    })

    it('should pause for every type of error', async () => {
      const test = [
        {
          id: 1,
          command: 'open',
          target: '',
          value: '',
        },
        {
          id: 2,
          command: 'verify',
          target: '',
          value: '',
        },
        {
          id: 3,
          command: 'assert',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        throw new Error('error')
      })
      executor.doVerify = jest.fn(async () => {
        throw new VerificationError('error in verify')
      })
      executor.doAssert = jest.fn(async () => {
        throw new AssertionError('error in assert')
      })
      const playback = new Playback({
        executor,
        options: {
          pauseOnExceptions: true,
        },
      })
      const cb = jest.fn()
      playback.on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults = []
      playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, r =>
        commandResults.push(r)
      )
      const playbackPromise = playback.play(test).catch(() => {})

      await psetTimeout(5)
      executor.doOpen.mockImplementation(async () => {})
      await playback.resume()
      await psetTimeout(5)
      executor.doVerify.mockImplementation(async () => {})
      await playback.resume()
      await psetTimeout(5)
      executor.doAssert.mockImplementation(async () => {})
      await psetTimeout(5)
      await playback.resume()
      await playbackPromise

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(9)
      expect(results[0].state).toBe(PlaybackStates.PREPARATION)
      expect(results[1].state).toBe(PlaybackStates.PLAYING)
      expect(results[2].state).toBe(PlaybackStates.BREAKPOINT)
      expect(results[3].state).toBe(PlaybackStates.PLAYING)
      expect(results[4].state).toBe(PlaybackStates.BREAKPOINT)
      expect(results[5].state).toBe(PlaybackStates.PLAYING)
      expect(results[6].state).toBe(PlaybackStates.BREAKPOINT)
      expect(results[7].state).toBe(PlaybackStates.PLAYING)
      expect(results[8].state).toBe(PlaybackStates.FINISHED)

      expect(commandResults).toMatchSnapshot()
    })
  })

  describe('delay between commands', () => {
    it('should delay between commands', async () => {
      const test = [
        {
          command: 'open',
          target: '',
          value: '',
        },
        {
          command: 'open',
          target: '',
          value: '',
        },
        {
          command: 'open',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
        options: {
          delay: 5,
        },
      })
      const d = new Date()
      await playback.play(test)
      expect(new Date() - d).toBeGreaterThan(10)
    })

    it('should be able to pause mid-delay', async () => {
      const test = [
        {
          command: 'open',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
        options: {
          delay: 500,
        },
      })
      const d = new Date()
      playback.play(test)
      await psetTimeout(2)
      await playback.pause()

      expect(new Date() - d).toBeLessThan(15)
    })

    it('should be able to stop mid-delay', async () => {
      const test = [
        {
          command: 'open',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
        options: {
          delay: 500,
        },
      })
      const d = new Date()
      playback.play(test)
      await psetTimeout(2)
      await playback.stop()

      expect(new Date() - d).toBeLessThan(15)
    })

    it('should be able to abort mid-delay', async () => {
      const test = [
        {
          command: 'open',
          target: '',
          value: '',
        },
      ]
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
        options: {
          delay: 500,
        },
      })
      const d = new Date()
      playback.play(test)
      await psetTimeout(2)
      await playback.abort()

      expect(new Date() - d).toBeLessThan(15)
    })
  })

  describe('Events', () => {
    describe("'command-state-changed'", () => {
      it('should listen to pending and pass changes', async () => {
        const test = [
          {
            command: 'open',
            target: '',
            value: '',
          },
        ]
        const executor = new FakeExecutor({})
        executor.doOpen = jest.fn(async () => {})
        const playback = new Playback({
          executor,
        })
        const cb = jest.fn()
        playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, cb)
        await playback.play(test)
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(2)
        expect(results[0].state).toBe(CommandStates.Pending)
        expect(results[1].state).toBe(CommandStates.Passed)
      })
      it('should listen to fail changes', async () => {
        const test = [
          {
            command: 'verifyText',
            target: '',
            value: '',
          },
        ]
        const executor = new FakeExecutor({})
        executor.doVerifyText = jest.fn(async () => {
          throw new VerificationError('failed to verify')
        })
        const playback = new Playback({
          executor,
        })
        const cb = jest.fn()
        playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, cb)
        await playback.play(test).catch(() => {})
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(2)
        expect(results[0].state).toBe(CommandStates.Pending)
        expect(results[1].state).toBe(CommandStates.Failed)
      })
      it('should listen to fatal changes', async () => {
        const test = [
          {
            command: 'fatal',
            target: '',
            value: '',
          },
        ]
        const executor = new FakeExecutor({})
        const playback = new Playback({
          executor,
        })
        const cb = jest.fn()
        playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, cb)
        await playback.play(test).catch(() => {})
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(2)
        expect(results[0].state).toBe(CommandStates.Pending)
        expect(results[1].state).toBe(CommandStates.Fatal)
      })
    })
    describe("'playback-state-changed'", () => {
      it('should finish test successfully', async () => {
        const test = [
          {
            command: 'open',
            target: '',
            value: '',
          },
        ]
        const executor = new FakeExecutor({})
        executor.doOpen = jest.fn(async () => {})
        const playback = new Playback({
          executor,
        })
        const cb = jest.fn()
        playback.on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
        await playback.play(test)
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(3)
        expect(results[0].state).toBe(PlaybackStates.PREPARATION)
        expect(results[1].state).toBe(PlaybackStates.PLAYING)
        expect(results[2].state).toBe(PlaybackStates.FINISHED)
      })
      it('should fail due to verify', async () => {
        const test = [
          {
            command: 'open',
            target: '',
            value: '',
          },
          {
            command: 'verifyText',
            target: '',
            value: '',
          },
          {
            command: 'open',
            target: '',
            value: '',
          },
        ]
        const executor = new FakeExecutor({})
        executor.doOpen = jest.fn(async () => {})
        executor.doVerifyText = jest.fn(async () => {
          throw new VerificationError('failed to verify')
        })
        const playback = new Playback({
          executor,
        })
        const cb = jest.fn()
        playback.on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
        await playback.play(test)
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(3)
        expect(results[0].state).toBe(PlaybackStates.PREPARATION)
        expect(results[1].state).toBe(PlaybackStates.PLAYING)
        expect(results[2].state).toBe(PlaybackStates.FAILED)
      })
      it('should fail due to assertion', async () => {
        const test = [
          {
            command: 'open',
            target: '',
            value: '',
          },
          {
            command: 'assertText',
            target: '',
            value: '',
          },
          {
            command: 'open',
            target: '',
            value: '',
          },
        ]
        const executor = new FakeExecutor({})
        executor.doOpen = jest.fn(async () => {})
        executor.doAssertText = jest.fn(async () => {
          throw new AssertionError('failed to assert')
        })
        const playback = new Playback({
          executor,
        })
        const cb = jest.fn()
        playback.on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
        await playback.play(test).catch(() => {})
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(3)
        expect(results[0].state).toBe(PlaybackStates.PREPARATION)
        expect(results[1].state).toBe(PlaybackStates.PLAYING)
        expect(results[2].state).toBe(PlaybackStates.FAILED)
      })
      it('should fail due to error', async () => {
        const test = [
          {
            command: 'open',
            target: '',
            value: '',
          },
          {
            command: 'assertText',
            target: '',
            value: '',
          },
          {
            command: 'open',
            target: '',
            value: '',
          },
        ]
        const executor = new FakeExecutor({})
        executor.doOpen = jest.fn(async () => {})
        executor.doAssertText = jest.fn(async () => {
          throw new Error('error in command')
        })
        const playback = new Playback({
          executor,
        })
        const cb = jest.fn()
        playback.on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
        await playback.play(test).catch(() => {})
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(3)
        expect(results[0].state).toBe(PlaybackStates.PREPARATION)
        expect(results[1].state).toBe(PlaybackStates.PLAYING)
        expect(results[2].state).toBe(PlaybackStates.ERRORED)
      })
    })
  })
})

const psetTimeout = timeout =>
  new Promise(res => {
    setTimeout(res, timeout)
  })

const flat = arr => arr.reduce((f, a) => [...f, ...a], [])
