import LocationEmitter from './location'
import TextProcessor from '../../code-export-utils/src/text'

const emitters = {
  assertText: emitVerifyText,
  click: emitClick,
  check: emitCheck,
  clickAt: emitClick,
  //debugger: emitDebugger,
  doubleClick: emitDoubleClick,
  doubleClickAt: emitDoubleClick,
  dragAndDropToObject: emitDragAndDrop,
  open: emitOpen,
  //sendKeys: emitSendKeys,
  setWindowSize: emitSetWindowSize,
  type: emitType,
  uncheck: emitUncheck,
}

export function emit(command) {
  if (emitters[command.command]) {
    return emitters[command.command](command.target, command.value)
  }
}

async function emitCheck(locator) {
  return Promise.resolve(
    `{
        WebElement element = driver.findElement(${await LocationEmitter.emit(
          locator
        )});
        if (!element.isSelected()) {
          element.click();
        }
      }`
  )
}

async function emitClick(target) {
  return Promise.resolve(
    `driver.findElement(${await LocationEmitter.emit(target)}).click();`
  )
}

async function emitDoubleClick(target) {
  return Promise.resolve(
    `{
        WebElement element = driver.findElement(${await LocationEmitter.emit(
          target
        )});
        Actions builder = new Actions(driver);
        builder.doubleClick(element).perform();
      }`
  )
}

async function emitDragAndDrop(dragged, dropped) {
  return Promise.resolve(
    `{
        WebElement dragged = driver.findElement(${await LocationEmitter.emit(
          dragged
        )});
        WebElement dropped = driver.findElement(${await LocationEmitter.emit(
          dropped
        )});
        Actions builder = new Actions(driver);
        builder.dragAndDrop(dragged, dropped).perform();
      }`
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

//async function emitSendKeys(target, value) {
//  return Promise.resolve(
//    `driver.findElement(${await LocationEmitter.emit(
//      target
//    )}).sendKeys(${value
//      .map(s => (s.startsWith('Key[') ? s : `\`${s}\``))
//      .join(',')});`
//  )
//}

async function emitUncheck(locator) {
  return Promise.resolve(
    `{
        WebElement element = driver.findElement(${await LocationEmitter.emit(
          locator
        )});
        if (element.isSelected()) {
          element.click();
        }
      }`
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
