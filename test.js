var elementForInjectingScript = document.createElement("script");
elementForInjectingScript.src = browser.runtime.getURL("inject.js");
(document.head || document.documentElement).appendChild(elementForInjectingScript);

window.addEventListener("message", function(event) {
    if (event.source == window && event.data &&
        event.data.direction == "from-page-script") {
        if (event.data.recordedType) {
            switch (event.data.recordedType) {
                case "prompt":
                    if (event.data.recordedResult) {
                        record("answerOnNextPrompt", [[event.data.recordedResult]], "", true);
                    } else {
                        record("chooseCancelOnNextPrompt", [[""]], "", true);
                    }
                    record("assertPrompt", [[event.data.recordedMessage]], "");
                    break;
            }
        }
        if (event.data.response) {
            switch (event.data.response) {
                case "prompt":
                    selenium.browserbot.promptResponse = true;
                    if (event.data.value)
                        selenium.browserbot.promptMessage = event.data.value;
                    break;
            }
        }
    }
})