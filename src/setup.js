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

/**
 * This file will put everything we need on window so that we can use it from within the extension
 */
import browser from "webextension-polyfill";

function log(func, ...argv) {
  func(...argv).catch(process.env.NODE_ENV !== "production" ? console.log.bind(console) : () => {});
}

browser.runtime.sendMessage = log.bind(undefined, browser.runtime.sendMessage);

window.browser = browser;
