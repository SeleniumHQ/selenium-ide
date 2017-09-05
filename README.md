<img src="icons/icon.png" alt="logo" height="120" align="right" />

# Selenium IDE

_[WIP] An integrated development environment for Selenium scripts_

## Introduction

This project is a work in progress, a complete rewrite of the old Selenium IDE.
The older IDE was a Firefox extension that relied heavily on APIs that are no longer supported by newer versions of Firefox.
In this project, the IDE is developed as a modern browser extension, primarily aimed at Chrome.
However, by using the Web Extensions standard it's expected to run on other browsers too.

As this is an early stage and many things aren't clear, it's quite challenging to collaborate and coordinate the efforts - so please be patient.

## What now?

Here's a draft of the general tasks ahead. Feel free to pitch in and announce which you wish to take upon yourself:

* Extension UI - SeIDE users should feel right at home
* Capturing user interactions - research is required
* Ranking selectors - we can optimize selectors correctness and test stability by collecting as many attributes as we can per user event. The most likely properties will be used for the selectors, with fallback to the others.
* Intelligent editing
* Export to selenium code in different languages
* Playback in a way that's consistent with web drivers

## Want to chat?

We coordinate work on the [#selenium](irc://freenode.net/selenium) IRC
channel, which is also available on
[Slack](https://seleniumhq.herokuapp.com).