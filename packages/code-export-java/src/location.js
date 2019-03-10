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
  return exporter.location.emit(location, emitters)
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
