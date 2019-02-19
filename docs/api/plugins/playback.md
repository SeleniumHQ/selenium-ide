---
id: playback
title: Plugins Playback API
sidebar_label: Playback
---

The Playback API is for the playback capabilities of Selenium IDE.  

It is prefixed with `/playback`.  

### `GET /playback/location`

Used to resolve a locator using Selenium IDE.  

```js
{
  uri: "/playback/location",
  verb: "get",
  location: "valid IDE locator"
}
```

- `location` - a valid Selenium IDE locator (e.g. `css=input.submit`).

#### Returns

Returns an `xpath` to the element if it was found, or an error if not.

### `POST /playback/command`

Used to change the state of a command (e.g. passed, failed, etc...).

```js
{
  uri: "/playback/command",
  verb: "post",
  commandId: "the command's id",
  state: "valid state",
  message: "a message to show the user"
}
```

- `commandId` - a command ID to a command that appears in the current running test case.
- `state` - a valid command state: (`failed`, `fatal`, `passed`, `pending`, `undetermined`).
- `message` - optional, a message to show the user, note that not all command states support showing a message.

#### Returns

Returns `true` if the command state was changed.

### `POST /playback/log`

Used for `playback` logs, meaning when that the user can filter by playback logs group.  

Logs that playback progress, or status should be logged here.  

API is the same as [system logs](system.md#post-log).
