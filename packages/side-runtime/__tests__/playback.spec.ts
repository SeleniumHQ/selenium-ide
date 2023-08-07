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
  PlaybackEventShapes,
} from '../src/playback'
import { AssertionError, VerificationError } from '../src/errors'
import FakeExecutor from './util/FakeExecutor'
import Variables from '../src/variables'
import { TestShape } from '@seleniumhq/side-model'

describe('Playback', () => {
  describe('Event emitting', () => {
    describe('Control Flow', () => {
      it('forEach', async () => {
        const test: TestShape = {
          id: '1',
          name: 'Test',
          commands: [
            {
              id: 'asdf0',
              command: 'forEach',
              target: 'collectionVarName',
              value: 'iteratorVarName',
            },
            {
              id: 'asdf1',
              command: 'open',
              target: '',
              value: '',
            },
            {
              id: 'asdf2',
              command: 'end',
              target: '',
              value: '',
            },
          ],
        }
        const executor = new FakeExecutor()
        executor.doOpen = jest.fn(async () => {})
        const variables = new Variables()
        variables.set('collectionVarName', ['a', 'b', 'c'])
        const playback = new Playback({
          baseUrl: '',
          executor: executor as any,
          getTestByName: (_name = '') => ({} as unknown as TestShape),
          logger: console,
          variables,
        })
        const cb = jest.fn()
        playback['event-emitter'].on(PlaybackEvents.CONTROL_FLOW_CHANGED, cb)
        await playback.play(test)
        const results = flat(cb.mock.calls)
        expect(results).toMatchSnapshot()
      })
    })
  })
  describe('Playback test queue', () => {
    it('should play a test', async () => {
      const test: TestShape = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'b',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'c',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor()
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
      } as unknown as any)
      await (
        await playback.play(test)
      )()
      expect(executor.doOpen).toHaveBeenCalledTimes(3)
    })

    it('should play a test twice', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'b',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'c',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor()
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
      } as unknown as any)
      await (
        await playback.play(test)
      )()
      await (
        await playback.play(test)
      )()
      expect(executor.doOpen).toHaveBeenCalledTimes(6)
    })

    it("should throw if trying to run a test when a driver isn't initialized", async () => {
      const test: TestShape = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'b',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'c',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor()
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
      } as unknown as any)
      expect.assertions(1)
      await (
        await playback.play(test)
      )()
      executor.cleanup()
      try {
        await (
          await playback.play(test)
        )()
      } catch (err) {
        expect((err as Error).message).toBe('executor is dead')
      }
    })

    it('should throw if trying to play while a test is running', async () => {
      const test: TestShape = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'b',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'c',
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
      } as unknown as any)
      await playback.play(test)
      expect.assertions(1)
      try {
        await (
          await playback.play(test)
        )()
      } catch (err) {
        expect((err as Error).message).toBe(
          "Can't start playback while a different playback is running"
        )
      }
    })

    it("should not throw an uncought error if finish wasn't called", () => {
      const test: TestShape = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'b',
            command: 'error',
            target: '',
            value: '',
          },
          {
            id: 'c',
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
      } as unknown as any)
      playback.play(test)
      return psetTimeout(2)
    })

    it('should fail to play a test with an unknown command', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'fail',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      const playback = new Playback({
        executor,
      } as unknown as any)
      expect.assertions(1)
      try {
        await (
          await playback.play(test)
        )()
      } catch (err) {
        expect((err as Error).message).toBe('Unknown command fail')
      }
    })

    it('should pass a test with a failing verify', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
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
      } as unknown as any)
      expect(async () => await (await playback.play(test))()).not.toThrow()
    })

    it('should play a single command', async () => {
      const command = {
        id: 'a',
        command: 'open',
        target: '',
        value: '',
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
      } as unknown as any)
      await playback.playSingleCommand(command)
      expect(executor.doOpen).toHaveBeenCalledTimes(1)
    })

    it('should play a single command twice', async () => {
      const command = {
        id: 'a',
        command: 'open',
        target: '',
        value: '',
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
      } as unknown as any)
      await playback.playSingleCommand(command)
      await playback.playSingleCommand(command)
      expect(executor.doOpen).toHaveBeenCalledTimes(2)
    })

    it('should not be able to play a single command twice at the same time', async () => {
      const command = {
        id: 'a',
        command: 'open',
        target: '',
        value: '',
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async (_url: string) => {
        await psetTimeout(1)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      expect.assertions(1)
      playback.playSingleCommand(command)
      try {
        await playback.playSingleCommand(command)
      } catch (err) {
        expect((err as Error).message).toBe(
          "Can't play a command while playback is running"
        )
      }
    })

    it('should play a single command while a test case is paused and then continue', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'b',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'c',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async (_url: string) => {
        await psetTimeout(1)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const playPromise = await playback.play(test)
      await psetTimeout(7)
      await playback.pause()
      await playback.playSingleCommand({
        id: 'a',
        command: 'open',
        target: '',
        value: '',
      })
      await playback.resume()
      await playPromise()
      expect(executor.doOpen).toHaveBeenCalledTimes(4)
    })

    it('should not be able to play a single command while a test case is playing', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'b',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'c',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async (_url: string) => {
        await psetTimeout(1)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      expect.assertions(1)
      await playback.play(test)

      try {
        await playback.playSingleCommand({
          id: 'a',
          command: 'open',
          target: '',
          value: '',
        })
      } catch (err) {
        expect((err as Error).message).toBe(
          "Can't play a command while playback is running"
        )
      }
    })

    it('should play a nested test case', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'run',
            target: 'test2',
            value: '',
          },
          {
            id: '3',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }

      const test2 = {
        id: '2',
        name: 'Test2',
        commands: [
          {
            id: '4',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '5',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '6',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }

      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(0)
        return
      })
      const playback = new Playback({
        executor,
        getTestByName: () => test2,
      } as unknown as any)
      const cb = jest.fn()
      playback['event-emitter'].on(PlaybackEvents.CALL_STACK_CHANGED, cb)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
        commandResults.push(r)
      )
      await (
        await playback.play(test)
      )()

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(2)
      expect(results[0].change).toBe(CallstackChange.CALLED)
      expect(results[1].change).toBe(CallstackChange.UNWINDED)

      expect(commandResults).toMatchSnapshot()
    })

    it("should fail to execute a nested test without providing 'getTestByName'", async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'run',
            target: 'test2',
            value: '',
          },
          {
            id: '3',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }

      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(0)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      expect.assertions(1)
      try {
        await (
          await playback.play(test)
        )()
      } catch (err) {
        expect((err as Error).message).toBe("'run' command is not supported")
      }
    })

    it("should fail to execute a nested test if the test doesn't exist", async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'run',
            target: 'test2',
            value: '',
          },
          {
            id: '3',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }

      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(0)
        return
      })
      const playback = new Playback({
        executor,
        getTestByName: () => undefined,
      } as unknown as any)
      expect.assertions(1)
      try {
        await (
          await playback.play(test)
        )()
      } catch (err) {
        expect((err as Error).message).toBe("Can't run unknown test: test2")
      }
    })
    it('should play a test step by step', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'b',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'c',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(0)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
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
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'b',
            command: 'fail',
            target: '',
            value: '',
          },
          {
            id: 'c',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(0)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const playPromise = await playback.play(test, { pauseImmediately: true })
      playPromise()!.catch(() => {})
      await psetTimeout(1)
      await playback.step()
      expect.assertions(2)
      expect(executor.doOpen).toHaveBeenCalledTimes(1)
      try {
        await playback.step(2)
      } catch (err) {
        expect((err as Error).message).toBe('Playback stopped prematurely')
      }
      await playPromise()
    })
  })

  describe('play to and from', () => {
    it('should play to a point and continue to the end', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'b',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'c',
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
      } as unknown as any)
      const playPromise = await playback.playTo(test, 2, 0)
      expect(executor.doOpen).toHaveBeenCalledTimes(2)
      await playback.resume()
      await playPromise()
      expect(executor.doOpen).toHaveBeenCalledTimes(3)
    })
    it('should fail to play to a point that does not exist in the test', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      const playback = new Playback({
        executor,
      } as unknown as any)
      expect.assertions(1)
      try {
        await playback.playTo(test, 5, 0)
      } catch (err) {
        expect((err as Error).message).toBe('Command not found in test')
      }
    })
    it('should replay a command when in a control flow loop', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'forEach',
            target: 'collectionVarName',
            value: 'iteratorVarName',
          },
          {
            id: 'b',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'c',
            command: 'end',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const variables = new Variables()
      variables.set('collectionVarName', [0, 1, 2])
      const playback = new Playback({
        executor,
        variables,
      } as unknown as any)
      const playPromise = await playback.playFrom(test, test.commands[0])
      await playPromise()
      expect(executor.doOpen).toHaveBeenCalledTimes(3)
    })
    it('should fail to play to an unreachable point', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'b',
            command: 'if',
            target: '',
            value: '',
          },
          {
            id: 'c',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'd',
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
      } as unknown as any)
      expect.assertions(1)
      try {
        await playback.playTo(test, 2, 0)
      } catch (err) {
        expect((err as Error).message).toBe(
          "Playback finished before reaching the requested command, check to make sure control flow isn't preventing this"
        )
      }
    })
    it('should play from a point', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'b',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'c',
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
      } as unknown as any)
      const playPromise = await playback.playFrom(test, test.commands[1])
      await playPromise()
      expect(executor.doOpen).toHaveBeenCalledTimes(2)
    })
    it('should play to a command from a command', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: 't1',
            value: '',
          },
          {
            id: 'b',
            command: 'open',
            target: 't2',
            value: '',
          },
          {
            id: 'c',
            command: 'open',
            target: 't3',
            value: '',
          },
          {
            id: 'd',
            command: 'open',
            target: 't4',
            value: '',
          },
        ],
      }

      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
      } as unknown as any)
      await playback.playTo(test, 2, 1)
      expect(executor.doOpen).toHaveBeenCalledTimes(1)
      expect(executor.doOpen).toHaveBeenCalledWith('t2', '', test.commands[1])
    })
    it('should fail to play to a point that exists, from a point that does not exist in the test', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      const playback = new Playback({
        executor,
      } as unknown as any)
      expect.assertions(1)
      try {
        await playback.playTo(test, 0, 5)
      } catch (err) {
        expect((err as Error).message).toBe(
          'Command to start from not found in test'
        )
      }
    })
  })

  describe('resume', () => {
    it('should resume a paused test', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '3',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(10)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const cb = jest.fn()
      playback['event-emitter'].on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
        commandResults.push(r)
      )
      const playbackPromise = await playback.play(test)
      playbackPromise()!.catch(() => {})

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
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '3',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(0)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const playbackPromise = await playback.play(test)
      expect(() => playback.resume()).not.toThrow()

      await playbackPromise()!.catch(() => {})
    })

    it('resume after hitting a breakpoint', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'open',
            target: '',
            value: '',
            isBreakpoint: true,
          },
          {
            id: '3',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(10)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const cb = jest.fn()
      playback['event-emitter'].on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
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
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '3',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(10)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const cb = jest.fn()
      playback['event-emitter'].on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
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
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '3',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(10)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const cb = jest.fn()
      playback['event-emitter'].on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
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
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '3',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(10)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const cb = jest.fn()
      playback['event-emitter'].on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
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
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '3',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(10)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const cb = jest.fn()
      playback['event-emitter'].on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
        commandResults.push(r)
      )
      const playbackPromise = await playback.play(test)
      playbackPromise()!.catch((err) => {
        expect((err as Error).message).toBe('playback is dead')
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
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '3',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(10)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const cb = jest.fn()
      playback['event-emitter'].on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
        commandResults.push(r)
      )
      const playbackPromise = await playback.play(test)
      playbackPromise()!.catch((err) => {
        expect((err as Error).message).toBe('playback is dead')
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
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
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
      } as unknown as any)
      const cb = jest.fn()
      playback['event-emitter'].on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
        commandResults.push(r)
      )
      const playbackPromise = await playback.play(test)
      playbackPromise()!.catch(() => {})

      await psetTimeout(5)
      await playback.resume()
      await psetTimeout(5)
      // @ts-expect-error ugh no
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
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'verify',
            target: '',
            value: '',
          },
          {
            id: '3',
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
      } as unknown as any)
      const cb = jest.fn()
      playback['event-emitter'].on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
        commandResults.push(r)
      )
      const playbackPromise = await playback.play(test)
      playbackPromise()!.catch(() => {})

      await psetTimeout(5)
      // @ts-expect-error
      executor.doOpen.mockImplementation(async () => {})
      await playback.resume()
      await psetTimeout(5)
      // @ts-expect-error
      executor.doVerify.mockImplementation(async () => {})
      await playback.resume()
      await psetTimeout(5)
      // @ts-expect-error
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

  describe('ignore breakpoints', () => {
    it('should ignore breakpoints', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'open',
            target: '',
            value: '',
            isBreakpoint: true,
          },
          {
            id: '3',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        await psetTimeout(1)
        return
      })
      const playback = new Playback({
        executor,
        options: {
          ignoreBreakpoints: true,
        },
      } as unknown as any)
      const cb = jest.fn()
      playback['event-emitter'].on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
        commandResults.push(r)
      )
      const playbackPromise = await playback.play(test)

      await playbackPromise()

      const results = flat(cb.mock.calls)
      expect(results.length).toBe(3)
      expect(results[0].state).toBe(PlaybackStates.PREPARATION)
      expect(results[1].state).toBe(PlaybackStates.PLAYING)
      expect(results[2].state).toBe(PlaybackStates.FINISHED)

      expect(commandResults).toMatchSnapshot()
    })
  })

  describe('delay between commands', () => {
    it('should delay between commands', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'b',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'c',
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
      } as unknown as any)
      const d = Date.now()
      const playbackPromise = await playback.play(test)
      await playbackPromise()
      expect(Date.now() - d).toBeGreaterThan(10)
    })

    it('should be able to pause mid-delay', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
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
      } as unknown as any)
      const d = Date.now()
      await playback.play(test)
      await psetTimeout(2)
      await playback.pause()

      expect(Date.now() - d).toBeLessThan(30)
    })

    it('should be able to stop mid-delay', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
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
      } as unknown as any)
      const d = Date.now()
      await playback.play(test)
      await psetTimeout(2)
      await playback.stop()

      expect(Date.now() - d).toBeLessThan(30)
    })

    it('should be able to abort mid-delay', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
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
      } as unknown as any)
      const d = Date.now()
      const playbackPromise = await playback.play(test)
      playbackPromise()!.catch((err) => {
        expect((err as Error).message).toBe('playback is dead')
      })
      await psetTimeout(2)
      await playback.abort()

      expect(Date.now() - d).toBeLessThan(30)
    })
  })

  describe('skip', () => {
    it('should skip a command', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: 'a',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: 'b',
            command: 'open',
            target: '',
            value: '',
            skip: true,
          },
          {
            id: 'c',
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
      } as unknown as any)
      await (
        await playback.play(test)
      )()
      expect(executor.doOpen).toHaveBeenCalledTimes(2)
    })
    it('should send a skipped status for skipped commands', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'open',
            target: '',
            value: '',
            skip: true,
          },
          {
            id: '3',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(10)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
        commandResults.push(r)
      )
      await (
        await playback.play(test)
      )()

      expect(commandResults[3].state).toBe(CommandStates.SKIPPED)
    })
    it('should skip when playing single command', async () => {
      const command = {
        id: '1',
        command: 'open',
        target: '',
        value: '',
        skip: true,
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {})
      const playback = new Playback({
        executor,
      } as unknown as any)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
        commandResults.push(r)
      )

      await playback.playSingleCommand(command)

      expect(executor.doOpen).toHaveBeenCalledTimes(0)
      expect(commandResults[1].state).toBe(CommandStates.SKIPPED)
    })
    it('should skip control flow commands', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'if',
            target: '',
            value: '',
            skip: true,
          },
          {
            id: '2',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '3',
            command: 'end',
            target: '',
            value: '',
            skip: true,
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(10)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
        commandResults.push(r)
      )
      await (
        await playback.play(test)
      )()

      expect(executor.doOpen).toHaveBeenCalledTimes(1)
      expect(commandResults[1].state).toBe(CommandStates.SKIPPED)
      expect(commandResults[5].state).toBe(CommandStates.SKIPPED)
    })
    it('should fail to play a test with invalid control flow structure due to skipping commands', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'if',
            target: '',
            value: '',
            skip: true,
          },
          {
            id: '2',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '3',
            command: 'end',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(10)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
        commandResults.push(r)
      )

      expect.assertions(1)

      try {
        await playback.play(test)
      } catch (err) {
        expect((err as Error).message).toBe(
          'Use of end without an opening keyword'
        )
      }
    })

    it('should fail to play a test with undetermined control flow structure due to skipping commands', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'if',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '3',
            command: 'end',
            target: '',
            value: '',
            skip: true,
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(10)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
        commandResults.push(r)
      )

      expect.assertions(1)

      try {
        await playback.play(test)
      } catch (err) {
        expect((err as Error).message).toBe('Incomplete block at if')
      }
    })

    it('should support skipping `run` command', async () => {
      const test = {
        id: '1',
        name: 'Test',
        commands: [
          {
            id: '1',
            command: 'open',
            target: '',
            value: '',
          },
          {
            id: '2',
            command: 'run',
            target: 'test',
            value: '',
            skip: true,
          },
          {
            id: '3',
            command: 'open',
            target: '',
            value: '',
          },
        ],
      }
      const executor = new FakeExecutor({})
      executor.doOpen = jest.fn(async () => {
        psetTimeout(10)
        return
      })
      const playback = new Playback({
        executor,
      } as unknown as any)
      const commandResults: PlaybackEventShapes['COMMAND_STATE_CHANGED'][] = []
      playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, (r) =>
        commandResults.push(r)
      )
      await (
        await playback.play(test)
      )()

      expect(commandResults[3].state).toBe(CommandStates.SKIPPED)
    })
  })

  describe('Events', () => {
    describe("'command-state-changed'", () => {
      it('should listen to pending and pass changes', async () => {
        const test = {
          id: '1',
          name: 'Test',
          commands: [
            {
              id: '1',
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
        } as unknown as any)
        const cb = jest.fn()
        playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, cb)
        await (
          await playback.play(test)
        )()
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(2)
        expect(results[0].state).toBe(CommandStates.EXECUTING)
        expect(results[1].state).toBe(CommandStates.PASSED)
      })
      it('should listen to fail changes', async () => {
        const test = {
          id: '1',
          name: 'Test',
          commands: [
            {
              id: '1',
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
        } as unknown as any)
        const cb = jest.fn()
        playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, cb)
        await (await playback.play(test))()!.catch(() => {})
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(2)
        expect(results[0].state).toBe(CommandStates.EXECUTING)
        expect(results[1].state).toBe(CommandStates.FAILED)
      })
      it('should listen to error changes', async () => {
        const test = {
          id: '1',
          name: 'Test',
          commands: [
            {
              id: '1',
              command: 'fatal',
              target: '',
              value: '',
            },
          ],
        }
        const executor = new FakeExecutor({})
        const playback = new Playback({
          executor,
        } as any)
        const cb = jest.fn()
        playback['event-emitter'].on(PlaybackEvents.COMMAND_STATE_CHANGED, cb)
        await (await playback.play(test))()!.catch(() => {})
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(2)
        expect(results[0].state).toBe(CommandStates.EXECUTING)
        expect(results[1].state).toBe(CommandStates.ERRORED)
      })
    })
    describe("'playback-state-changed'", () => {
      it('should finish test successfully', async () => {
        const test = {
          id: '1',
          name: 'Test',
          commands: [
            {
              id: '1',
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
        } as unknown as any)
        const cb = jest.fn()
        playback['event-emitter'].on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
        await (
          await playback.play(test)
        )()
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(3)
        expect(results[0].state).toBe(PlaybackStates.PREPARATION)
        expect(results[1].state).toBe(PlaybackStates.PLAYING)
        expect(results[2].state).toBe(PlaybackStates.FINISHED)
      })
      it('should fail due to verify', async () => {
        const test = {
          id: '1',
          name: 'Test',
          commands: [
            {
              id: '1',
              command: 'open',
              target: '',
              value: '',
            },
            {
              id: '2',
              command: 'verifyText',
              target: '',
              value: '',
            },
            {
              id: '3',
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
        } as unknown as any)
        const cb = jest.fn()
        playback['event-emitter'].on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
        await (
          await playback.play(test)
        )()
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(3)
        expect(results[0].state).toBe(PlaybackStates.PREPARATION)
        expect(results[1].state).toBe(PlaybackStates.PLAYING)
        expect(results[2].state).toBe(PlaybackStates.FAILED)
      })
      it('should fail due to assertion', async () => {
        const test = {
          id: '1',
          name: 'Test',
          commands: [
            {
              id: '1',
              command: 'open',
              target: '',
              value: '',
            },
            {
              id: '2',
              command: 'assertText',
              target: '',
              value: '',
            },
            {
              id: '3',
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
        } as unknown as any)
        const cb = jest.fn()
        playback['event-emitter'].on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
        await (await playback.play(test))()!.catch(() => {})
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(3)
        expect(results[0].state).toBe(PlaybackStates.PREPARATION)
        expect(results[1].state).toBe(PlaybackStates.PLAYING)
        expect(results[2].state).toBe(PlaybackStates.FAILED)
      })
      it('should fail due to error', async () => {
        const test = {
          id: '1',
          name: 'Test',
          commands: [
            {
              id: '1',
              command: 'open',
              target: '',
              value: '',
            },
            {
              id: '2',
              command: 'assertText',
              target: '',
              value: '',
            },
            {
              id: '3',
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
        } as unknown as any)
        const cb = jest.fn()
        playback['event-emitter'].on(PlaybackEvents.PLAYBACK_STATE_CHANGED, cb)
        await (await playback.play(test))()!.catch(() => {})
        const results = flat(cb.mock.calls)
        expect(results.length).toBe(3)
        expect(results[0].state).toBe(PlaybackStates.PREPARATION)
        expect(results[1].state).toBe(PlaybackStates.PLAYING)
        expect(results[2].state).toBe(PlaybackStates.ERRORED)
      })
    })
  })
})

const psetTimeout = (timeout: number) =>
  new Promise((res) => {
    setTimeout(res, timeout)
  })

const flat = (arr: any[][]) => arr.reduce((f, a) => [...f, ...a], [])
