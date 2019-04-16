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

import UiState from '../stores/view/UiState'
import ModalState from '../stores/view/ModalState'
import { emitTest, emitSuite } from 'code-export'
import { downloadUniqueFile } from '../IO/filesystem'
import { normalizeTestsInSuite } from '../IO/normalize'

export async function exportCodeToFile(selectedLanguages, { test, suite }) {
  const { url, tests } = UiState.project.toJS()
  for (const language of selectedLanguages) {
    let emittedCode
    if (test) {
      emittedCode = await emitTest(language, {
        url,
        test,
        tests,
        enableOriginTracing: true,
      })
    } else if (suite) {
      const _suite = normalizeTestsInSuite({ suite, tests })
      emittedCode = await emitSuite(language, {
        url,
        suite: _suite,
        tests,
        enableOriginTracing: true,
      })
    }
    if (emittedCode) downloadUniqueFile(emittedCode.filename, emittedCode.body)
  }
  ModalState.cancelCodeExport()
}
