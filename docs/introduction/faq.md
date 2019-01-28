---
id: faq
title: FAQ
sidebar_label: Frequently Asked Questions
---

### How do I record hovers?

Mouse over (a.k.a. hover) actions are difficult to automatically capture as part of a record cycle.

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
