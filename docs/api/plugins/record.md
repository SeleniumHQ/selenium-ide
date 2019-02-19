---
id: record
title: Plugins Record API
sidebar_label: Record
---

The Record API is concerned with the recording capabilities of Selenium IDE.  

This API is prefix with `/record`.  

### `GET /record/tab`

Gets the `tabId` that the recorder is currently attached to (can be used even if not currently recording).

```js
{
  uri: "/record/tab",
  verb: "get"
}
```

#### Returns

An object containing the `id` of the tab, or an error if no tab is attached.

### `POST /record/command`

Adds a command to the currently recording test case.

```js
{
  uri: "/record/command",
  verb: "post",
  command: "the command id",
  target: "an initial target",
  value: "an initial value",
  select: true || false
}
```

- `command` - the command ID to insert per the manifest.
- `target` - an initial target for the command.
- `value` - an initial value for the command.
- `select` - `true` or `false`, wether to turn on the target selector after adding the command, can only be used in conjunction with the [command type](../../plugins/plugins-getting-started#commands).

#### Returns

Returns `true` if the command was added.
