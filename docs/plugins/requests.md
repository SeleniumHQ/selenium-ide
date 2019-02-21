---
id: requests
title: Sending and Receiving Requests
sidebar_label: Requests
---

Selenium IDE took its inspiration from HTTP for the messaging to it.  

Messaging from it, however, has a slightly different approach (to save plugins from developing their own router).  

## Requests to the IDE

The request is a JSON object with specific keys, determining it's eventual execution in the IDE.  

```js
{
  uri: "/path/to/resource",
  verb: "get",
  payload: {
    data: "request body goes here"
  }
}
```

- `uri` - a resource locator to an IDE feature (e.g. record a command, resolve a locator)
- `verb` - a modifier function (e.g. `get` gets you stuff, `post` adds new stuff, just like in http)
- `payload` - the request body, necessary information to perform an operation, changes from `uri` to `uri`

### Sending a Request

The IDE will reply with a valid response, in case of an error, this can be viewed by opening the DevTools of the IDE window.

```js
browser.runtime.sendMessage(SIDE_ID, request).then(response => {
  console.log("it worked!");
});
```

## Requests from the IDE

Requests from the IDE differ in keys and structure, the IDE has a router that takes care of nested routing (e.g. `uri: /path/to/nested/uri`). In order to avoid plugin developers from developing or implementing their own router, a different approach was taken.  

```js
{
  action || event: "an action to perform or an event to adhere",
  request keys...
}
```

- `action` or `event` - An action to execute or an event to respond to, actions can be executing a command or emitting it's code, while events can be that a playback was started, or a recording was started or ended.  
- `additional keys` - Additional keys determined by the `action` or `event` to be executed.

**NOTE:** only `action` OR `event` will be defined, never the both of them.

### Receiving Requests

To receive requests you have to implement [browser.runtime.onMessageExternal](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/onMessageExternal).  

```js
browser.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.action === "execute" && message.command) {
      console.log("I need to execute a command");
      return sendResponse(true); // I've finished execution
    }
    if (message.event === "playbackStarted") {
      console.log("IDE notified me a playback was started"); // Responding to events is optional
    }
});
```

#### Async Requests

Some requests are async in nature, when we need to wait on a promise or execute a command that changes the DOM.  

Selenium IDE will have to be notified to wait, it'll wait until `sendResponse` will be called. To prevent Selenium IDE from becoming **stuck waiting forever**, make sure that in case of failures, you return an [error](error-handling.md) to the IDE.  

In order to have Selenium IDE wait, `return true` in the `onMessageExternal` event handler, and keep `sendResponse` around to return the final results with.

```js
browser.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.action === "execute" && message.command && message.command.command === "myAsyncCommand") {
      executingSomeAsyncFunctionality(message.command).then(() => {
        return sendResponse(true);
      });
      return true;
    }
});
```
