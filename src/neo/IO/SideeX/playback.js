import { reaction } from "mobx";
import PlaybackState from "../../stores/view/PlaybackState";
import UiState from "../../stores/view/UiState";
const { ExtCommand, isExtCommand } = window;

const extCommand = new ExtCommand();

function play() {
  prepareToPlay()
    .then(executionLoop)
    .then(finishPlaying)
    .catch(catchPlayingError);
}

function executionLoop() {
  const { command, target, value } = UiState.selectedTest.test.command[PlaybackState.currentPlayingIndex];
  if (isExtCommand(command)) {
    let upperCase = command.charAt(0).toUpperCase() + command.slice(1);
    return (extCommand["do" + upperCase](target, value))
      .then(executionLoop); 
  } else {
    return doPreparation()
      .then(doPrePageWait)
      .then(doPageWait)
      .then(doAjaxWait)
      .then(doDomWait)
      .then(doCommand)
      .then(executionLoop)
  }
}

function prepareToPlay() {
  extCommand.init();
}

function finishPlaying() {
}

reaction(
  () => PlaybackState.isPlaying,
  isPlaying => { isPlaying ? play() : new Function(); }
);

const catchPlayingError = console.error;


function doPreparation() {
  return extCommand.sendMessage("waitPreparation", "", "")
    .then(function() {
      return true;
    });
}


function doPrePageWait() {
  return extCommand.sendMessage("prePageWait", "", "")
    .then(function(response) {
      if (response && response.new_page) {
        return doPrePageWait();
      } else {
        return true;
      }
    });
}

function doPageWait(pageTime = Date.now(), pageCount = 0) {
  return extCommand.sendMessage("pageWait", "", "")
    .then(function(response) {
      if (pageTime && (Date.now() - pageTime) > 30000) {
        console.error("Page Wait timed out after 30000ms");
        pageCount = 0;
        pageTime = "";
        return true;
      } else if (response && response.page_done) {
        pageCount = 0;
        pageTime = "";
        return true;
      } else {
        pageCount++;
        if (pageCount == 1) {
          pageTime = Date.now();
          console.log("Wait for the new page to be fully loaded");
        }
        return doPageWait(pageTime, pageCount);
      }
    });
}

function doAjaxWait(ajaxTime = Date.now(), ajaxCount = 0) {
  return extCommand.sendMessage("ajaxWait", "", "")
    .then(function(response) {
      if (ajaxTime && (Date.now() - ajaxTime) > 30000) {
        console.error("Ajax Wait timed out after 30000ms");
        ajaxCount = 0;
        ajaxTime = "";
        return true;
      } else if (response && response.ajax_done) {
        ajaxCount = 0;
        ajaxTime = "";
        return true;
      } else {
        ajaxCount++;
        if (ajaxCount == 1) {
          ajaxTime = Date.now();
          console.log("Wait for all ajax requests to be done");
        }
        return doAjaxWait(ajaxTime, ajaxCount);
      }
    });
}

function doDomWait(domTime = Date.now(), domCount = 0) {
  return extCommand.sendMessage("domWait", "", "")
    .then(function(response) {
      if (domTime && (Date.now() - domTime) > 30000) {
        console.error("DOM Wait timed out after 30000ms");
        domCount = 0;
        domTime = "";
        return true;
      } else if (response && (Date.now() - response.dom_time) < 400) {
        domCount++;
        if (domCount == 1) {
          domTime = Date.now();
          console.log("Wait for the DOM tree modification");
        }
        return doDomWait();
      } else {
        domCount = 0;
        domTime = "";
        return true;
      }
    });
}

function doCommand() {
  let commands = getRecordsArray();
  let commandName = getCommandName(commands[currentPlayingCommandIndex]);
  let commandTarget = getCommandTarget(commands[currentPlayingCommandIndex]);
  let commandValue = getCommandValue(commands[currentPlayingCommandIndex]);
  //console.log("in common");

  if (implicitCount == 0) {
    sideex_log.info("Executing: | " + commandName + " | " + commandTarget + " | " + commandValue + " |");
  }

  let p = new Promise(function(resolve, reject) {
    let count = 0;
    let interval = setInterval(function() {
      if (count > 60) {
        sideex_log.error("Timed out after 30000ms");
        reject("Window not Found");
        clearInterval(interval);
      }
      if (!extCommand.getPageStatus()) {
        if (count == 0) {
          sideex_log.info("Wait for the new page to be fully loaded");
        }
        count++;
      } else {
        resolve();
        clearInterval(interval);
      }
    }, 500);
  });
  return p.then(function() {
    if(commandValue.substr(0,2) === "${" && commandValue.substr(commandValue.length-1) === "}"){
      commandValue = xlateArgument(commandValue);
    }
    if(commandTarget.substr(0,2) === "${" && commandTarget.substr(commandTarget.length-1) === "}"){
      commandTarget = xlateArgument(commandTarget);
    }
    if (isWindowMethodCommand(commandName))
    {
      return extCommand.sendMessage(commandName, commandTarget, commandValue, true);
    }
    return extCommand.sendMessage(commandName, commandTarget, commandValue);
  })
    .then(function(result) {
      if (result.result != "success") {
        // implicit
        if (result.result.match(/Element[\s\S]*?not found/)) {
          if (implicitTime && (Date.now() - implicitTime > 30000)) {
            sideex_log.error("Implicit Wait timed out after 30000ms");
            implicitCount = 0;
            implicitTime = "";
          } else {
            implicitCount++;
            if (implicitCount == 1) {
              sideex_log.info("Wait until the element is found");
              implicitTime = Date.now();
            }
            return doCommand();
          }
        }

        implicitCount = 0;
        implicitTime = "";
        sideex_log.error(result.result);
        setColor(currentPlayingCommandIndex + 1, "fail");
        setColor(currentTestCaseId, "fail");
        document.getElementById("result-failures").innerHTML = parseInt(document.getElementById("result-failures").innerHTML) + 1;
        if (commandName.includes("verify") && result.result.includes("did not match")) {
          setColor(currentPlayingCommandIndex + 1, "fail");
        } else {
          sideex_log.info("Test case failed");
          caseFailed = true;
          currentPlayingCommandIndex = commands.length;
        }
      } else {
        setColor(currentPlayingCommandIndex + 1, "success");
      }
    })
}
