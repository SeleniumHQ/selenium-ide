---
id: error-handling
title: Error Handling
sidebar_label: Error Handling
---

If you encounter a failure when executing a command and need to fail the test case because of it, you'll have to respond with an error to the IDE.  

Since JSON doesn't support Error serializations, a standard was made by the IDE.

## Error

An error object is a normal JavaScript object, that when sent to the IDE, will be parsed as an error.

```js
{
  status: "fatal",
  error: "This command can't be run individually, please run the test case."
}
```

- `status` - optional, can be `undefined` or `fatal`, a fatal error will fail the test, a non-fatal error will continue execution, useful for the `verify` commands.
- `error` - required, message to be printed to the user.

## Sending the Error

When encountering an error during execution, you can reply with the error object using `sendResponse`.

```js
browser.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.action === "execute" && message.command && message.command.command === "myFailingCommand") {
      executingSomeFunctionalityThatWillEventuallyFail(message.command).catch((error) => {
        return sendResponse({ error: error.message, status: "fatal" });
      });
      return true;
    }
});
```
