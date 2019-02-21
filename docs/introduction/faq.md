---
id: faq
title: FAQ
sidebar_label: Frequently Asked Questions
---

### How do I record hovers?

Mouseover (a.k.a. hover) actions are difficult to automatically capture as part of a record cycle.

To add a hover to your test, there's a small bit of manual intervention required. And there are two different ways you can do it.

_Option 1: Add it while recording_

1. While recording, right click on the element you want to hover over
2. From the menu that appears click `Selenium IDE` and then `Mouse Over`
3. Confirm the `Mouse Over` test step is in the correct location in your test (and drag-and-drop it to a different location if need-be)

_Option 2: Add it by hand in the test editor_

1. Right click on a test step in the IDE
2. Select `Insert new command`
3. Type `mouse over` into the `Command` input field
4. Type the locator you want to hover over in the `Target` input field (or click `Select target in page` and select the element you want to hover over)

### Why don't numbers that are typed into a date input field appear correctly?

This issue presents itself when running your tests through the command line runner for Selenium IDE.

To circumvent it, you will need to enable w3c mode, which you can do by passing `-c "chromeOptions.w3c=true"` as part of launching the runner.

It's worth nothing that enabling w3c mode can impact the performance of Selenium Actions (if your tests end up using them) so only use this mode if you're having problems with date input fields.

### How do I get the IDE to wait for a certain condition to be true before proceeding?

There are certain circumstances where the built in wait strategies in the IDE aren't sufficient. When that happens, you can use one of the available explicit wait commands.

- `wait for element editable`
- `wait for element present`
- `wait for element visible`
- `wait for element not editable`
- `wait for element not present`
- `wait for element not visible`

### How to install the IDE behind strict Proxy/Firewall?

In some situations you may not have full public internet access (such as behind a "Corporate Proxy or Firewall"). In those environments you will need to obtain a copy of the built Selenium IDE ZIP file in order to record automated test scripts. This is available on GitHub's "Releases" section here:

https://github.com/SeleniumHQ/selenium-ide/releases

Not all releases include "selenium-ide.zip" since some are just "Source Code" releases. Look for the most recent build that has this zip file. It implies that it is the most recent version submitted to the Chrome and Firefox stores.

#### Officially signed versions

Downloading the zip file from the project release page provides you with an unsigned ZIP file. You can, alternatively, obtain officially signed installers that play better with "secured environments" from:
* [Firefox Add-Ons](https://addons.mozilla.org/en-US/firefox/addon/selenium-ide/)
* [Download instructions for the required ".xpi" installer](https://superuser.com/questions/646856/how-to-save-firefox-addons-for-offline-installation)

__NOTE: If you already have the plugin installed (e.g., on the laptop you're trying to obtain a copy of the installer for) you'll only see the REMOVE button when trying to access them. So remove them once, get the installers for moving to another unconnected computer, then re-install in your primary device's browsers as needed.__

* [Chrome store](https://chrome.google.com/webstore/detail/selenium-ide/mooikfkahbdckldjjndioackbalphokd)
* [Download instructions for the required ".crx" installer](https://stackoverflow.com/questions/25480912/how-to-download-a-chrome-extension-without-installing-it)

__NOTE: you can't obtain the ".crx" file directly from the Chrome store. Instead, you need to install it once locally, and then go to the installation directory on your machine to retrieve it.__
