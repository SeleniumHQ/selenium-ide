---
id: emitting-setup-teardown
title: Emitting Setup and Teardown Code
sidebar_label: Emitting Setup & Teardown
---

Some commands may require additional setup and teardown if they are used.  

For example a command that counts the redirects and prints the amount at the end of the test.  

When running in the browser the [playback events](ide-events.md#playback-events) can be used, but when executing using the runner there are extra steps necessary to achieve this.  

Before implementing setup and teardown code emitting, getting a general concept with how emitting works is a good idea ([link](emitting-code.md)).  

## Test Architecture

Under the hood the [runner](emitting-code.md#selenium-side-runner-environment) uses jest to perform the tests.  

Tests in general look like so

```js
// config emission
describe("suite name", () => {
  beforeAll(async () => {
    // suite before all emission
  });
  beforeEach(async () => {
    // suite before each emission
  });
  afterEach(async () => {
    // suite after each emission
  });
  afterAll(async () => {
    // suite after all emission
  });
  it("test name", async () => {
    // test setup
    driver.doStuff();
    ....
    expect();
    // test teardown
  });
});
```
At each of the above comments code can be inserted as part of setup and teardown.

### Config Emitting

Use the config emitting request to emit code to the top of the test file, used for setting global variables or `require`ing different modules.  

```js
{
  action: "emit",
  entity: "config",
  project: {
    name: "project name"
    tests: []
  }
}
```

- `action` - `emit`, indicating an action that requires code emitting.
- `entity` - `config`, the entity to emit, config code is placed atop the test file.
- `project` - data of the project exported.

#### Response

```js
sendResponse(`const myLibrary = require("my-library");`);
```

### Suite Emitting

Try to always use the suite emitting, it uses the built-in [jest methods](https://facebook.github.io/jest/docs/en/api.html#reference), `beforeAll`, `beforeEach`, `afterAll` and `afterEach`.  

```js
{
  action: "emit",
  entity: "suite",
  suite: {
    name: "suite name"
    tests: []
  }
}
```

- `action` - `emit`, indicating an action that requires code emitting.
- `entity` - `suite`, the entity to emit, suite code can go before and after each test, or once before and after all tests.
- `suite` - data of the suite exported.

#### Response

```js
sendResponse({
  beforeAll: "this will run once before all tests",
  beforeEach: "this will run before every test",
  afterEach: "this will run after every test",
  afterAll: "this will run after all tests"
});
```

### Test Emitting

This method is discouraged, as it will emit code inside the test case `it` function.  

Which will in turn mess with test metrics (test performance etc.), if at all possible use the suite's level `beforeEach` and `afterEach`.  

```js
{
  action: "emit",
  entity: "test",
  test: {
    id: "unique test identifier",
    name: "test name",
    commands: [
      command: "commandId",
      target: "specified target",
      value: "specified value"
    ]
  }
}
```

- `action` - `emit`, indicating an action that requires code emitting.
- `entity` - `suite`, the entity to emit, suite code can go before and after each test, or once before and after all tests.
- `test` - data of the test exported, identifier, name and a list of commands.

#### Response

```js
sendResponse({
  setup: "this will run at the beginning of the test",
  teardown: "this will run at the end of the test"
});
```
