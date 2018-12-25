---
id: command-line-runner
title: Command-line runner
sidebar_label: Command-line runner
---

You can now run your tests cross-browser, in parallel, and on a Grid without needing to write any code.

It's a simple matter of installing the Selenium IDE command line runner and launching it from a command prompt.

## Prerequisites

The following dependencies are needed for the command line runner to work:

- `node` (the Node.js programming language) version `8` or `10`
- `npm` (the NodeJS package manager) which typically gets installed with `node`
- `selenium-side-runner` (the Selenium IDE command line runner)
- and the browser driver we want to use (`chromedriver` in this case)

```sh
> brew install node
> npm install -g selenium-side-runner
> brew install chromedriver
```

__NOTE: Your system configuration may differ from what's used in the sample above (e.g., Homebrew on MacOS). If so, see [the Node installation documentation for package managers](https://nodejs.org/en/download/package-manager/) or download a Node installer for your operating system directly from [the Node downloads page](https://nodejs.org/en/download/) and check out the Getting Started documentation for [ChromeDriver](http://chromedriver.chromium.org/getting-started).__

## Launching the runner

Once everything's installed, running your tests is a simple matter of calling `selenium-side-runner` from the command-line followed by the path to the project file saved earlier (see [Getting Started](getting-started.md)).

```sh
> selenium-side-runner /path/to/your-project.side
```

_NOTE: If you have multiple `.side` files you can use a wildcard (e.g., `/path/to/*.side`)._

When you run this command it will launch your tests in parallel, launching multiple browser windows spread across `n` processes (where `n` is the number of available cores on your machine).

The number of processes is configurable (amongst other things) at run time through various arguments you can provide.

## Run-time Configuration

With the runner you have the ability to pass in different configuration arguments at run time. Things like Selenium's browser capabilities.

For instance if you had Chrome installed in a non-standard location on your machine you could specify it so ChromeDriver knows where to look.

```sh
selenium-side-runner -c "chromeOptions.binary='/path/to/non-standard/Chrome/install'"
```

Alternatively if you wanted to run your tests on a different browser locally (e.g., Firefox) then you could specify that too.

```sh
selenium-side-runner -c "browserName=firefox"
```

__NOTE: For Firefox to work you'll need to download Mozilla's `geckodriver` and add it to your path (just like with ChromeDriver). For details, see [the `geckodriver` project page](https://github.com/mozilla/geckodriver/#usage).__

To run your tests on a Grid (e.g., your own Grid or on a hosted provider like Sauce Labs) you can specify that along with different capabilities.

```sh
selenium-side-runner --server http://localhost:4444/wd/hub -c "browser=chrome platform=MAC"
```

When running on a Grid you will likely need to control how many parallel sessions you are running. For that you can use the `-w n` command flag (where `n` is the number of processes you want).

```sh
selenium-side-runner -w 10 --server http://localhost:4444/wd/hub
```

## A framework at your fingertips

There are also other niceties that come out of the box with the runner. Things you would expect to be available in a traditional test automation framework.

With the ability to specify a different base URL you can easily point your tests at different environments (e.g., local dev, test, staging, production).

```sh
selenium-side-runner --base-url https://localhost
```

You also have the option to run a targeted subset of your tests with the `--filter target` command flag (where `target` is a regular expression value). Test names that contain the given search criteria will be the only ones run.

```sh
selenium-side-runner --filter smoke
```

And rather than remembering all of the command-line arguments you need (which can become unwieldy) there's the ability to store your go-to configuration in a file.

Just create a `.side.yml` file in the directory you'll be running your tests from. The runner will pick it up automatically. Here is an example of the file's contents.

```yaml
capabilities:
  browserName: "firefox"
baseUrl: "https://www.seleniumhq.org"
server: "http://localhost:4444/wd/hub"
```

If you want to ignore the file and use command line arguments instead, use `--no-sideyml` along with your other commands at run time.

## Additional details

For details on additional functionlity the runner offers see [its documentation](https://github.com/SeleniumHQ/selenium-ide/blob/master/packages/selenium-side-runner/README.md).

__NOTE: If you're trying to learn how translate recorded tests into WebDriver code, or if you want to integrate recorded tests into an existing custom test framework, then what you need is code export which is on the project roadmap and will be available soon.__
