---
id: system
title: Plugins System API
sidebar_label: System
---

The System API is the most basic API which Selenium IDE provides. It is not prefixed and can be called with `/`. 

### `GET /health`

Used for plugin health checks, see [Plugin Health Checks](../../plugins/health-checks).

### `POST /register`

Used to register your plugin with Selenium IDE, this way the IDE knows of your plugin's existence, see [registering the plugin](../../plugins/plugins-getting-started#registering-the-plugin).

### `POST /log`

Used for `system` logs, meaning when the user can filter by system logs group.  
Logs that explain plugin usage, or status should be logged here.  

```js
{
  uri: "/log",
  verb: "post"
  type: "log type", // error, warn, undefined
  message: "your log message goes here"
}
```
- `type` - log type, `undefined` is an info log, while `error` will appear red, and `warn` will appear orange.
- `message` - `string` message, any links will be automatically linkified.

### `GET /project`

Fetches the `id` and `name` of the currently loaded project.

```js
{
  id: "auto-generated-project-id",
  name: "your-project-name"
}
```

#### Returns

Returns `true` if the log was added.
