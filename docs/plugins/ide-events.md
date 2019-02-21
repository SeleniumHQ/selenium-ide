---
id: ide-events
title: Selenium IDE Events
sidebar_label: IDE Events
---

Selenium IDE sends events throughout it's use to notify plugins of playback status or recording status.  

An event [request](requests.md) is very similar to an action request.  

### Event Request

```js
{
  action: "event",
  event: "recordingStarted",
  options: {
    event specific keys...
  }
}
```

- `action` - `event`, indicates that the action to be taken is an event.
- `event` - a unique identifier for that event.
- `options` - a JavaScript object containing information about that event.

### Responding to Events

Some events are notification only, meaning Selenium IDE will not let you have a chance to stop it to do you computation, while on some Selenium IDE can wait, refer to the [list of events](ide-events.md#list-of-events) for reference.  

Responding to events is just as any request, have a look at [Receiving Requests](requests.md#receiving-requests).

## List of Events

List of events emitted by Selenium IDE.

### System Events

#### projectLoaded

Event that pops each time a user loads a new project file.  

**Note:** Selenium IDE **will not** wait on this event.  

##### Options

- `projectName` - the loaded project's name
- `projectId` - the loaded project's id

### Record Events

#### recordingStarted, recordingStopped

Events that pop every time the user begins or finishes recording his actions.  

**Note:** Selenium IDE **will not** wait on this event.  

##### Options

- `testName` - the test to which commands are recorded.

#### commandRecorded

Events that pop when a command was recorded.  

**Note:** Selenium IDE **will** wait on this event.  

##### Options

- `tabId` - the tab id of the tab the command was recorded in.
- `command` - the recorded command.
- `target` - the recorded target.
- `targets` - an optional list of all recorded targets along with their strategies.
- `value` - the recorded value.

### Playback Events

#### playbackStarted, playbackStopped

Events that pop when a test case begins or finishes executing.  

**Note:** Selenium IDE **will** wait on these events.  

##### Options

- `runId` - unique identifier for this test run.
- `testId` - unique identifier for this test case (persists between different runs).
- `testName` - the running test's name.
- `suiteName` - optional, the running suite's name (only defined if ran as part of a suite).
- `projectName` - the current project's name.

#### suitePlaybackStarted

Event that pops when a test suite begins to execute.  

**Note:** Selenium IDE **will** wait on this event.  

##### Options

- `runId` - unique identifier for this test run.
- `suiteName` - the running suite's name.
- `projectName` - the current project's name.

#### suitePlaybackStopped

Event that pops when a test suite finishes to execute.  

**Note:** Selenium IDE **will not** wait on this event.  

##### Options

- `runId` - unique identifier for this test run.
- `suiteName` - the running suite's name.
- `projectName` - the current project's name.  

Selenium IDE will not wait on the stop event (unlike the start event), this is to prevent the user from feeling like the IDE is frozen, you can still run your teardown code, as subsequent test runs will have a different `runId`.

**Note:** suite events will pop in addition to the normal test case events.
