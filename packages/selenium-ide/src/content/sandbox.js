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

class Sandbox {
  constructor() {
    this.result;
    window.addEventListener("message", (event) => {
      if (event.data.result && this.resolve) {
        const result = this.stringToBool(event.data.result);
        this.resolve(result);
        this.resolve = undefined;
      }
    });
  }

  eval(expression) {
    if (this.resolve) {
      return Promise.resolve({ result: "Cannot eval while a different eval is taking place." });
    }
    const message = {
      command: "evaluateConditional",
      expression: expression
    };
    const promise = new Promise(resolve => {
      this.resolve = resolve;
    });
    const iframe = document.getElementById("sandbox");
    if (iframe) {
      iframe.contentWindow.postMessage(message, "*");
      return promise;
    } else {
      return Promise.resolve({ result: "Expression evaluation prior to an 'open' command is not supported in Firefox." });
    }
  }

  stringToBool(_input) {
    let input = { ..._input };
    input.value = input.value === "truthy";
    return input;
  }
}

export default new Sandbox;
