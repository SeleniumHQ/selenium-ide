import {
  codeExport as exporter,
  ExportFlexCommandShape,
  PrebuildEmitter,
  ProcessedCommandEmitter,
} from 'side-code-export'
import { CommandShape } from '@seleniumhq/side-model'
import location from './location'

async function emitClick(target: string) {
  return Promise.resolve(
    `await $webDrive.findElement(${await location.emit(target)}).click()`
  )
}

function variableLookup(varName: string) {
  return `vars["${varName}"]`
}

async function emitNewWindowHandling(
  command: CommandShape,
  emittedCommand: ExportFlexCommandShape
) {
  return Promise.resolve(
    `vars["windowHandles"] = await driver.getAllWindowHandles()\n${await emittedCommand}\nvars["${
      command.windowHandleName
    }"] = await waitForWindow(${command.windowTimeout})`
  )
}

function emitWaitForWindow() {
  const generateMethodDeclaration = (name: string) => {
    return {
      body: `async function ${name}(timeout = 2) {`,
      terminatingKeyword: '}',
    }
  }
  const commands = [
    { level: 0, statement: 'await driver.sleep(timeout)' },
    { level: 0, statement: 'const handlesThen = vars["windowHandles"]' },
    {
      level: 0,
      statement: 'const handlesNow = await driver.getAllWindowHandles()',
    },
    { level: 0, statement: 'if (handlesNow.length > handlesThen.length) {' },
    {
      level: 1,
      statement:
        'return handlesNow.find(handle => (!handlesThen.includes(handle)))',
    },
    { level: 0, statement: '}' },
    {
      level: 0,
      statement: 'throw new Error("New window did not appear before timeout")',
    },
  ]
  return Promise.resolve({
    name: 'waitForWindow',
    commands,
    generateMethodDeclaration,
  })
}

function emit(command: CommandShape) {
  return exporter.emit.command(command, emitters[command.command], {
    variableLookup,
    emitNewWindowHandling,
  })
}

export const emitters: Record<string, ProcessedCommandEmitter> = {
  click: emitClick,
}

exporter.register.preprocessors(emitters)

function register(command: string, emitter: PrebuildEmitter) {
  exporter.register.emitter({ command, emitter, emitters })
}

export default {
  emit,
  emitters,
  extras: { emitNewWindowHandling, emitWaitForWindow },
  register,
}
