---
id: health-checks
title: Plugin Health Checks
sidebar_label: Health Checks
---

Plugins can only [register](plugins-getting-started#registering-the-plugin) with Selenium IDE when the extension window is open.

Registering before that will yield an error saying `Selenium IDE is not active`.

To deal with that you can send a message to the [System API's](system) health check. 

## Health Request

```js
{
  uri: "health",
  verb: "get"
}
```

## Health Response

- `error` - Either Selenium IDE is inactive, or not installed.
- `true` - Your plugin is already registered and able to accept requests.
- `false` - Your plugin is not registered and should send a [[registration | Getting Started with Plugins#registering-the-plugin]] request.  

## Polling the Health Checks

You can use this health checking mechanism to introduce polling and register when Selenium IDE goes active.  

You should keep polling Selenium IDE even after, since the user can close the IDE's window.  

```js
let interval;

export function sendMessage(payload) {
  return browser.runtime.sendMessage(SIDE_ID, payload);
}

export function startPolling(payload, cb) {
  interval = setInterval(() => {
    sendMessage({
      uri: "/health",
      verb: "get"
    }).catch(res => ({error: res.message})).then(res => {
      if (!res) {
        sendMessage({
          uri: "/register",
          verb: "post",
          payload
        }).then(() => {
          console.log("registered");
          cb();
        });
      } else if (res.error) {
        cb(new Error(res.error));
      }
    });
  }, 1000);
}

export function stopPolling() {
  clearInterval(interval);
}
```

This way you can retry connecting to the IDE every second, and if the IDE window is closed, within a second you'll get a callback notifying you of that.
