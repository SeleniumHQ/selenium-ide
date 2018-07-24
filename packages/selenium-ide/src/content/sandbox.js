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
    this.iframe = document.getElementById("sandbox");
    window.addEventListener("message", (event) => {
      if (event.data.result) {
        this.result = event.data.result;
      }
    });
  }

  eval(expression) {
    const message = {
      command: "evaluateConditional",
      expression: expression
    };
    this.iframe.contentWindow.postMessage(message, "*");
    return new Promise(resolve => {
      setTimeout(() => {
        if (this.result) {
          resolve(this.stringToBool(this.result));
        }
      }, 50);
    });
  }

  stringToBool(_input) {
    let input = { ..._input };
    switch(input.value) {
      case "truthy":
        input.value = true;
        break;
      case "falsy":
        input.value = false;
        break;
    }
    return input;
  }
}

export default new Sandbox;
