## 3.5.8
Improved recording indicator UI
Improved recording of mouse over locators
Enable saving projects with invalid file system characters
Enable plugins to delete commands
Fix for plugins to work with a suite of tests running in parallel in the runner
## 3.5.7
Fixed performance issue during recording that would cause the browser window to become unresponsive.
## 3.5.6
Added indication when selecting an element.  
Added a new xpath locator strategy.  
Base URL will resolve relatively if the target URL doesn't start with a `/`.  
Fixed an issue where send keys ${KEY_ENTER} may not always work.  
## 3.2.0
### SIDE Runner
Can now run project files [headlessly in command line](https://www.npmjs.com/package/selenium-side-runner)
### `run` command
Use the `run` command to call tests from within tests.
### `link` locator
`link` is deprecated in favor of `linkText` and `partialLinkText`, more info [here](https://github.com/SeleniumHQ/selenium-ide/releases/tag/v3.2.0).
### Control Flow commands
You can now use conditional logic in your tests with commands `if`, `else if`, `else`, `end`, `while`, `times`, `do`, and `repeat if`.
### `assert` and `verify` commands
Use the `assert` and `verify` commands to check the value of a variable against an expected value.
### Fixes
Fixed a bug in `executeScript` and `executeAsyncScript` that caused the command to hang when a variable name wasn't provided.
## 3.1.0
### Extensions
Selenium IDE supports extensions now, more info [here](https://github.com/SeleniumHQ/selenium-ide/wiki/Getting-Started-with-Plugins)
### Reference
A new reference tab added, gives helpful information about commands, check it out (next to the logs).
