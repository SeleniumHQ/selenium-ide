# Changelog

## v3.17.0
- a11y: support resize text PR 972 (https://github.com/SeleniumHQ/selenium-ide/issues/975)
- a11y: color & design PR 972 (https://github.com/SeleniumHQ/selenium-ide/issues/965)
- a11y: announce recording has started PR 974 (https://github.com/SeleniumHQ/selenium-ide/issues/964)
- a11y: support labels, roles, tooltips, and focus order PR 973 (https://github.com/SeleniumHQ/selenium-ide/issues/963)
- a11y: long test names can be scrolled into view PR 987 (https://github.com/SeleniumHQ/selenium-ide/pull/987)
- add waitForText command PR 869 & 980 (https://github.com/SeleniumHQ/selenium-ide/issues/980)
- code export: add option to output command description on its own line PR 878
- add commands to context menu PR 867 & 899
- add confirmation dialog before loading a new project PR 883
- recording: fix click handling after starting/stopping PR 927
- recording: properly save handlers so they are correctly removed PR 926
- docs: updated getting-started PR 909

## v3.16.1
- Fix for playbackOptions becoming undefined when running nested tests
- Fix for window resizing in javascript-mocha code export

## v3.16.0
- Added the option to specify a remote Grid URL for code export
- Made code-export packages public so SIDE plugin maintainers can automate code generation for end-to-end testing if needed

## v3.15.1
 - Fix bug in playback which skips tests in suites

## v3.15.0
 - Code export C# xUnit PR #845
 - Code export C# NUnit
 - Code export Ruby RSpec
 - Added persistence to language selection in code export
 - Fix variable bug in Java code export when using nested for loops
 - Fix ActionChains in Python code export PR #827
 - Updated code export command validation to ignore commented out commands
 - Updated plugin boilerplate PR #859
 - Fix for the wrong filetype being used when saving a project or using code export
 - Made it so assertions in nested tests can be disabled from the run command

## v3.14.0
- Added experimental support for controlled extension mode
- Added property access to variables PR #808

## v3.13.0
- Control flow: Added optional loop limit override to `repeat if`
- Control flow: Excuded `for each` from implicit retry limit
- Runner: Fixed type checking bug for WebElements
- Plugins: Added support to open the IDE and load projects (PR #804)
- Code export: Added missing support for command registration to side-model (fixes broken code export for plugins)
- Variables: Added improved property access on variables (PR #808)

## v3.12.3
- Control flow: fix for off-by-one error in nested forEach command blocks

## v3.12.2
- Code export: Added command validation and error handling to notify the user of invalid commands
- Code export: Made the exported browser name match the current browser used for the IDE
- Control flow: Fixed a bug in forEach that prevented nested forEach command blocks from completely executing
- Runner: Fixed an off-by one error in forEach that prevented the last item in a collection from being used (PR #752)
- Docs: Updated runner documentation to specify required vendor prefix for browser specific options (PR #757)
- Docs: Fixed typo (PR #784)

## v3.12.1
- Fix for string escaping, to handle backslashes

## v3.12.0
- Added default wait time to `wait for` commands (PR #678)
- Added better string escaping to code export and code emitting for the command-line runner
- Made setWindowSize optional when emitting for the runner (issue #627)

## v3.11.1
- Add the ability for new programming languages to be specified through plugins

## v3.10.0
- Code export for JavaScript (e.g., Mocha, Node 10)

## v3.9.0
- Code export for Python (e.g., pytest, Python 3)
- Fix for frames to support `relative=parent` in the runner
- Fix for frames to support `relative=top` in IDE playback
- Added timestamps to log entries (PR #688)

## v3.8.1
- Code export fixes for commands that open and switch to new windows
- Added a suffix of "Test" to class and filenames in Java code export

## v3.8.0
- Added forEach and storeJson commands
- Made it so explicit wait commands (e.g., `wait for element visible`, etc.) override the built-in implicit wait mechanism
- Fixed a bug in how the runner fetches dependencies, so it only happens when features that need external dependencies are used
- Added the ability for plugins to create variables
- Changed the code export UI to prompt the user for a download location

## v3.7.4
- Fix for the runner to resolve a bug with fetching dependencies
- Fix for getting text from the page not getting white-space trimmed
- Updated the "What's New" link in the project header to open the latest IDE release page in GitHub

## v3.7.3
- Fix for the runner to resolve a dependency issue with the junit report formatter

## v3.7.2
- Fix for a bug that prevented plugins that exported code from registering with the IDE

## v3.7.1
- `selenium-side-runner` won't load multiple versions of selenium-webdriver into memory
- Fixed `store` context menu items 
- Removed `--configuration-file` flag, please use `--config` or `--config-file` instead
- Merged PR introducing the junit report formatter to the runner

## v3.7.0
- Improved plugin support for code export
- Support for recursive reused test methods in code export

## v3.6.0
- Code export for Java JUnit

## v3.5.8
- Improved recording indicator UI
- Improved recording of mouse over locators
- Enable saving projects with invalid file system characters
- Enable plugins to delete commands
- Fix for plugins to work with a suite of tests running in parallel in the runner

## v3.5.7
- Fixed performance issue during recording that would cause the browser window to become unresponsive.

## v3.5.6
- Added indication when selecting an element.  
- Added a new xpath locator strategy.  
- Base URL will resolve relatively if the target URL doesn't start with a `/`.  
- Fixed an issue where send keys ${KEY_ENTER} may not always work.  

## v3.2.0
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

## v3.1.0
### Extensions
Selenium IDE supports extensions now, more info [here](https://github.com/SeleniumHQ/selenium-ide/wiki/Getting-Started-with-Plugins)
### Reference
A new reference tab added, gives helpful information about commands, check it out (next to the logs).
