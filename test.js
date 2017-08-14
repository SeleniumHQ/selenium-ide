var elementForInjectingScript = document.createElement("script");
elementForInjectingScript.src = browser.runtime.getURL("inject.js");
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
            }
        }
    }
})