import exporter from '../../code-export-utils/src'

const emitters = {
  id: emitId,
  name: emitName,
  link: emitLink,
  linkText: emitLink,
  partialLinkText: emitPartialLinkText,
  css: emitCss,
  xpath: emitXpath,
}

export function emit(location) {
  return exporter.emit.location(location, emitters)
}

export default {
  emit,
}

function emitId(selector) {
  return `By.id("${selector}")`
}

function emitName(selector) {
  return `By.name("${selector}")`
}

function emitLink(selector) {
  return `By.linkText("${selector}")`
}

function emitPartialLinkText(selector) {
  return `By.partialLinkText("${selector}")`
}

function emitCss(selector) {
  return `By.cssSelector("${selector}")`
}

function emitXpath(selector) {
  return `By.xpath("${selector}")`
}
