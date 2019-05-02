---
id: code-export
title: Code Export
sidebar_label: Code Export
---

## Getting Started

You can export either a test or suite of tests to WebDriver code by right-clicking on a test or a suite, selecting `Export`, choosing your target language, and clicking `Export`.

This will save a file containing the exported code for your targret language to your browser's download directory.

### Origin Tracing Code Comments

When exporting there is an optional toggle to enable origin tracing code comments.

This will place inline code comments in the exported file with details about the test step in Selenium IDE that generated the generated code that follows it.

## Supported Exports

Currently, export to Java is supported. Specifically, Java for JUnit.

We intend to support all of the officially supported programming language bindings for Selenium (e.g., Java, JavaScript, C#, Python, and Ruby) in at least one testing framework for each language.

Contributions are welcome to help add new languages and test frameworks for a given language. See [How To Contribute](code-export.md#how-to-contribute) for details on how.

### Java JUnit

The exported code for Java JUnit is built to work with Java 8, JUnit 4.12, and Selenium 3.141.

You should be able to take the exported Java file and place it into a standard Maven directory structure with a `pom.xml` file listing these dependencies and run it.

## How To Contribute

Code export was built in a modular way to help enable contributions.

Each language and test framework will have its own package containing the code to be exported. Each snippet of code maps to a command in Selenium IDE.

Each of these packages rely on an underlying "core" package which does all of the heavy lifting.

### 1. Create a new package

To contribute a new language, simply copy an existing language package (e.g., `packages/code-export-java-junit`) and rename it (e.g., the folder and the details in the `package.json` file) to the target language and framework you'd like to contribute (e.g., `packages/code-export-ruby-rspec`, etc.).

### 2. Update the locators and commands

### 3. Update the language specific attributes

### 4. Create the hooks

### 5. Test and tune the exports

