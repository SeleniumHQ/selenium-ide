/*
 * Copyright 2017 SideeX committers
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

var elementForInjectingScript = document.createElement("script");
elementForInjectingScript.src = browser.runtime.getURL("prompt.js");
(document.head || document.documentElement).appendChild(elementForInjectingScript);

window.addEventListener("message", function(event) {
    if (event.source == window && event.data &&
        event.data.direction == "from-page-script") {
        if (event.data.recordedType) {
            switch (event.data.recordedType) {
                case "prompt":
                    if (event.data.recordedResult != null) {
                        record("answerOnNextPrompt", [[event.data.recordedResult]], "", true);
                    } else {
                        record("chooseCancelOnNextPrompt", [[""]], "", true);
                    }
                    record("assertPrompt", [[event.data.recordedMessage]], "");
                    break;
                case "confirm":
                    if (event.data.recordedResult == true) {
                        record("chooseOkOnNextConfirmation", [[""]], "", true);
                    } else {
                        record("chooseCancelOnNextConfirmation", [[""]], "", true);
                    }
                    record("assertConfirmation", [[event.data.recordedMessage]], "", false);
                    break;
                case "alert":
                    //record("answerOnNextAlert",[[event.data.recordedResult]],"",true);
                    record("assertAlert",[[event.data.recordedMessage]],"");
                    break;
            }
        }
        if (event.data.response) {
            switch (event.data.response) {
                case "prompt":
                console.error("tuggle");
                    selenium.browserbot.promptResponse = true;
                    if (event.data.value)
                        selenium.browserbot.promptMessage = event.data.value;
                    break;
                case "confirm":
                console.error("tuggle");
                    selenium.browserbot.confirmationResponse = true;
                    console.error("tuggle2", selenium.browserbot.confirmationResponse);
                    if (event.data.value)
                        selenium.browserbot.confirmationMessage = event.data.value;
                    break;
                case "alert":
                    selenium.browserbot.alertResponse=true;
                    if(event.data.value)
                        selenium.browserbot.promptMessage=event.data.value;
                    break;
            }
        }
    }
})