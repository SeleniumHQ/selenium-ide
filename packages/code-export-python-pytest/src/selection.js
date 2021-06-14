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

import { codeExport as exporter } from '@seleniumhq/side-utils'

const emitters = {
  id: emitId,
  value: emitValue,
  label: emitLabel,
  index: emitIndex,
}

export function emit(location) {
  return exporter.emit.selection(location, emitters)
}

export default {
  emit,
}

function emitId(id) {
  return Promise.resolve(`By.CSS_SELECTOR, "*[id='${id}']"`)
}

function emitValue(value) {
  return Promise.resolve(`By.CSS_SELECTOR, "*[value='${value}']"`)
}

function emitLabel(label) {
  if (label.startsWith('self.vars[')) {
    return Promise.resolve(`By.XPATH, "//option[. = '{}']".format(${label})`)
  }
  return Promise.resolve(`By.XPATH, "//option[. = '${label}']"`)
}

function emitIndex(index) {
  return Promise.resolve(`By.CSS_SELECTOR, "*:nth-child(${index})"`)
}
