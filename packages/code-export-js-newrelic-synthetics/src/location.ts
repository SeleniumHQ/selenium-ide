import { codeExport as exporter } from 'side-code-export'

const emitId = (selector: string) => Promise.resolve(`By.id("${selector}")`)

const emitName = (selector: string) => Promise.resolve(`By.name("${selector}")`)

const emitLink = (selector: string) =>
  Promise.resolve(`By.linkText("${selector}")`)

const emitPartialLinkText = (selector: string) =>
  Promise.resolve(`By.partialLinkText("${selector}")`)

const emitCss = (selector: string) => Promise.resolve(`By.css("${selector}")`)

const emitXpath = (selector: string) =>
  Promise.resolve(`By.xpath("${selector}")`)

const emitters = {
  id: emitId,
  name: emitName,
  link: emitLink,
  linkText: emitLink,
  partialLinkText: emitPartialLinkText,
  css: emitCss,
  xpath: emitXpath,
}

export const emit = (location: string) =>
  exporter.emit.location(location, emitters)

export default {
  emit,
}
