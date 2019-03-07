import exporter from '../../code-export-utils/src'
import location from './location'

export const emitters = {
  assert: emitAssert,
  assertText: emitVerifyText,
  click: emitClick,
  check: emitCheck,
  clickAt: emitClick,
  //debugger: emitDebugger,
  doubleClick: emitDoubleClick,
  doubleClickAt: emitDoubleClick,
  dragAndDropToObject: emitDragAndDrop,
  executeScript: emitExecuteScript,
  open: emitOpen,
  sendKeys: emitSendKeys,
  setWindowSize: emitSetWindowSize,
  type: emitType,
  uncheck: emitUncheck,
}

function variableLookup(varName) {
  return `vars.get("${varName}").toString()`
}

export function emit(command) {
  return exporter.emit.command(command, emitters, variableLookup)
}

// TODO: add support for executeScript opt. args
function generateScript(script, isExpression = false) {
  return `driver.executeScript("${
    isExpression ? `return (${script})` : script
  }");`
}

function emitAssert(varName, value) {
  return Promise.resolve(
    `assertEquals(vars.get("${varName}").toString(), ${value});`
  )
}

async function emitCheck(locator) {
  return Promise.resolve(
    `{
        WebElement element = driver.findElement(${await location.emit(
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
    `driver.findElement(${await location.emit(target)}).click();`
  )
}

async function emitDoubleClick(target) {
  return Promise.resolve(
    `{
        WebElement element = driver.findElement(${await location.emit(target)});
        Actions builder = new Actions(driver);
        builder.doubleClick(element).perform();
      }`
  )
}

async function emitDragAndDrop(dragged, dropped) {
  return Promise.resolve(
    `{
        WebElement dragged = driver.findElement(${await location.emit(
          dragged
        )});
        WebElement dropped = driver.findElement(${await location.emit(
          dropped
        )});
        Actions builder = new Actions(driver);
        builder.dragAndDrop(dragged, dropped).perform();
      }`
  )
}

async function emitExecuteScript(script, varName) {
  return Promise.resolve(
    (varName ? `vars.push("${varName}") = ` : '') + generateScript(script)
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
    `driver.findElement(${await location.emit(target)}).sendKeys("${value}");`
  )
}

async function emitSendKeys(target, value) {
  return Promise.resolve(
    `driver.findElement(${await location.emit(target)}).sendKeys(${value
      .map(s => (s.startsWith('Key[') ? s : `"${s}"`))
      .join(',')}));`
  )
}

async function emitUncheck(locator) {
  return Promise.resolve(
    `{
        WebElement element = driver.findElement(${await location.emit(
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
    `assertThat(driver.findElement(${await location.emit(
      locator
    )}).getText(), is("${exporter.emit.escapedText(text)}"));`
  )
}

export default {
  emit,
}
