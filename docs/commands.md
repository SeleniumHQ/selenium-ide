---
id: commands
title: Commands
sidebar_label: Commands
---

## `add selection`

Add a selection to the set of options in a multi-select element.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `answer on next prompt`

Affects the next alert prompt. This command will send the specified answer string to it. If the alert is already present, then use "webdriver answer on visible prompt" instead.

<strong>arguments</strong>

- [answer](arguments.md#answer): The answer to give in response to the prompt pop-up.

<hr>

## `assert`

Check that a variable is an expected value. The variable's value will be converted to a string for comparison.

<strong>arguments</strong>

- [variable name](arguments.md#variablename): The name of a variable (without brackets). Used to either store 
    an expression's result in or reference for a check (e.g., with 'assert' or 
    'verify').

- [expected value](arguments.md#expectedvalue): The result you expect a variable to contain (e.g., true, false, 
    or some other value).

<hr>

## `assert alert`

Confirm that an alert has been rendered with the provided text.

<strong>arguments</strong>

- [alert text](arguments.md#alerttext): text to check

<hr>

## `assert checked`

Confirm that the target element has been checked.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `assert not checked`

Confirm that the target element has not been checked.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `assert confirmation`

Confirm that a confirmation has been rendered.

<hr>

## `assert editable`

Confirm that the target element is editable.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `assert not editable`

Confirm that the target element is not editable.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `assert element present`

Confirm that the target element is present somewhere on the page.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `assert element not present`

Confirm that the target element is not present anywhere on the page.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `assert prompt`

Confirm that a JavaScript prompt has been rendered.

<hr>

## `assert selected value`

Confirm that the value attribute of the selected option in a dropdown element contains the provided value.

<strong>arguments</strong>

- [select locator](arguments.md#selectlocator): An element locator identifying a drop-down menu.

- [text](arguments.md#text): An exact string match. Support for pattern matching is in the 
    works. See https://github.com/SeleniumHQ/selenium-ide/issues/141 for details.

<hr>

## `assert not selected value`

Confirm that the value attribute of the selected option in a dropdown element does not contain the provided value.

<strong>arguments</strong>

- [select locator](arguments.md#selectlocator): An element locator identifying a drop-down menu.

- [text](arguments.md#text): An exact string match. Support for pattern matching is in the 
    works. See https://github.com/SeleniumHQ/selenium-ide/issues/141 for details.

<hr>

## `assert selected label`

Confirm that the label of the selected option in a dropdown element contains the provided value.

<strong>arguments</strong>

- [select locator](arguments.md#selectlocator): An element locator identifying a drop-down menu.

- [text](arguments.md#text): An exact string match. Support for pattern matching is in the 
    works. See https://github.com/SeleniumHQ/selenium-ide/issues/141 for details.

<hr>

## `assert text`

Confirm that the text of an element contains the provided value.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [text](arguments.md#text): An exact string match. Support for pattern matching is in the 
    works. See https://github.com/SeleniumHQ/selenium-ide/issues/141 for details.

<hr>

## `assert not text`

Confirm that the text of an element does not contain the provided value.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [text](arguments.md#text): An exact string match. Support for pattern matching is in the 
    works. See https://github.com/SeleniumHQ/selenium-ide/issues/141 for details.

<hr>

## `assert title`

Confirm the title of the current page contains the provided text.

<strong>arguments</strong>

- [text](arguments.md#text): An exact string match. Support for pattern matching is in the 
    works. See https://github.com/SeleniumHQ/selenium-ide/issues/141 for details.

<hr>

## `assert value`

Confirm the (whitespace-trimmed) value of an input field (or anything else with a value parameter). For checkbox/radio elements, the value will be "on" or "off" depending on whether the element is checked or not.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [text](arguments.md#text): An exact string match. Support for pattern matching is in the 
    works. See https://github.com/SeleniumHQ/selenium-ide/issues/141 for details.

<hr>

## `check`

Check a toggle-button (checkbox/radio).

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `choose cancel on next confirmation`

Affects the next confirmation alert. This command will cancel it. If the alert is already present, then use "webdriver choose cancel on visible confirmation" instead.

<hr>

## `choose cancel on next prompt`

Affects the next alert prompt. This command will cancel it. If the alert is already present, then use "webdriver choose cancel on visible prompt" instead.

<hr>

## `choose ok on next confirmation`

Affects the next confirmation alert. This command will accept it. If the alert is already present, then use "webdriver choose ok on visible confirmation" instead.

<hr>

## `click`

Clicks on a target element (e.g., a link, button, checkbox, or radio button).

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `click at`

Clicks on a target element (e.g., a link, button, checkbox, or radio button). The coordinates are relative to the target element (e.g., 0,0 is the top left corner of the element) and are mostly used to check effects that relay on them, for example the material ripple effect.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [coord string](arguments.md#coordstring): Specifies the x,y position (e.g., - 10,20) of the mouse event 
    relative to the element found from a locator.

<hr>

## `close`

Closes the current window. There is no need to close the initial window, IDE will re-use it; closing it may cause a performance penalty on the test.

<hr>

## `debugger`

Breaks the execution and enters debugger

<hr>

## `do`

Create a loop that executes the proceeding commands at least once. Terminate the branch with the repeat if command.

<hr>

## `double click`

Double clicks on an element (e.g., a link, button, checkbox, or radio button).

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `double click at`

Double clicks on a target element (e.g., a link, button, checkbox, or radio button). The coordinates are relative to the target element (e.g., 0,0 is the top left corner of the element) and are mostly used to check effects that relay on them, for example the material ripple effect.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [coord string](arguments.md#coordstring): Specifies the x,y position (e.g., - 10,20) of the mouse event 
    relative to the element found from a locator.

<hr>

## `drag and drop to object`

Drags an element and drops it on another element.

<strong>arguments</strong>

- [locator of object to be dragged](arguments.md#locatorofobjecttobedragged): The locator of element to be dragged.

- [locator of drag destination object](arguments.md#locatorofdragdestinationobject): The locator of an element whose location (e.g., the center-most 
    pixel within it) will be the point where locator of object to be dragged is 
    dropped.

<hr>

## `echo`

Prints the specified message into the third table cell in your Selenese tables. Useful for debugging.

<strong>arguments</strong>

- [message](arguments.md#message): undefined

<hr>

## `else`

Part of an if block. Execute the commands in this branch when an if and/or else if condition are not met. Terminate the branch with the end command.

<hr>

## `else if`

Part of an if block. Execute the commands in this branch when an if condition has not been met. Terminate the branch with the end command.

<strong>arguments</strong>

- [conditional expression](arguments.md#conditionalexpression): JavaScript expression that returns a boolean result for use 
    in control flow commands.

<hr>

## `end`

Terminates a control flow block for if, while, and times.

<hr>

## `execute script`

Executes a snippet of JavaScript in the context of the currently selected frame or window. The script fragment will be executed as the body of an anonymous function. To store the return value, use the 'return' keyword and provide a variable name in the value input field.

<strong>arguments</strong>

- [script](arguments.md#script): The JavaScript snippet to run.

- [variable name](arguments.md#variablename): The name of a variable (without brackets). Used to either store 
    an expression's result in or reference for a check (e.g., with 'assert' or 
    'verify').

<hr>

## `execute async script`

Executes an async snippet of JavaScript in the context of the currently selected frame or window. The script fragment will be executed as the body of an anonymous function and must return a Promise. The Promise result will be saved on the variable if you use the 'return' keyword.

<strong>arguments</strong>

- [script](arguments.md#script): The JavaScript snippet to run.

- [variable name](arguments.md#variablename): The name of a variable (without brackets). Used to either store 
    an expression's result in or reference for a check (e.g., with 'assert' or 
    'verify').

<hr>

## `edit content`

Sets the value of a content editable element as if you typed in it.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [value](arguments.md#value): The value to type.

<hr>

## `if`

Create a conditional branch in your test. Terminate the branch with the end command.

<strong>arguments</strong>

- [conditional expression](arguments.md#conditionalexpression): JavaScript expression that returns a boolean result for use 
    in control flow commands.

<hr>

## `mouse down at`

Simulates a user pressing the left mouse button (without releasing it yet) at the specified location.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [coord string](arguments.md#coordstring): Specifies the x,y position (e.g., - 10,20) of the mouse event 
    relative to the element found from a locator.

<hr>

## `mouse move at`

Simulates a user pressing the mouse button (without releasing it yet) on the specified element.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [coord string](arguments.md#coordstring): Specifies the x,y position (e.g., - 10,20) of the mouse event 
    relative to the element found from a locator.

<hr>

## `mouse out`

Simulates a user moving the mouse pointer away from the specified element.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `mouse over`

Simulates a user hovering a mouse over the specified element.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `mouse up at`

Simulates the event that occurs when the user releases the mouse button (e.g., stops holding the button down) at the specified location.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [coord string](arguments.md#coordstring): Specifies the x,y position (e.g., - 10,20) of the mouse event 
    relative to the element found from a locator.

<hr>

## `open`

Opens a URL and waits for the page to load before proceeding. This accepts both relative and absolute URLs.

<strong>arguments</strong>

- [url](arguments.md#url): The URL to open (may be relative or absolute).

<hr>

## `pause`

Wait for the specified amount of time.

<strong>arguments</strong>

- [wait time](arguments.md#waittime): The amount of time to wait (in milliseconds).

<hr>

## `remove selection`

Remove a selection from the set of selected options in a multi-select element using an option locator.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [option](arguments.md#option): An option locator, typically just an option label (e.g. "John Smith").

<hr>

## `repeat if`

Terminate a 'do' control flow branch conditionally. If the result of the provided conditional expression is true, it starts the do loop over. Otherwise it ends the loop.

<strong>arguments</strong>

- [conditional expression](arguments.md#conditionalexpression): JavaScript expression that returns a boolean result for use 
    in control flow commands.

<hr>

## `run`

Runs a test case from the current project.

<strong>arguments</strong>

- [test case](arguments.md#testcase): Test case name from the project.

<hr>

## `run script`

Creates a new "script" tag in the body of the current test window, and adds the specified text into the body of the command. Beware that JS exceptions thrown in these script tags aren't managed by Selenium, so you should probably wrap your script in try/catch blocks if there is any chance that the script will throw an exception.

<strong>arguments</strong>

- [script](arguments.md#script): The JavaScript snippet to run.

<hr>

## `select`

Select an element from a drop-down menu using an option locator. Option locators provide different ways of specifying a select element (e.g., label=, value=, id=, index=). If no option locator prefix is provided, a match on the label will be attempted.

<strong>arguments</strong>

- [select locator](arguments.md#selectlocator): An element locator identifying a drop-down menu.

- [option](arguments.md#option): An option locator, typically just an option label (e.g. "John Smith").

<hr>

## `select frame`

Selects a frame within the current window. You may invoke this command multiple times to select a nested frame. NOTE: To select the parent frame, use "relative=parent" as a locator. To select the top frame, use "relative=top". You can also select a frame by its 0-based index number (e.g., select the first frame with "index=0", or the third frame with "index=2").

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `select window`

Selects a popup window using a window locator. Once a popup window has been selected, all commands will go to that window. Window locators use handles to select windows.

<strong>arguments</strong>

- [window handle](arguments.md#windowhandle): A handle representing a specific page (tab, or window).

<hr>

## `send keys`

Simulates keystroke events on the specified element, as though you typed the value key-by-key. This simulates a real user typing every character in the specified string; it is also bound by the limitations of a real user, like not being able to type into a invisible or read only elements. This is useful for dynamic UI widgets (like auto-completing combo boxes) that require explicit key events. Unlike the simple "type" command, which forces the specified value into the page directly, this command will not replace the existing content.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [key sequence](arguments.md#keysequence): A sequence of keys to type, can be used to send key strokes (e.g. ${KEY_ENTER}).

<hr>

## `set speed`

Set execution speed (e.g., set the millisecond length of a delay which will follow each Selenium operation). By default, there is no such delay, e.g., the delay is 0 milliseconds. This setting is global, and will affect all test runs, until changed.

<strong>arguments</strong>

- [wait time](arguments.md#waittime): The amount of time to wait (in milliseconds).

<hr>

## `set window size`

Set the browser's window size, including the browser's interface.

<strong>arguments</strong>

- [resolution](arguments.md#resolution): Specify a window resolution using WidthxHeight. (e.g., 1280x800).

<hr>

## `store`

Save a target string as a variable for easy re-use.

<strong>arguments</strong>

- [text](arguments.md#text): The text to verify.

- [variable name](arguments.md#variablename): The name of a variable (without brackets). Used to either store 
    an expression's result in or reference for a check (e.g., with 'assert' or 
    'verify').

<hr>

## `store attribute`

Gets the value of an element attribute. The value of the attribute may differ across browsers (this is the case for the "style" attribute, for example).

<strong>arguments</strong>

- [attribute locator](arguments.md#attributelocator): An element locator followed by an @ sign and then the name of 
    the attribute, e.g. "foo@bar".

- [variable name](arguments.md#variablename): The name of a variable (without brackets). Used to either store 
    an expression's result in or reference for a check (e.g., with 'assert' or 
    'verify').

<hr>

## `store text`

Gets the text of an element and stores it for later use. This works for any element that contains text.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [variable name](arguments.md#variablename): The name of a variable (without brackets). Used to either store 
    an expression's result in or reference for a check (e.g., with 'assert' or 
    'verify').

<hr>

## `store value`

Gets the value of element and stores it for later use. This works for any input type element.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [variable name](arguments.md#variablename): The name of a variable (without brackets). Used to either store 
    an expression's result in or reference for a check (e.g., with 'assert' or 
    'verify').

<hr>

## `store title`

Gets the title of the current page.

<hr>

## `store window handle`

Gets the handle of the current page.

<strong>arguments</strong>

- [window handle](arguments.md#windowhandle): A handle representing a specific page (tab, or window).

<hr>

## `store xpath count`

Gets the number of nodes that match the specified xpath (e.g. "//table" would give the number of tables).

<strong>arguments</strong>

- [xpath](arguments.md#xpath): The xpath expression to evaluate.

- [variable name](arguments.md#variablename): The name of a variable (without brackets). Used to either store 
    an expression's result in or reference for a check (e.g., with 'assert' or 
    'verify').

<hr>

## `submit`

Submit the specified form. This is particularly useful for forms without submit buttons, e.g. single-input "Search" forms.

<strong>arguments</strong>

- [form locator](arguments.md#formlocator): An element locator for the form you want to submit.

<hr>

## `times`

Create a loop that executes the proceeding commands n number of times.

<strong>arguments</strong>

- [times](arguments.md#times): The number of attempts a times control flow loop will execute 
    the commands within its block.

<hr>

## `type`

Sets the value of an input field, as though you typed it in. Can also be used to set the value of combo boxes, check boxes, etc. In these cases, value should be the value of the option selected, not the visible text. Chrome only: If a file path is given it will be uploaded to the input (for type=file), NOTE: XPath locators are not supported.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [value](arguments.md#value): The value to type.

<hr>

## `uncheck`

Uncheck a toggle-button (checkbox/radio).

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `verify`

Soft assert that a variable is an expected value. The variable's value will be converted to a string for comparison.

<strong>arguments</strong>

- [variable name](arguments.md#variablename): The name of a variable (without brackets). Used to either store 
    an expression's result in or reference for a check (e.g., with 'assert' or 
    'verify').

- [expected value](arguments.md#expectedvalue): The result you expect a variable to contain (e.g., true, false, 
    or some other value).

<hr>

## `verify checked`

Soft assert that a toggle-button (checkbox/radio) has been checked.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `verify not checked`

Soft assert that a toggle-button (checkbox/radio) has not been checked.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `verify editable`

Soft assert whether the specified input element is editable (e.g., hasn't been disabled).

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `verify not editable`

Soft assert whether the specified input element is not editable (e.g., hasn't been disabled).

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `verify element present`

Soft assert that the specified element is somewhere on the page.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `verify element not present`

Soft assert that the specified element is not somewhere on the page.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

<hr>

## `verify selected value`

Soft assert that the expected element has been chosen in a select menu by its option attribute.

<strong>arguments</strong>

- [select locator](arguments.md#selectlocator): An element locator identifying a drop-down menu.

<hr>

## `verify not selected value`

Soft assert that the expected element has not been chosen in a select menu by its option attribute.

<strong>arguments</strong>

- [select locator](arguments.md#selectlocator): An element locator identifying a drop-down menu.

<hr>

## `verify text`

Soft assert the text of an element is present.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [text](arguments.md#text): The text to verify.

<hr>

## `verify not text`

Soft assert the text of an element is not present.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [text](arguments.md#text): The text to verify.

<hr>

## `verify title`

Soft assert the title of the current page contains the provided text.

<strong>arguments</strong>

- [text](arguments.md#text): The text to verify.

<hr>

## `verify value`

Soft assert the (whitespace-trimmed) value of an input field (or anything else with a value parameter). For checkbox/radio elements, the value will be "on" or "off" depending on whether the element is checked or not.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [text](arguments.md#text): An exact string match. Support for pattern matching is in the 
    works. See https://github.com/SeleniumHQ/selenium-ide/issues/141 for details.

<hr>

## `verify selected label`

Soft assert the visible text for a selected option in the specified select element.

<strong>arguments</strong>

- [select locator](arguments.md#selectlocator): An element locator identifying a drop-down menu.

- [text](arguments.md#text): An exact string match. Support for pattern matching is in the 
    works. See https://github.com/SeleniumHQ/selenium-ide/issues/141 for details.

<hr>

## `wait for element editable`

Wait for an element to be editable.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [wait time](arguments.md#waittime): The amount of time to wait (in milliseconds).

<hr>

## `wait for element not editable`

Wait for an element to not be editable.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [wait time](arguments.md#waittime): The amount of time to wait (in milliseconds).

<hr>

## `wait for element present`

Wait for a target element to be present on the page.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [wait time](arguments.md#waittime): The amount of time to wait (in milliseconds).

<hr>

## `wait for element not present`

Wait for a target element to not be present on the page.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [wait time](arguments.md#waittime): The amount of time to wait (in milliseconds).

<hr>

## `wait for element visible`

Wait for a target element to be visible on the page.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [wait time](arguments.md#waittime): The amount of time to wait (in milliseconds).

<hr>

## `wait for element not visible`

Wait for a target element to not be visible on the page.

<strong>arguments</strong>

- [locator](arguments.md#locator): An element locator.

- [wait time](arguments.md#waittime): The amount of time to wait (in milliseconds).

<hr>

## `webdriver answer on visible prompt`

Affects a currently showing alert prompt. This command instructs Selenium to provide the specified answer to it. If the alert has not appeared yet then use "answer on next prompt" instead.

<strong>arguments</strong>

- [answer](arguments.md#answer): The answer to give in response to the prompt pop-up.

<hr>

## `webdriver choose cancel on visible confirmation`

Affects a currently showing confirmation alert. This command instructs Selenium to cancel it. If the alert has not appeared yet then use "choose cancel on next confirmation" instead.

<hr>

## `webdriver choose cancel on visible prompt`

Affects a currently showing alert prompt. This command instructs Selenium to cancel it. If the alert has not appeared yet then use "choose cancel on next prompt" instead.

<hr>

## `webdriver choose ok on visible confirmation`

Affects a currently showing confirmation alert. This command instructs Selenium to accept it. If the alert has not appeared yet then use "choose ok on next confirmation" instead.

<hr>

## `while`

Create a loop that executes the proceeding commands repeatedly for as long as the provided conditional expression is true.

<strong>arguments</strong>

- [conditional expression](arguments.md#conditionalexpression): JavaScript expression that returns a boolean result for use 
    in control flow commands.

<hr>

