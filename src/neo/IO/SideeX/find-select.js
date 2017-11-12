import UiState from "../../stores/view/UiState";
import PlaybackState from "../../stores/view/PlaybackState";
const browser = window.browser;

export function find(target) {
  try{
    browser.tabs.query({
      active: true,
      windowId: window.contentWindowId
    }).then((tabs) => {
      if (!tabs.length) {
        console.log("No match tabs");
      } else {
        browser.tabs.sendMessage(tabs[0].id, {
          showElement: true,
          targetValue: target
        }).then((response) => {
          if (response){
            console.log(response.result);
          }
        });
      }
    });
  } catch (e) {
    console.error(e);
  }
}

export function select() {
  UiState.setSelectingTarget(!UiState.isSelectingTarget);
  if (!UiState.isSelectingTarget) {
    browser.tabs.query({
      active: true,
      windowId: window.contentWindowId
    }).then(function(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {selectMode: true, selecting: false});
    }).catch(function(reason) {
      console.log(reason);
    });
  } else {
    PlaybackState.stopPlaying();
    browser.tabs.query({
      active: true,
      windowId: window.contentWindowId
    }).then(function(tabs) {
      if (tabs.length === 0) {
        console.log("No match tabs");
        UiState.setSelectingTarget(false);
      } else
        browser.tabs.sendMessage(tabs[0].id, {selectMode: true, selecting: true});
    });
  }
}

window.selectTarget = function(target) {
  UiState.setSelectingTarget(false);
  if (UiState.selectedCommand) {
    UiState.selectedCommand.setTarget(target[0][0]);
  } else if (UiState.selectedTest.test) {
    const command = UiState.selectedTest.test.createCommand();
    command.setTarget(target[0][0]);
  }
};

window.endSelection = function(tabId) {
  UiState.setSelectingTarget(false);
  browser.tabs.sendMessage(tabId, {selectMode: true, selecting: false});
};
