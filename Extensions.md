#Extensions Manifest

##Background
Selenium IDE extensions need to be able to change the behavior of the extension at 3 key points
 - Content scripts (tab under test)
 - Popup (GUI)
 - Domain data manipulations (save, load, export, etc...)

##Structure
Since the content scripts and the popup have different execution context and elevation, they need to be separated
```
extension/
  plugin.json //general meta data, author, version, etc...
  content.js //tab under test manipulation script
  background.js //popup changes (add buttons), playback changes (playback functionality)
```

##Distribution
###Chrome
Chrome does not forbid in it's [policy](https://developer.chrome.com/webstore/program_policies#security) execution of remote code.
###Firefox
According to Mozilla's [policy](https://developer.mozilla.org/en-US/Add-ons/AMO/Policy/Reviews#policy-security) execution of remote code is forbidden in listed extensions, unless it's same-origin, meaning the user hosts it on his website.
Executing background scripts is strictly forbidden.
Extensions are also forbidden from having it's own update mechanism, which means we can't automatically update Selenium IDE extensions.
Greasemonkey uses [tabs.executeScript](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/executeScript) to execute user defined scripts in the document's permission levels, our use-case requires higher elevations, since the background scripts need to be manipulated as well.
Also sources must be submitted to Mozilla for review unobfuscated.
