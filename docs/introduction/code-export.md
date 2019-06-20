---
id: code-export
title: Code Export
sidebar_label: Code Export
---

## Getting Started

You can export either a test or suite of tests to WebDriver code by right-clicking on a test or a suite, selecting `Export`, choosing your target language, and clicking `Export`.

![code-export-right-click](/selenium-ide/img/docs/code-export/right-click.png)
![code-export-menu](/selenium-ide/img/docs/code-export/menu.png)

This will save a file containing the exported code for your targret language to your browser's download directory.

### Origin Tracing Code Comments

When exporting there is an optional toggle to enable origin tracing code comments.

This will place inline code comments in the exported file with details about the test step in Selenium IDE that generated it.

## Supported Exports

Currently, export to the following languages and test frameworks is supported.

- Java JUnit
- JavaScript Mocha
- Python pytest

We intend to support all of the officially supported programming language bindings for Selenium (e.g., Java, JavaScript, C#, Python, and Ruby) in at least one testing framework for each language.

Contributions are welcome to help add new languages and test frameworks for a given language. See [How To Contribute](code-export.md#how-to-contribute) for details on how.

### Java JUnit

The exported code for Java JUnit is built to work with Java 8, JUnit 4.12, and the latest version of Selenium 3.

You should be able to take the exported Java file and place it into a standard Maven directory structure with a `pom.xml` file listing these dependencies and run it.

Here's a sample `pom.xml` to help you get started.

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>org.seleniumhq.selenium</groupId>
  <artifactId>selenium-ide-java-code-export</artifactId>
  <version>1</version>
  <url>http://maven.apache.org</url>
  <dependencies>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>4.12</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.seleniumhq.selenium</groupId>
      <artifactId>selenium-java</artifactId>
      <version>3.141.59</version>
    </dependency>
  </dependencies>
</project>
```

### JavaScript Mocha

The exported code for JavaScript Mocha is built to work with Node 10, Mocha 6.1.x, and the latest version of Selenium 4.

You should be able to take the exported JavaScript file and run it after installing these dependencies (e.g., with `npm install`).

Here's a sample `package.json` to help you get started.

```javascript
{
  "dependencies": {
    "mocha": "^6.1.4",
    "selenium-webdriver": "^4.0.0-alpha.3"
  }
}
```

### Python pytest

The exported code for Python pytest is built to work with Python 3, pytest 4.6.x, and the latest version of Selenium 4.

You should be able to take the exported JavaScript file and run it after installing these dependencies (e.g., with `pip3 install`).

Here's a sample `requirements.txt` to help you get started.

```
pytest == 4.6.3
selenium == 4.0.0a1
```

```sh
> pip3 install -r ./requirements.txt
```

## How To Contribute

Code export was built in a modular way to help enable contributions.

Each language and test framework will have its own package containing the code to be exported. Each snippet of code maps to a command in Selenium IDE and each of these packages rely on an underlying "core" package which does all of the heavy lifting.

Here are the steps to create one for a new language or for a new test framework within an already established language.

### 1. Create a new package

First, copy an existing language package (e.g., `packages/code-export-java-junit`) and rename it (e.g., the folder and the details in the `package.json` file) to the target language and framework you'd like to contribute (e.g., `packages/code-export-ruby-rspec`, etc.).

Next, add the new package as a dependency to [the `package.json` in `code-export`](https://github.com/SeleniumHQ/selenium-ide/blob/c55c556ffc947fd3f6ee8ab317915c6f879a88dc/packages/code-export/package.json#L22).

Lastly, run `yarn` from the root of the project, and then build the project using `yarn watch` (full details for getting a local build going are available [here](https://github.com/SeleniumHQ/selenium-ide/blob/v3/README.md)).

### 2. Update the locators and commands

The bread and butter of code export is the language specific strings that will be turned into outputted code. The most prominent of these are the commands and locator strategies (e.g., the syntax for the "by" lookups).

For a given language, there is a file for each, along with accompanying test files.

You can see an example of that in `packages/code-export-java-junit`.

- [Commands](https://github.com/SeleniumHQ/selenium-ide/blob/v3/packages/code-export-java-junit/src/command.js)
- [Command Tests](https://github.com/SeleniumHQ/selenium-ide/blob/v3/packages/code-export-java-junit/__test__/src/command.spec.js)
- [Locator Strategies](https://github.com/SeleniumHQ/selenium-ide/blob/v3/packages/code-export-java-junit/src/location.js)
- [Locator Strategies Tests](https://github.com/SeleniumHQ/selenium-ide/blob/v3/packages/code-export-java-junit/__test__/src/location.spec.js)

When declaring new commands you can either specify its output [as a string](https://github.com/SeleniumHQ/selenium-ide/blob/v3/packages/code-export-java-junit/src/command.js#L192), or [as an object which specifies indentation levels](https://github.com/SeleniumHQ/selenium-ide/blob/v3/packages/code-export-java-junit/src/command.js#L242-L249)).

Built into code-export is a prettifier which controls the indentation of the outputted code. This structure is useful if a command's output is verbose and you want to be explicit. Or if the command changes the indentation level of the commands that come after it.

### 3. Create the hooks

Hooks make up a majority of the structure of the code to be exported (e.g., a suite, a test, and all of the things that go into it like setup, teardown, etc.). They are also what enables plugins to export code to different parts of a test or a suite.

There are 9 different hooks:

- `afterAll` (after all tests have completed)
- `afterEach` (after each test has been completed - before `afterAll`)
- `beforeAll` (before all tests have been run)
- `beforeEach` (before each test has been run - after `beforeAll`)
- `command` (emit code for a new command added by a plugin)
- `dependency` (add an addittional language dependency)
- `inEachBegin` (in each test, at the beginning of it)
- `inEachEnd` (in each test, at the end of it)
- `variable` (declare a new variable to be used throughout the suite)

You can see an example of hooks being implemented in `packages/code-export-java-junit` here: [Hooks](https://github.com/SeleniumHQ/selenium-ide/blob/v3/packages/code-export-java-junit/src/hook.js)

### 4. Update the language specific attributes

In each language you need to specify some low-level details. Things like how many spaces to indent, how to declare a method, a test, a suite, etc.

You can see an example of this being implemented in `packages/code-export-java-junit` here: [Language specific options](https://github.com/SeleniumHQ/selenium-ide/blob/v3/packages/code-export-java-junit/src/index.js)

### 5. Add it to the mix

Once you've got everything else in place, it's time to wire it up for use in the UI.

This is possible in [`packages/code-export/src/index.js`](https://github.com/SeleniumHQ/selenium-ide/blob/v3/packages/code-export/src/index.js). 

You will need to add your language to `availableLanguages`.

### 6. Test and tune

The best end-to-end test for code export is to export a series of tests and verify that they run as you would expect.

From a development build you have access to the seed tests. This is a good starting point to verify that all of the standard library commands work for your new language.

Test, fix, and test again until you are confident with the end result.

### 7. Submit a PR

You've done the hard part. Now it's just a simple matter of submitting a PR. Please do so against the [`v3` branch](https://github.com/SeleniumHQ/selenium-ide/tree/v3).
