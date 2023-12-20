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
import type { Api } from '@seleniumhq/side-api'
import { BrowserApiMutators } from 'browser/api'
import mutators from 'browser/api/mutator'
import { noop } from 'lodash/fp'

export type NestedPartial<API> = {
  [K in keyof API]?: API[K] extends Record<string, unknown>
    ? NestedPartial<API[K]>
    : API[K]
}

export default (api: Api, cb = noop) =>
  (
    apiSubset: NestedPartial<Api> & {
      mutators: NestedPartial<BrowserApiMutators>
    } = {
      ...api,
      mutators,
    },
  ) => {
    window.sideAPI = apiSubset as Api & { mutators: BrowserApiMutators }
    cb()
  }
