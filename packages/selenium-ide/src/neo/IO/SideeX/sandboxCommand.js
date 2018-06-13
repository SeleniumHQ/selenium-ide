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

import { xlateArgument } from "./formatCommand";

export default class SandboxCommand {
  constructor() {
    this.result = null;
    this.iframe = document.getElementById("evalSandboxFrame");
    this.attachWatcher = this.attachWatcher.bind(this);
    this.attachWatcher();
  }

  attachWatcher() {
    window.addEventListener("message", (event) => {
      if (event.data.evaluationResult) {
        this.result = event.data.evaluationResult;
      }
    });
  }

  wait(...properties) {
    if (!properties.length)
      return Promise.reject("No arguments");
    let self = this;
    let ref = this;
    let inspecting = properties[properties.length - 1];
    for (let i = 0; i < properties.length - 1; i++) {
      if (!ref[properties[i]] | !(ref[properties[i]] instanceof Array | ref[properties[i]] instanceof Object))
        return Promise.reject("Invalid Argument");
      ref = ref[properties[i]];
    }
    return new Promise(function(resolve, reject) {
      let counter = 0;
      let interval = setInterval(function() {
        if (ref[inspecting] === undefined || ref[inspecting] === false) {
          counter++;
          if (counter > self.waitTimes) {
            reject("Timeout");
            clearInterval(interval);
          }
        } else {
          resolve();
          clearInterval(interval);
        }
      }, self.waitInterval);
    });
  }

  evalExpression(expression) {
    // redo after
    const message = {
      command: "evaluateCommand",
      evaluationCommand: xlateArgument(expression)
    };
    this.iframe.contentWindow.postMessage(message, "*");
    return this.wait("result")
      .then(() => {
        let result = "falsy";
        if (this.result) {
          result = "truthy";
        }
        this.result = null;
        return Promise.resolve({result: result});
      });
  }
};
