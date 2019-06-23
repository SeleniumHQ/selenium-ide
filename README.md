<img src="https://www.seleniumhq.org/selenium-ide/img/selenium-ide128.png" alt="logo" height="128" align="right" />

# Selenium IDE &middot; [![Build Status](https://api.travis-ci.com/SeleniumHQ/selenium-ide.svg?branch=master)](https://travis-ci.com/SeleniumHQ/selenium-ide)

_[WIP] An integrated development environment for Selenium scripts_

Selenium IDE as a WebExtension is developed under the branch `v3` view the readme [here](https://github.com/SeleniumHQ/selenium-ide/tree/v3).

## Introduction

This project is a work in progress, towards a complete rewrite of the old Selenium IDE.
The IDE traditionally was developed to be a browser extension, we are now rewriting it to work as an electron app, more info soon.

## Installation

### WebExtension
- [Chrome extension](https://chrome.google.com/webstore/detail/selenium-ide/mooikfkahbdckldjjndioackbalphokd)
- [Firefox extension](https://addons.mozilla.org/en-GB/firefox/addon/selenium-ide/)

## Electron

The move to Electron is a work in progress. We will post updates as progress is made. If you're looking for Selenium IDE as a browser extension then check out the `v3` branch.

### Prerequisites

- `git` has to be in `$PATH` for the installation to pass

- [yarn](https://yarnpkg.com/en/docs/install)

### Building

- Install the dependencies
`yarn` or if using Node 10 `yarn --ignore-engines`
- Build the extension  
`yarn build` and then
`yarn watch` for faster incremental builds

## What now?

Here's a draft of the general tasks ahead. Feel free to pitch in and announce which you wish to take upon yourself:

* Extension UI - SeIDE users should feel right at home
* Selectors accuracy - an option is ranking selectors - we can optimize selectors correctness and test stability by collecting as many attributes as we can per user event. The most likely properties will be used for the selectors, with fallback to the others.
* Intelligent editing
* Export to selenium code in different languages
* Playback in a way that's consistent with web drivers
* Open for extensions

## Questions or want to chat?

If you have questions, check out [our FAQ](https://github.com/SeleniumHQ/selenium-ide/wiki/Frequently-Asked-Questions).

You can also find us on on the [#selenium](irc://freenode.net/selenium) IRC
channel, which is also available on
[Slack](https://seleniumhq.herokuapp.com).
