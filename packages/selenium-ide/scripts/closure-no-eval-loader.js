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

// Runs after closure-loader with `eval: false`. closure-loader declares each
// Closure namespace at the top of a module with
// `var ns=__merge(ns||__merge({}, window.ns),{...});`. Without eval, two of
// these declarations change the module, so they're rewritten:
// - `goog` would hide the `goog` that ProvidePlugin injects, so it merges into
//   the provided `goog` instead.
// - A namespace the module exports itself (`export var bot = {}`) would clash
//   with the export, so the declaration is dropped.
const GOOG_DECLARATION = /var goog=__merge\(goog\|\|__merge\(\{\}, window\.goog\),/g
const DECLARATION = /var (\w+)=__merge\(\1\|\|__merge\(\{\}, window\.\1\),\{.*?\}\);/g

module.exports = function closureNoEvalLoader(source, inputSourceMap) {
  this.cacheable && this.cacheable()
  const result = source
    .replace(GOOG_DECLARATION, 'goog=__merge(goog,')
    .replace(
      DECLARATION,
      (declaration, name) =>
        new RegExp(`export\\s+(var|let|const)\\s+${name}\\b`).test(source)
          ? ''
          : declaration
    )
  this.callback(null, result, inputSourceMap)
}
