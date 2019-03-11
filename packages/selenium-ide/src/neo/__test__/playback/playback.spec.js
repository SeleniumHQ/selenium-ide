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
  CallstackChange,
} from '../../playback/playback'
import { AssertionError, VerificationError } from '../../playback/errors'
import FakeExecutor from '../util/FakeExecutor'

describe('Playback', () => {
  describe('Playback test queue', () => {
    it('should play a test', async () => {
      const test = {
        id: 1,
        commands: [
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
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
      })
      await (await playback.play(test))()
      expect(executor.doOpen).toHaveBeenCalledTimes(3)
    })

    it('should play a test twice', async () => {
      const test = {
        id: 1,
        commands: [
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
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
      })
      await (await playback.play(test))()
      await (await playback.play(test))()
      expect(executor.doOpen).toHaveBeenCalledTimes(6)
    })

    it('should throw if trying to play while a test is running', async () => {
      const test = {
        id: 1,
        commands: [
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
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
      })
      await playback.play(test)
      expect.assertions(1)
      try {
        await (await playback.play(test))()
      } catch (err) {
        expect(err.message).toBe(
          "Can't start playback while a different playback is running"
        )
      }
    })

    it("should not throw an uncought error if finish wasn't called", () => {
      const test = {
        id: 1,
        commands: [
          {
            command: 'open',
            target: '',
            value: '',
          },
          {
            command: 'error',
            target: '',
            value: '',
          },
          {
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
      })
      const fn = jest.fn()
      playback.play(test)
      return psetTimeout(2)
    })

    it('should fail to play a test with an unknown command', async () => {
      const test = {
        id: 1,
        commands: [
          {
            command: 'fail',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      const playback = new Playback({
        executor,
      })
      expect.assertions(1)
      try {
        await (await playback.play(test))()
      } catch (err) {
        expect(err.message).toBe('Unknown command fail')
      }
    })

    it('should pass a test with a failing verify', async () => {
      const test = {
        id: 1,
        commands: [
          {
            command: 'verifyText',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doVerifyText = jest.fn(async () => {
        throw new VerificationError('failed to verify')
      })
      const playback = new Playback({
        executor,
      })
      expect(async () => await (await playback.play(test))()).not.toThrow()
    })

    it.skip('should play a single command', async () => {
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

    it.skip('should play a single command twice', async () => {
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
      await playback.playSingleCommand(command)
      expect(executor.doOpen).toHaveBeenCalledTimes(2)
    })

    it.skip('should play a single command while a test case is paused and then continue', async () => {
      const test = {
        id: 1,
        commands: [
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
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => psetTimeout(5))
      const playback = new Playback({
        executor,
      })
      const playPromise = await playback.play(test)
      await psetTimeout(7)
      await playback.pause()
      await playback.playSingleCommand({
        command: 'open',
        target: '',
        value: '',
      })
      await playback.resume()
      await playPromise()
      expect(executor.doOpen).toHaveBeenCalledTimes(4)
    })

    it('should play a nested test case', async () => {
      const test = {
        id: 1,
        commands: [
          {
            id: 1,
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 2,
            command: 'run',
            target: 'test2',
            value: '',
          },
          {
            id: 3,
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }

      const test2 = {
        id: 2,
        commands: [
          {
            id: 4,
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 5,
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 6,
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }

      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(() => psetTimeout(0))
      const playback = new Playback({
        executor,
        getTestByName: () => test2,
      })
      const cb = jest.fn()
      playback.on(PlaybackEvents.CALL_STACK_CHANGED, cb)
      const commandResults = []
      playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, r =>
        commandResults.push(r)
      )
      await (await playback.play(test))()

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(2)
      expect(results[0].change).toBe(CallstackChange.CALLED)
      expect(results[1].change).toBe(CallstackChange.UNWINDED)

      expect(commandResults).toMatchSnapshot()
    })

    it("should fail to execute a nested test without providing 'getTestByName'", async () => {
      const test = {
        id: 1,
        commands: [
          {
            id: 1,
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 2,
            command: 'run',
            target: 'test2',
            value: '',
          },
          {
            id: 3,
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }

      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(() => psetTimeout(0))
      const playback = new Playback({
        executor,
      })
      expect.assertions(1)
      try {
        await (await playback.play(test))()
      } catch (err) {
        expect(err.message).toBe("'run' command is not supported")
      }
    })

    it("should fail to execute a nested test if the test doesn't exist", async () => {
      const test = {
        id: 1,
        commands: [
          {
            id: 1,
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 2,
            command: 'run',
            target: 'test2',
            value: '',
          },
          {
            id: 3,
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }

      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(() => psetTimeout(0))
      const playback = new Playback({
        executor,
        getTestByName: () => undefined,
      })
      expect.assertions(1)
      try {
        await (await playback.play(test))()
      } catch (err) {
        expect(err.message).toBe("Can't run unknown test: test2")
      }
    })
    it('should play a test step by step', async () => {
      const test = {
        id: 1,
        commands: [
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
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => psetTimeout(0))
      const playback = new Playback({
        executor,
      })
      const playPromise = await playback.play(test, { pauseImmediately: true })
      expect(executor.doOpen).toHaveBeenCalledTimes(0)
      await psetTimeout(1)
      await playback.step()
      expect(executor.doOpen).toHaveBeenCalledTimes(1)
      await playback.step(2)
      expect(executor.doOpen).toHaveBeenCalledTimes(3)
      await playback.resume()
      await playPromise()
      expect(executor.doOpen).toHaveBeenCalledTimes(3)
    })

    it('should reject step if one of the steps failed', async () => {
      const test = {
        id: 1,
        commands: [
          {
            command: 'open',
            target: '',
            value: '',
          },
          {
            command: 'fail',
            target: '',
            value: '',
          },
          {
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => psetTimeout(0))
      const playback = new Playback({
        executor,
      })
      const playPromise = await playback.play(test, { pauseImmediately: true })
      playPromise().catch(() => {})
      await psetTimeout(1)
      await playback.step()
      expect.assertions(2)
      expect(executor.doOpen).toHaveBeenCalledTimes(1)
      try {
        await playback.step(2)
      } catch (err) {
        expect(err.message).toBe('Playback stopped prematurely')
      }
      await playPromise()
    })
  })

  describe('play to and from', () => {
    it('should play to a point and continue to the end', async () => {
      const test = {
        id: 1,
        commands: [
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
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
      })
      const playPromise = await playback.playTo(test, test.commands[2])
      expect(executor.doOpen).toHaveBeenCalledTimes(2)
      await playback.resume()
      await playPromise()
      expect(executor.doOpen).toHaveBeenCalledTimes(3)
    })
    it('should fail to play to a point that does not exist in the test', async () => {
      const test = {
        id: 1,
        commands: [
          {
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      const playback = new Playback({
        executor,
      })
      expect.assertions(1)
      try {
        await playback.playTo(test, {})
      } catch (err) {
        expect(err.message).toBe('Command not found in test')
      }
    })
    it('should fail to play to an unreachable point', async () => {
      const test = {
        id: 1,
        commands: [
          {
            command: 'open',
            target: '',
            value: '',
          },
          {
            command: 'if',
            target: '',
            value: '',
          },
          {
            command: 'open',
            target: '',
            value: '',
          },
          {
            command: 'end',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      executor.evaluateConditional = jest.fn(async () => false)
      const playback = new Playback({
        executor,
      })
      expect.assertions(1)
      try {
        await playback.playTo(test, test.commands[2])
      } catch (err) {
        expect(err.message).toBe(
          "Playback finished before reaching the requested command, check to make sure control flow isn't preventing this"
        )
      }
    })
  })

  describe('resume', () => {
    it('should resume a paused test', async () => {
      const test = {
        id: 1,
        commands: [
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
        ],
      }
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
      const playbackPromise = await playback.play(test)
      playbackPromise().catch(() => {})

      await psetTimeout(15)
      await playback.pause()
      await psetTimeout(15)
      await playback.resume()
      await playbackPromise()

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
      const test = {
        id: 1,
        commands: [
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
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(() => psetTimeout(0))
      const playback = new Playback({
        executor,
      })
      const playbackPromise = await playback.play(test)
      expect(() => playback.resume()).not.toThrow()

      await playbackPromise().catch(() => {})
    })

    it('resume after hitting a breakpoint', async () => {
      const test = {
        id: 1,
        commands: [
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
        ],
      }
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
      const playbackPromise = await playback.play(test)

      await psetTimeout(15)
      await playback.resume()
      await playbackPromise()

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
      const test = {
        id: 1,
        commands: [
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
        ],
      }
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
      const playbackPromise = await playback.play(test)

      await psetTimeout(15)
      await playback.stop()
      await playbackPromise()

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(3)
      expect(results[0].state).toBe(PlaybackStates.PREPARATION)
      expect(results[1].state).toBe(PlaybackStates.PLAYING)
      expect(results[2].state).toBe(PlaybackStates.STOPPED)

      expect(commandResults).toMatchSnapshot()
    })

    it('should stop a paused test', async () => {
      const test = {
        id: 1,
        commands: [
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
        ],
      }
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
      const playbackPromise = await playback.play(test)

      await psetTimeout(15)
      await playback.pause()
      await psetTimeout(15)
      await playback.stop()
      await playbackPromise()

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
      const test = {
        id: 1,
        commands: [
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
        ],
      }
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
      const playbackPromise = await playback.play(test)

      await psetTimeout(15)
      await playback.abort()
      await playbackPromise()

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(3)
      expect(results[0].state).toBe(PlaybackStates.PREPARATION)
      expect(results[1].state).toBe(PlaybackStates.PLAYING)
      expect(results[2].state).toBe(PlaybackStates.ABORTED)

      expect(commandResults).toMatchSnapshot()
    })

    it('should abort a test after attempting to stop', async () => {
      const test = {
        id: 1,
        commands: [
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
        ],
      }
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
      const playbackPromise = await playback.play(test)
      playbackPromise().catch(err => {
        expect(err.message).toBe('playback is dead')
      })

      await psetTimeout(15)
      playback.stop()
      await psetTimeout(2)
      await playback.abort()
      await playbackPromise()

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(3)
      expect(results[0].state).toBe(PlaybackStates.PREPARATION)
      expect(results[1].state).toBe(PlaybackStates.PLAYING)
      expect(results[2].state).toBe(PlaybackStates.ABORTED)

      expect(commandResults).toMatchSnapshot()
    })

    it('should abort a paused test', async () => {
      const test = {
        id: 1,
        commands: [
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
        ],
      }
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
      const playbackPromise = await playback.play(test)
      playbackPromise().catch(err => {
        expect(err.message).toBe('playback is dead')
      })

      await psetTimeout(15)
      await playback.pause()
      await psetTimeout(15)
      await playback.abort()
      await playbackPromise()

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
      const test = {
        id: 1,
        commands: [
          {
            id: 1,
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
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
      const playbackPromise = await playback.play(test)
      playbackPromise().catch(() => {})

      await psetTimeout(5)
      await playback.resume()
      await psetTimeout(5)
      executor.doOpen.mockImplementation(async () => {})
      await playback.resume()
      await psetTimeout(100)
      await playbackPromise()

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
      const test = {
        id: 1,
        commands: [
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
        ],
      }
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
      const playbackPromise = await playback.play(test)
      playbackPromise().catch(() => {})

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
      await playbackPromise()

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
      const test = {
        id: 1,
        commands: [
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
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
        options: {
          delay: 5,
        },
      })
      const d = new Date()
      const playbackPromise = await playback.play(test)
      await playbackPromise()
      expect(new Date() - d).toBeGreaterThan(10)
    })

    it('should be able to pause mid-delay', async () => {
      const test = {
        id: 1,
        commands: [
          {
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
        options: {
          delay: 500,
        },
      })
      const d = new Date()
      await playback.play(test)
      await psetTimeout(2)
      await playback.pause()

      expect(new Date() - d).toBeLessThan(15)
    })

    it('should be able to stop mid-delay', async () => {
      const test = {
        id: 1,
        commands: [
          {
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
        options: {
          delay: 500,
        },
      })
      const d = new Date()
      await playback.play(test)
      await psetTimeout(2)
      await playback.stop()

      expect(new Date() - d).toBeLessThan(15)
    })

    it('should be able to abort mid-delay', async () => {
      const test = {
        id: 1,
        commands: [
          {
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
        options: {
          delay: 500,
        },
      })
      const d = new Date()
      const playbackPromise = await playback.play(test)
      playbackPromise().catch(err => {
        expect(err.message).toBe('playback is dead')
      })
      await psetTimeout(2)
      await playback.abort()

      expect(new Date() - d).toBeLessThan(15)
    })
  })

  describe('Events', () => {
    describe("'command-state-changed'", () => {
      it('should listen to pending and pass changes', async () => {
        const test = {
          id: 1,
          commands: [
            {
              command: 'open',
              target: '',
              value: '',
            },
          ],
        }
        const executor = new FakeExecutor({})
        executor.doOpen = jest.fn(async () => {})
        const playback = new Playback({
          executor,
        })
        const cb = jest.fn()
        playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, cb)
        await (await playback.play(test))()
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(2)
        expect(results[0].state).toBe(CommandStates.EXECUTING)
        expect(results[1].state).toBe(CommandStates.PASSED)
      })
      it('should listen to fail changes', async () => {
        const test = {
          id: 1,
          commands: [
            {
              command: 'verifyText',
              target: '',
              value: '',
            },
          ],
        }
        const executor = new FakeExecutor({})
        executor.doVerifyText = jest.fn(async () => {
          throw new VerificationError('failed to verify')
        })
        const playback = new Playback({
          executor,
        })
        const cb = jest.fn()
        playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, cb)
        await (await playback.play(test))().catch(() => {})
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(2)
        expect(results[0].state).toBe(CommandStates.EXECUTING)
        expect(results[1].state).toBe(CommandStates.FAILED)
      })
      it('should listen to error changes', async () => {
        const test = {
          id: 1,
          commands: [
            {
              command: 'fatal',
              target: '',
              value: '',
            },
          ],
        }
        const executor = new FakeExecutor({})
        const playback = new Playback({
          executor,
        })
        const cb = jest.fn()
        playback.on(PlaybackEvents.COMMAND_STATE_CHANGED, cb)
        await (await playback.play(test))().catch(() => {})
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(2)
        expect(results[0].state).toBe(CommandStates.EXECUTING)
        expect(results[1].state).toBe(CommandStates.ERRORED)
      })
    })
    describe("'playback-state-changed'", () => {
      it('should finish test successfully', async () => {
        const test = {
          id: 1,
          commands: [
            {
              command: 'open',
              target: '',
              value: '',
            },
          ],
        }
        const executor = new FakeExecutor({})
        executor.doOpen = jest.fn(async () => {})
        const playback = new Playback({
          executor,
        })
        const cb = jest.fn()
        playback.on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
        await (await playback.play(test))()
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(3)
        expect(results[0].state).toBe(PlaybackStates.PREPARATION)
        expect(results[1].state).toBe(PlaybackStates.PLAYING)
        expect(results[2].state).toBe(PlaybackStates.FINISHED)
      })
      it('should fail due to verify', async () => {
        const test = {
          id: 1,
          commands: [
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
          ],
        }
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
        await (await playback.play(test))()
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(3)
        expect(results[0].state).toBe(PlaybackStates.PREPARATION)
        expect(results[1].state).toBe(PlaybackStates.PLAYING)
        expect(results[2].state).toBe(PlaybackStates.FAILED)
      })
      it('should fail due to assertion', async () => {
        const test = {
          id: 1,
          commands: [
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
          ],
        }
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
        await (await playback.play(test))().catch(() => {})
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(3)
        expect(results[0].state).toBe(PlaybackStates.PREPARATION)
        expect(results[1].state).toBe(PlaybackStates.PLAYING)
        expect(results[2].state).toBe(PlaybackStates.FAILED)
      })
      it('should fail due to error', async () => {
        const test = {
          id: 1,
          commands: [
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
          ],
        }
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
        await (await playback.play(test))().catch(() => {})
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
