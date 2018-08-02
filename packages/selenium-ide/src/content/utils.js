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

import SeleniumError from "./SeleniumError";

/**
 * Returns the tag name of an element lowercased.
 *
 * @param element  an HTMLElement
 */
export function getTagName(element) {
  let tagName;
  if (element && element.tagName && element.tagName.toLowerCase) {
    tagName = element.tagName.toLowerCase();
  }
  return tagName;
}

/**
 * Returns the absolute time represented as an offset of the current time.
 * Throws a SeleniumException if timeout is invalid.
 *
 * @param timeout  the number of milliseconds from "now" whose absolute time
 *                 to return
 */
export function getTimeoutTime(timeout) {
  const now = new Date().getTime();
  const timeoutLength = parseInt(timeout);

  if (isNaN(timeoutLength)) {
    throw new SeleniumError("Timeout is not a number: '" + timeout + "'");
  }

  return now + timeoutLength;
}

export function extractExceptionMessage(ex) {
  if (ex == null) return "null exception";
  if (ex.message != null) return ex.message;
  if (ex.toString && ex.toString() != null) return ex.toString();
}
