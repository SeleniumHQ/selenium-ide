---
id: emitting-code
title: Emitting Code
sidebar_label: Emitting Code
---

Selenium IDE has two major components, playback inside the browser, which is powered by `actions` and `events`.  

And playback in command line mode using [the command-line runner](../introduction/command-line-runner).  

### Selenium SIDE Runner Environment

The runner is based on Node, you can leverage the environment to emit better code.

- Node.js 8 or above with npm
- [Jest](https://facebook.github.io/jest/)
- [jest-environment-selenium](https://github.com/applitools/jest-environment-selenium)
- [selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver)

## Emitting Code

When emitting code certain points has to be taken, since your plugin isn't the only one that emits it, and isn't the one that controls the flow of the emissions.  
In order to make sure that plugins don't mess each other's execution, certain precautions must be taken.

### Never Use Return

The keyword `return` means that the code after you will never be reachable, you could hinder other plugins.

```js
return somePromise();
plugin2Func(); // unreachable
```

Instead, since we are using Node 8 or above, we can leverage [async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).

```js
await somePromise();
plugin2Func(); //works
```

### Don't Define Variables on the Global Scope

Defining variables on the global scope, means that if you and another plugin, or Selenium IDE itself, defines the same variable, an error, or an unknown side effect can happen, which will make things hard to debug.  

For example take this test case:
- `store` | `button` | `element`
- `plugin click` | `button`
- `assert element present` | `css=${element}`  

If you define a variable the code will look as follows

```js
let element = "button";
let element = await driver.findElement();
await element.click();
expect(element).toBePresent(); // different button!
```

To avoid defining a variable on the global scope, use the `then` function of the Promise

```js
let element = "button";
await driver.findElement().then(element => {
  return element.click();
});
expect(element).toBePresent(); // the store defined button
```

### Summing Up

In general, try avoiding messing with the global scope, if you need to define you can always use the Promise's `then` or worse case use an [iife](https://developer.mozilla.org/en-US/docs/Glossary/IIFE).
