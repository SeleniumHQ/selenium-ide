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

export type NestedPartial<API> = {
  [K in keyof API]?: API[K] extends Record<string, unknown>
    ? NestedPartial<API[K]>
    : API[K]
}

function isDictionary(obj: any): obj is Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  for (const key in obj) {
    if (typeof key !== 'string') {
      return false
    }
  }

  return true
}

function getApiSubset(
  originalObj: any,
  nestedSubset: any
): Record<string, any> | undefined {
  if (!isDictionary(originalObj)) {
    return originalObj
  }
  if (!isDictionary(nestedSubset)) {
    return undefined
  }
  const results: Record<string, any> = {}
  for (const key in nestedSubset) {
    const result = getApiSubset(originalObj[key], nestedSubset[key])
    if (result === undefined) {
      results[key] = originalObj[key]
    } else {
      results[key] = result
    }
  }
  return results
}

type ApiWithMutators = Api & {
  mutators: BrowserApiMutators
}

export default async (api: NestedPartial<Api>, ...cbs: (() => void)[]) => {
  window.sideAPI = {
    ...api,
    mutators: getApiSubset(mutators, api),
  } as ApiWithMutators
  if (cbs?.length) {
    for (const cb of cbs) {
      await cb()
    }
  }

  return cbs.reduce((acc, cb) => () => {
    acc()
    cb()
  })
}
