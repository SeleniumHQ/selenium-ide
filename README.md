<img src="src/icons/icon128.png" alt="logo" height="128" align="right" />

# Selenium IDE &middot; [![Build Status](https://travis-ci.org/SeleniumHQ/selenium-ide.svg?branch=master)](https://travis-ci.org/SeleniumHQ/selenium-ide)

_[WIP] An integrated development environment for Selenium scripts_

## Introduction

This project is a work in progress, a complete rewrite of the old Selenium IDE.
The older IDE was a Firefox extension that relied heavily on APIs that are no longer supported by newer versions of Firefox.
In this project, the IDE is developed as a modern browser extension, supporting both Chrome and Firefox and other modern browsers (in theory).

As this is an early stage and many things aren't clear, it's quite challenging to collaborate and coordinate the efforts - so please be patient.

We are using [SideeX](http://sideex.org/) as a start point. The SideeX team was kind enough to let us use their work.

## Installation

### Pre-packaged
- [Chrome extension](https://chrome.google.com/webstore/detail/selenium-ide/mooikfkahbdckldjjndioackbalphokd)

Firefox users for the time being can download the latest `xpi` from the [releases](https://github.com/SeleniumHQ/selenium-ide/releases) page.

## Prerequisites

- `git` has to be in `$PATH` for the installation to pass

- [yarn](https://yarnpkg.com/en/docs/install) `npm` might work as well (untested)

- [peru](https://github.com/buildinspace/peru#installation)

## Building

- Install the dependencies  
```peru sync```  
```yarn```
- Build the extension  
```yarn build```
- Install as developer on [Google Chrome](https://developer.chrome.com/extensions/getstarted#unpacked) or [Firefox](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Temporary_Installation_in_Firefox)  

Manifest located in `<Project Directory>/build/manifest.json`

## What now?

Here's a draft of the general tasks ahead. Feel free to pitch in and announce which you wish to take upon yourself:

* Extension UI - SeIDE users should feel right at home
* Selectors accuracy - an option is ranking selectors - we can optimize selectors correctness and test stability by collecting as many attributes as we can per user event. The most likely properties will be used for the selectors, with fallback to the others.
* Intelligent editing
* Export to selenium code in different languages
* Playback in a way that's consistent with web drivers
* Open for extensions

## Want to chat?

We coordinate work on the [#selenium](irc://freenode.net/selenium) IRC
channel, which is also available on
[Slack](https://seleniumhq.herokuapp.com).
