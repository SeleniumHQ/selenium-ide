---
id: code-export
title: Code Export Plugin Support
sidebar_label: Exporting Code
---

The plugins API enables any Selenium IDE plugin to export code for either:

1. an existing language
2. a new language

__NOTE: If adding a new language, take a look at [@seleniumhq/side-utils](https://www.npmjs.com/package/@seleniumhq/side-utils). You can see an example of it in use in existing languages for code-export (e.g., [java-junit](https://github.com/SeleniumHQ/selenium-ide/tree/v3/packages/code-export-java-junit)).__

### Export config

In your plugin manifest you'll need to specify that it exports languages.

<u>Add to an existing language</u>

To augment an existing language, use the `languages` key and specify which ones in an array.

```javascript
  "exports": {
    "languages": ["java-junit"]
  }
```

The currently available language ids `"java-junit"`, `"javascript-mocha"`, `"python-pytest"`, and `"csharp-xunit"`.

<u>Add a new language</u>

To add a new language to code export, use the `vendor` key and specify your langauge in an object array.

```javascript
  "exports": {
    "vendor": [{"your-language": "Your language"}]
  }
```

The key is the ID which will be used in the export event. The value is the display name that will be used in the code export menu in the UI.

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
- `entity`, the entity to export, can be `command`, any of [the hooks mentioned in the next section](code-export.md#hooks), or `vendor` if exporting a new language
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

### Add to an existing language

To respond to an export event, call `sendResponse` along with the string you'd like to export. If there are multiple lines to your string, separate them with newline characters (e.g., `\n`).

Or you can look into using the command object structure mentioned in the [code export getting started](introduction/code-export.md#2-update-the-locators-and-commands).

```js
sendResponse(`const myLibrary = require("my-library");`);
```

### Add a new language

In response to a `vendor` export event for your new language(s), your plugin needs to respond with the an object containing the keys `filename` and `body`.

```javascript
const payload = {
  filename: 'test.js',
  body: '// your final exported code\n// goes here\n// etc.'
}
sendResponse(payload)
```


