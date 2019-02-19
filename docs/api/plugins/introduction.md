---
id: introduction
title: Introduction to Plugins API
sidebar_label: Introduction
---

While Selenium IDE can send you a request to perform a task (execute a command or emit one), you can ask the IDE to perform a task as well.

Selenium IDE implements an HTTP like messaging protocol. For a general overview of how this works take a look at [Calling the API](../../plugins/plugins-getting-started#calling-the-api).  

## Structure of the API

The API is structured per domain of power (e.g. playback, record etc...).  

### Versioning

`uri`s in the API start at `/`, and are versioned, the current living version is 1, calling a `uri` with no version means the latest one.  

- `/register` - latest version of the register function.
- `/v1/register` - register `v1`

### Verbs

The API supports HTTP like verbs (`get`, `post`, `delete`, `put`).  

Each one determines different functionality on the resource.  

- `get` - gets the resource or information about it.
- `post` - creates a new resource.
- `put` - updates a resource.
- `delete` - deletes a resource.

### Errors

If the window is closed when a request is sent, Selenium IDE will not respond and the Promise will reject.  

Alternatively, if Selenium IDE is open it can either succeed which will resolve the Promise, or pass a "userland" error back to you, since errors can't be serialized.  

#### Connection error

A Connection error will occur when the IDE window is closed, therefore the promise will reject.

```js
browser.runtime.sendMessage(SIDE_ID, payload).catch((error) => {
  console.error(error); // connection error
});
```

#### Request error

A Request error will occur when a request is invalid, for example a request for a resource which doesn't exist, like [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). Such requests **resolve** the promise with errors attached on them.

```js
browser.runtime.sendMessage(SIDE_ID, payload).then((response) => {
  if (response.error) {
    console.error(response.error); // request error
  }
});
```

#### Successful Request

A successful request is one where `error` is not defined on the response object. Each endpoint has its own response and most `post` requests will respond with `true` if successful.

```js
browser.runtime.sendMessage(SIDE_ID, payload).then((response) => {
  if (!response.error) {
    console.error(response); // true
  }
});
```
