---
id: adding-commands
title: Adding Commands
sidebar_label: Adding Commands
---

To add a command to Selenium IDE firstly make sure to declare it in the [manifest](plugins-getting-started#the-manifest).

After declaring the command, Selenium IDE will expect you to respond to requests for its execution and emission.  

## Executing a Command

Once the playback reaches your command, you'll receive a [request](requests.md#requests-from-the-ide) to execute it.  

```js
{
  action: "execute",
  command: {
    command: "commandId",
    target: "target specified",
    value: "value specified"
  },
  options: {
    runId: "unique identifier",
    testId: "test identifier",
    frameId: "the frame context",
    tabId: "the tab context",
    windowId: "the window context"
  }
}
```

- `action` - `execute`, this action requires you to execute the command.

#### Command

Command details the user has input in the table:

- `command` - the command ID (not the friendly name), as in the manifest.
- `target` - the target filled (if your command does not take a target it can be safely ignored).
- `value` - the value filled (if your command does not take a value it can be safely ignored).

#### Options

Playback options, detailing the execution environment:

- `runId` - optional, a unique identifier for the current test run, can be used to infer certain commands were performed during the same run.
- `testId` - a persistent unique identifier for a test, even though the test's content may change, the same identifier will always be sent.
- `frameId` - `integer` or `0 || undefined` indicates under which frame the command should be executed, `0` or `undefined` indicates that the command should be executed at the `window` level.
- `tabId` - the tab to execute the command in.
- `windowId` - the window containing the tab under test.  

**NOTE:** If a user double clicks a command to execute it alone, a `runId` will not be generated, this can be used to determine if it's a single command run, or a full test run.

### Sending Results Back to the IDE

To send a valid response back to the IDE, first you have to determine which of the 4 possible outcomes you'd like the IDE to show.

#### Pass

Your command has passed.

```js
sendResponse(true);
```

#### Undetermined

If your command finished, but can't reliably determine wether it has passed or not.  

To update the command state at a later stage use the [Playback API](../api/plugins/playback).  

```js
sendResponse({ status: "undetermined" });
```

#### Soft Failure

Your command has failed, but the test case can continue executing after it (e.g. `verify` commands).

```js
sendResponse({ error: "detailed error to show the user" });
```

#### Hard Failure

Your command has failed, making the test unable to continue (e.g. `click`).

```js
sendResponse({ error: "detailed error to show the user", status: "fatal" });
```

## Emitting a Command

In order to run the test case using the [command-line runner](../introduction/command-line-runner), commands also must provide JavaScript code fragments to execute it.  

Failing to provide it will result in the user getting an error when trying to save the test case.  

Before implementing the command's code emitting, it will be useful to understand the general concepts of how emitting works ([link](emitting-code.md)).  

This article is only concerned with the command's test code, if your plugin needs to add setup and teardown code, see [Emitting Setup and Teardown Code](emitting-setup-teardown.md).  

Selenium IDE will send a request to emit the commands you've registered in the manifest.

```js
{
  action: "emit",
  entity: "command",
  command: {
    command: "commandId",
    target: "target specified",
    value: "value specified"
  }
}
```

- `action` - `emit`, this action indicates code has to be emitted.
- `entity` - `command`, this entity indicates that a command is to be emitted.

#### Command

Command details the user has input in the table:

- `command` - the command ID (not the friendly name), as in the manifest.
- `target` - the target filled (if your command does not take a target it can be safely ignored).
- `value` - the value filled (if your command does not take a value it can be safely ignored).

### Returning the Emitted Code

Once you've finished creating the JavaScript string to execute the command, send it back to the IDE.  

**Don't use the `return` keyword, if you need to wait on a Promise use `await`, `return` will cause the test to quit early.**  

**NOTE:** Don't beautify the code, or insert new lines, the IDE will beautify it instead.

```js
sendResponse(`driver.findElement().then((element) => {element.perform...});`);
```  

You can view extensive examples in the IDE's internal [emitting module](https://github.com/SeleniumHQ/selenium-ide/blob/master/packages/selianize/src/command.js).
