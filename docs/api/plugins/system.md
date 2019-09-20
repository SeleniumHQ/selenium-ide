---
id: system
title: Plugins System API
sidebar_label: System
---

The System API is the most basic API which Selenium IDE provides. It is not prefixed and can be called with `/`.

#### Opening Selenium IDE
If the extension is installed, a request could be made by a plugin to open Selenium IDE.

```js
{
  openSeleniumIDEIfClosed: true
}
```

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

#### Returns
Returns `true` if the log was added.

### `GET /project`

Fetches the `id` and `name` of the currently loaded project.

```js
{
  id: "auto-generated-project-id",
  name: "your-project-name"
}
```

### `POST /project`

Loads a project into the IDE, as if the user opened it, if the user has unsaved changes a dialog will ask him before doing so.

```js
{
  project: JSON parsed side file
}
```
### `POST /control`

Start a connection with a specific connection Id from another chrome extension. When this connection is accepted by the user, Selenium IDE restarts and registers the caller, and the extension takes exclusive control of Selenium IDE until user closes Selenium IDE or another connection is accepted. When this mode is on, the save to computer functionality gets overritten by sending the side file to the extension controlling Selenium IDE. When in this mode, the user needs to add connectionId variable to make other API calls such as `POST /project`, `GET /project`, `POST /log`, `POST /register`.

The payload of this call is the same manifesto used to register a plugin, in addition to the connection Id, which states the instance of the connection.

### `POST /close`

Closes Selenium IDE.

### `POST /connect`

Internal API call only. Used to make all modifications to Selenium IDE when establishing a connection.

```js
{
  controlled: true,
  controller: JSON plugin manifesto with connection Id 
}
```
