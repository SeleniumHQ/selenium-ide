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
