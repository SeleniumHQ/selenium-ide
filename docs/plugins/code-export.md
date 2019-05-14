---
id: code-export
title: Code Export Plugin Support
sidebar_label: Exporting Code
---

The plugins API enables any Selenium IDE plugin to be export code in response to certain events (or "hooks").

### Export config

In your plugin manifest you'll need to specify that it exports languages, and for which ones.

```javascript
  "exports": {
    "languages": ["java-junit"]
  }
```

### Export event

Selenium IDE sends the following event for each entity type, which your plugin can respond to for code export.

```js
{
  action: "export",
  entity,
  language,
  options,
}
```

- `action` - `export`, indicating an action that requires code export
- `entity`, the entity to export, can be `command` or any of [the hooks mentioned in the next section](code-export.md#hooks)
- `options` - metadata to help your plugin make more informed decisions about what to export (e.g., project, test name, suite name, etc.)

## Hooks

Code export is built around the notion of hooks, which offers entry points into various parts of the test code that gets exported.

- `afterAll` (after all tests have completed)
- `afterEach` (after each test has been completed - before `afterAll`)
- `beforeAll` (before all tests have been run)
- `beforeEach` (before each test has been run - after `beforeAll`)
- `command` (emit code for a new command added by a plugin)
- `dependency` (add an addittional language dependency)
- `inEachBegin` (in each test, at the beginning of it)
- `inEachEnd` (in each test, at the end of it)
- `variable` (declare a new variable to be used throughout the suite)

## Response

To respond to an export event, call `sendResponse` along with the string you'd like to export. If there are multiple lines to your string, separate them with newline characters (e.g., `\n`).

Or you can look into using the command object structure mentioned in the [code export getting started](introduction/code-export.md#2-update-the-locators-and-commands).

```js
sendResponse(`const myLibrary = require("my-library");`);
```


