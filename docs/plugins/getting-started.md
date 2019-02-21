---
id: plugins-getting-started
title: Getting Started with Plugins
sidebar_label: Getting Started
---

Plugins can extend Selenium IDE's default behavior, through adding additional commands and locators, bootstrapping setup before and after test runs, and affecting the recording process.  

Selenium IDE is using the WebExtension standard to work in modern browsers (to learn more, you can check out Mozilla's <a href="https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Your_first_WebExtension" target="_blank" rel="noopener noreferrer">Your first extension</a> article). Communicating between the extensions is handled via the <a href="https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/sendMessage" target="_blank" rel="noopener noreferrer">external messaging protocol</a>, you can view an example of that <a href="https://github.com/SeleniumHQ/selenium-ide/tree/master/packages/extension-boilerplate" target="_blank" rel="noopener noreferrer">here</a>.  

This article assumes knowledge in WebExtension development, and will only discuss Selenium IDE specific capabilities.

## Calling the API

Selenium IDE API can be called using `browser.runtime.sendMessage`.  

An example signature would be `browser.runtime.sendMessage(SIDE_ID, request)` where `SIDE_ID` refers to the IDE's official extension IDs, which can be viewed [here](extension-id).  

### Request

The request is the second argument for `browser.runtime.sendMessage` and is similar in it's ideas to HTTP.  

```js
{
  uri: "/register",
  verb: "post",
  payload: {
    name: "Selenium IDE plugin",
    version: "1.0.0"
  }
}
```

- `uri` - a resource locator to an IDE feature (e.g. record a command, resolve a locator)
- `verb` - a modifier function (e.g. `get` gets you stuff, `post` adds new stuff, just like in http)

The IDE will reply with a valid response, or in case of an error, this can be viewed by opening the DevTools of the IDE window.

```js
browser.runtime.sendMessage(SIDE_ID, request).then(response => {
  console.log("it worked!");
});
```

## The Manifest

Plugins provide the IDE with a manifest that declares their changes and additions to the IDE's capabilities.  

```js
{
  name: "New Plugin",
  version: "1.0.0",
  commands: [
    {
      id: "newCommand",
      name: "new command",
      type: "locator",
      docs: {
        description: "command description",
        target: { name: "command target", value: "command target description" },
        value: { name: "command value", value: "command value description" }
      }
    },
    {
      id: "anotherCommand",
      name: "another command",
      type: "locator",
      docs: {
        description: "another command description",
        target: "locator",
        value: "pattern"
      }
    }
  ],
  locators: [
    {
      id: "locator"
    }
  ],
  dependencies: {
    "selenium-webdriver": "3.6.0"
  }
}
```

### General Information

- `name` - required, the plugin name.
- `version` - required, the plugin version.

### Commands

A list of new commands to be added to the IDE, each command takes a few parameters:  

- `id` - required, a camelCase unique identifier for the command.
- `name` - required, a natural language name for the command, the user will see this.
- `type` - optional, can be either `locator` or `region`, is used to enable the `find` and `select` buttons. (**NOTE:** `type` is still in beta, and may be changed in the future).
- `docs` - optional, a collection of metadata for the command description, target, and value. Alternatively, you can use an existing command target or value (a.k.a. ArgTypes) by specifying its name as a string (rather than a sub-collection). See `ArgTypes` in <a href="https://github.com/SeleniumHQ/selenium-ide/blob/master/packages/selenium-ide/src/neo/models/Command/ArgTypes.js" target="_blank" rel="noopener noreferrer">`ArgTypes.js`</a> for a full list.

### Locators

**NOTE: Locators are still Work-in-Progress, and will be added shortly**  

A list of new locators to be added to the IDE, each locator simply takes `id`.
- `id` - required, a unique identifier for the locator, will be shown to the user (e.g. `name`, `css`).

### Dependencies

Additional <a href="https://nodejs.org/en/" target="_blank" rel="noopener noreferrer">Node.js</a> dependencies to download and use when ran using [the command-line runner](../introduction/command-line-runner).  

Dependencies are a dictionary of `key:value` like so `name:version`, where name is the published name on <a href="http://npmjs.com/" target="_blank" rel="noopener noreferrer">npm</a> and version is a valid <a href="https://semver.org/" target="_blank" rel="noopener noreferrer">semver</a> published to npm.

## Registering the Plugin

To register the plugin with Selenium IDE, make sure the IDE window is open, and that you're using the correct [Selenium IDE Extension ID](extension-id).  

Send the following message:  

```js
browser.runtime.sendMessage(process.env.SIDE_ID, {
  uri: "/register",
  verb: "post",
  payload: {
    name: "Selenium IDE plugin",
    version: "1.0.0",
    commands: [
      {
        id: "successfulCommand",
        name: "successful command"
      },
      {
        id: "failCommand",
        name: "failed command"
      }
    ]
  }
}).catch(console.error);
```

Where `payload` is the manifest.
