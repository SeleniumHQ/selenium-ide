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

export function sanitizeName(input: string) {
  return input.replace(/([^a-z0-9]+)/gi, '')
}

export function capitalize(input: string) {
  return input.charAt(0).toUpperCase() + input.slice(1)
}

export function uncapitalize(input: string) {
  return input.charAt(0).toLowerCase() + input.slice(1)
}

/**
 * Returns a loop count as code. A whole number is used as it is. Anything
 * else (e.g., a variable) goes through `convert`, which should round it down
 * like playback does, and fail on a value that isn't a number.
 */
export function loopCount(count: string, convert: (count: string) => string) {
  return /^\d+$/.test(count.trim()) ? count : convert(count)
}
