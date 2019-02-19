---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

## Installation

Install Selenium IDE from either the <a href="https://chrome.google.com/webstore/detail/selenium-ide/mooikfkahbdckldjjndioackbalphokd" target="_blank" rel="noopener noreferrer">Chrome</a> or <a href="https://addons.mozilla.org/en-US/firefox/addon/selenium-ide/" target="_blank" rel="noopener noreferrer">Firefox</a> web store.

## Launch the IDE

Once installed, launch it by clicking its icon from the menu bar in your browser.

### Troubleshooting

Don't see the icon for Selenium IDE in your menu-bar?

#### Option 1

Make sure the IDE is enabled in your browser's extension settings.

You can get there quickly by typing the following into your address bar and hitting `Enter`.

- Chrome: `chrome://extensions`
- Firefox: `about:addons`

#### Option 2

The extension might be enabled but the icon is hidden. Try resizing the menu bar to give it more space.

In Chrome, you can do this by clicking to the right of the address bar, holding the click, and dragging it left or right.

In Firefox you need to right-click, click `Customize`, make adjustments to the menu bar, and click `Done`.

## Welcome Screen

Upon launching the IDE you will be presented with a welcome dialog.

This will give you quick access to the following options:

- Record a new test in a new project
- Open an existing project
- Create a new project
- Close the IDE

If this is your first time using the IDE (or you are starting a new project), then select the first option.

## Recording your first test

After creating a new project you will be prompted to name it and then asked to provide a base URL. The base URL is the URL of the application you are testing. It's something you set once and it gets used across all of the tests in this project. You can change it later if need-be.

After completing these settings, a new browser window will open, load the base URL, and start recording.

Interact with the page and each of your actions will be recorded in the IDE. To stop recording, switch to the IDE window and click the recording icon.

## Organizing your tests

### Tests

You can add a new test by clicking the `+` symbol at the top of left side-bar menu (to the right of the `Tests` heading), naming it, and clicking `ADD`.

Once added you can either input commands manually, or click the record icon in the top-right of the IDE.

### Suites

Tests can be grouped together into suites.

On project creation, a `Default Suite` gets created and your first test gets added to it automatically.

To create and manage suites go to the `Test suites` panel. You can get there by clicking the drop-down at the top of the left side-bar menu (e.g., click on the word `Tests`) and selecting `Test suites`.

#### Add a suite

To add a suite, click the `+` symbol at the top of the left side-bar menu to the right of the `Test Suites` heading, provide a name, and click `ADD`.

#### Add a test

To add a test to a suite hover over the suite name, then do the following:

1. Click on the icon that appears to the right of the `Test Suites` heading
2. Click `Add tests`
3. Select the tests you want to add from the menu
4. Click `Select`

#### Remove a test

To remove a test, hover your mouse over the test and click the `X` that appears to the right of the name.

#### Remove or rename a suite

To remove a suite click the icon that appears to the right of its name, click `Delete`, and click `Delete` again when prompted.

To rename a suite hover over the suite name, click the icon that appears to the right of the name, click `Rename`, update the name, and click `RENAME`.

## Save your work

To save everything you've just done in the IDE, click the save icon in the top-right corner of the IDE.

It will prompt you to for a location and name of where to save the project. The end result is a single file with a `.side` extension.

## Playback

### In-browser

You can play tests back in the IDE by selecting the test or suite you'd like to play and clicking the play button in the menu bar above the test editor.

The test(s) will play back in the browser. If a window is still open from recording, it will be used for playback. Otherwise, a new window will be opened and used.

### Cross-browser

If you want to run your IDE tests on additional browsers, be sure to check out [the command-line runner](command-line-runner.md).
