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

import browser from "webextension-polyfill";

export function attach(selenium) {
  const elementForInjectingStyle = document.createElement("link");
  elementForInjectingStyle.rel = "stylesheet";
  elementForInjectingStyle.href = browser.runtime.getURL("/assets/prompt.css");
  (document.head || document.documentElement).appendChild(elementForInjectingStyle);
  const elementForInjectingScript = document.createElement("script");
  elementForInjectingScript.src = browser.runtime.getURL("/assets/prompt.js");
  (document.head || document.documentElement).appendChild(elementForInjectingScript);

  if (window === window.top) {
    window.addEventListener("message", function(event) {
      if (event.source.top == window && event.data &&
        event.data.direction == "from-page-script") {
        if (event.data.response) {
          switch (event.data.response) {
            case "prompt":
              selenium.browserbot.promptResponse = true;
              if (event.data.value)
                selenium.browserbot.promptMessage = event.data.value;
              break;
            case "confirm":
              selenium.browserbot.confirmationResponse = true;
              if (event.data.value)
                selenium.browserbot.confirmationMessage = event.data.value;
              break;
            case "alert":
              selenium.browserbot.alertResponse = true;
              if(event.data.value)
                selenium.browserbot.alertMessage = event.data.value;
              break;
          }
        }
      }
    });
  }
}
