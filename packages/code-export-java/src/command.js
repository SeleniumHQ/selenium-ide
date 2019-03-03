import LocationEmitter from './location'
import TextProcessor from '../../code-export-utils/src/text'

const emitters = {
  assertText: emitVerifyText,
  click: emitClick,
  open: emitOpen,
  setWindowSize: emitSetWindowSize,
  type: emitType,
}

export async function emit(command) {
  if (emitters[command.command]) {
    return await emitters[command.command](command.target, command.value)
  }
}

async function emitClick(target) {
  return Promise.resolve(
    `driver.findElement(${await LocationEmitter.emit(target)}).click();`
  )
}

function emitOpen(target) {
  const url = /^(file|http|https):\/\//.test(target)
    ? `"${target}"`
    : `"${global.baseUrl}${target}"`
  return Promise.resolve(`driver.get(${url});`)
}

async function emitSetWindowSize(size) {
  const [width, height] = size.split('x')
  return Promise.resolve(
    `driver.manage().window().setSize(new Dimension(${width}, ${height}));`
  )
}

async function emitType(target, value) {
  return Promise.resolve(
    `driver.findElement(${await LocationEmitter.emit(
      target
    )}).sendKeys("${value}");`
  )
}

async function emitVerifyText(locator, text) {
  return Promise.resolve(
    `assertThat(driver.findElement(${await LocationEmitter.emit(
      locator
    )}).getText(), is("${TextProcessor.escape(text)}"));`
  )
}

export default {
  emit,
}
