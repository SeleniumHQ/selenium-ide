"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.emit = emit;
exports.default = void 0;

var _sideUtils = require("@seleniumhq/side-utils");

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
const emitters = {
  id: emitId,
  name: emitName,
  link: emitLink,
  linkText: emitLink,
  partialLinkText: emitPartialLinkText,
  css: emitCss,
  xpath: emitXpath
};

function emit(location) {
  return _sideUtils.codeExport.emit.location(location, emitters);
}

var _default = {
  emit
};
exports.default = _default;

function emitId(selector) {
  return Promise.resolve(`Selectors.byId("${selector}")`);
}

function emitName(selector) {
  return Promise.resolve(`Selectors.byName("${selector}")`);
}

function emitLink(selector) {
  return Promise.resolve(`Selectors.byLinkText("${selector}")`);
}

function emitPartialLinkText(selector) {
  return Promise.resolve(`Selectors.byPartialLinkText("${selector}")`);
}

function emitCss(selector) {
  return Promise.resolve(`"${selector}"`);
}

function emitXpath(selector) {
  return Promise.resolve(`Selectors.byXpath("${selector}")`);
}