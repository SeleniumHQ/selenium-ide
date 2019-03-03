import LocationEmitter from './location'
import TextProcessor from '../../code-export-utils/src/text'

const emitters = {
  assertText: emitVerifyText,
  click: emitClick,
  open: emitOpen,
  setWindowSize: emitSetWindowSize,
  type: emitType,
}

export function emit(command) {
  if (emitters[command.command]) {
    return emitters[command.command](command.target, command.value)
  }
}

function emitClick(target) {
  return `driver.findElement(${LocationEmitter.emit(target)}).click();`
}

function emitOpen(target) {
  const url = /^(file|http|https):\/\//.test(target)
    ? `"${target}"`
    : `"${global.baseUrl}${target}"`
  return `driver.get(${url});`
}

function emitSetWindowSize(size) {
  const [width, height] = size.split('x')
  return `driver.manage().window().setSize(new Dimension(${width}, ${height}));`
}

function emitType(target, value) {
  return `driver.findElement(${LocationEmitter.emit(
    target
  )}).sendKeys("${value}");`
}

function emitVerifyText(locator, text) {
  return `assertThat(driver.findElement(${LocationEmitter.emit(
    locator
  )}).getText(), is("${TextProcessor.escape(text)}"));`
}

export default {
  emit,
}
