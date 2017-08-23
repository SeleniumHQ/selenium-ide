browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
    browser.windows.create({type: "detached_panel", url:"/src/panel/main.html?tabId=" + tabs[0].id, width:500, height:800})
});
