export const ArgTypes = {
  alertText: {
    name: 'alert text',
    description: 'text to check',
  },
  answer: {
    name: 'answer',
    description: 'The answer to give in response to the prompt pop-up.',
  },
  attributeLocator: {
    name: 'attribute locator',
    description: `An element locator followed by an @ sign and then the name of 
    the attribute, e.g. "foo@bar".`,
  },
  conditionalExpression: {
    name: 'conditional expression',
    description: `JavaScript expression that returns a boolean result for use 
    in control flow commands.`,
  },
  coord: {
    name: 'coord string',
    description: `Specifies the x,y position (e.g., - 10,20) of the mouse event 
    relative to the element found from a locator.`,
  },
  expectedValue: {
    name: 'expected value',
    description: `The result you expect a variable to contain (e.g., true, false, 
    or some other value).`,
  },
  expression: {
    name: 'expression',
    description: "The value you'd like to store.",
  },
  formLocator: {
    name: 'form locator',
    description: `An element locator for the form you want to submit.`,
  },
  handle: {
    name: 'window handle',
    description: `A handle representing a specific page (tab, or window).`,
  },
  keySequence: {
    name: 'key sequence',
    description:
      'A sequence of keys to type, can be used to send key strokes (e.g. ${KEY_ENTER}).',
  },
  locator: {
    name: 'locator',
    description: 'An element locator.',
  },
  locatorOfDragDestinationObject: {
    name: 'locator of drag destination object',
    description: `The locator of an element whose location (e.g., the center-most 
    pixel within it) will be the point where locator of object to be dragged is 
    dropped.`,
  },
  locatorOfObjectToBeDragged: {
    name: 'locator of object to be dragged',
    description: 'The locator of element to be dragged.',
  },
  loopLimit: {
    name: 'loop limit',
    description: `Maximum number of times a looping control flow command can execute to protect against infinite loops.`,
  },
  message: {
    name: 'message',
    value: 'The message to print.',
  },
  optionLocator: {
    name: 'option',
    description:
      'An option locator, typically just an option label (e.g. "John Smith").',
  },
  pattern: {
    name: 'text',
    description: `An exact string match. Support for pattern matching is in the 
    works. See https://github.com/SeleniumHQ/selenium-ide/issues/141 for details.`,
  },
  region: {
    name: 'region',
    description: `Specify a rectangle with coordinates and lengths (e.g., "x: 257, 
    y: 300, width: 462, height: 280").`,
  },
  resolution: {
    name: 'resolution',
    description: `Specify a window resolution using WidthxHeight. (e.g., 1280x800).`,
  },
  script: {
    name: 'script',
    description: 'The JavaScript snippet to run.',
  },
  selectLocator: {
    name: 'select locator',
    description: 'An element locator identifying a drop-down menu.',
  },
  testCase: {
    name: 'test case',
    description: 'Test case name from the project.',
  },
  text: {
    name: 'text',
    description: 'The text to verify.',
  },
  times: {
    name: 'times',
    description: `The number of attempts a times control flow loop will execute 
    the commands within its block.`,
  },
  url: {
    name: 'url',
    description: 'The URL to open (may be relative or absolute).',
  },
  value: {
    name: 'value',
    description: 'The value to type.',
  },
  variableName: {
    name: 'variable name',
    description: `The name of a variable (without brackets). Used to either store 
    an expression's result in or reference for a check (e.g., with 'assert' or 
    'verify').`,
  },
  waitTime: {
    name: 'wait time',
    description: 'The amount of time to wait (in milliseconds).',
  },
  xpath: {
    name: 'xpath',
    description: 'The xpath expression to evaluate.',
  },
}
