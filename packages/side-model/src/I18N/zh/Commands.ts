import Commands from '../../Commands'

const commands: typeof Commands = {
  acceptAlert: {
    name: 'accept alert',
    description: '影响当前显示的Alert。此命令指示Selenium接受它。',
  },
  acceptConfirmation: {
    name: 'accept confirmation',
    description: '影响当前显示的Confirmation。此命令指示Selenium接受它。',
  },
  addSelection: {
    name: 'add selection',
    description: '将所选内容添加到多选元素中的选项集中。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  answerPrompt: {
    name: 'answer prompt',
    description: '影响当前显示的Prompt。此命令指示Selenium为其提供指定的响应。',
    target: {
      name: 'answer',
      isOptional: true,
      description: '弹出提示给出的响应',
    },
  },
  assert: {
    name: 'assert',
    description:
      '检查变量是否为期望值。变量的值将被转换为字符串进行比较。如果断言失败，测试将停止。',
    target: {
      name: 'variable name',
      description:
        '变量的名称（不带括号）。用于将表达式的结果存储在或引用中以进行检查（例如，使用“assert”或“verify”）',
    },
    value: {
      name: 'expected value',
      description: '您期望变量包含的结果（例如，true、false或其他值）',
    },
  },
  assertAlert: {
    name: 'assert alert',
    description: '确认已使用提供的文本呈现Alert。如果断言失败，测试将停止。',
    target: {
      name: 'alert text',
      description: '要检查的文本',
    },
  },
  assertChecked: {
    name: 'assert checked',
    description: '确认确认目标元素状态为Checked。如果断言失败，测试将停止。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  assertConfirmation: {
    name: 'assert confirmation',
    description: '确认已进行确认。如果断言失败，测试将停止。',
    target: {
      name: 'alert text',
      description: '要检查的文本',
    },
  },
  assertEditable: {
    name: 'assert editable',
    description: '确认目标元素是可编辑的。如果断言失败，测试将停止。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  assertElementPresent: {
    name: 'assert element present',
    description: '确认目标元素存在于页面的某个位置。如果断言失败，测试将停止。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  assertElementNotPresent: {
    name: 'assert element not present',
    description:
      '确认目标元素不存在于页面上的任何位置。如果断言失败，测试将停止。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  assertNotChecked: {
    name: 'assert not checked',
    description: '确认目标元素状态为NotChecked。如果断言失败，测试将停止。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  assertNotEditable: {
    name: 'assert not editable',
    description: '确认目标元素不可编辑。如果断言失败，测试将停止。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  assertNotSelectedValue: {
    name: 'assert not selected value',
    description:
      '确认下拉元素中所选选项的值属性不包含所提供的值。如果断言失败，测试将停止。',
    target: {
      name: 'select locator',
      description: '标识下拉菜单的元素定位器',
    },
    value: {
      name: 'text',
      isOptional: true,
      description:
        '完全匹配的字符串。对模式匹配的支持正在进行中。请前往https://github.com/SeleniumHQ/selenium-ide/issues/141了解详细信息',
    },
  },
  assertNotText: {
    name: 'assert not text',
    description: '确认元素的文本不包含提供的值。如果断言失败，测试将停止。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'text',
      isOptional: true,
      description:
        '完全匹配的字符串。对模式匹配的支持正在进行中。请前往https://github.com/SeleniumHQ/selenium-ide/issues/141了解详细信息',
    },
  },
  assertPrompt: {
    name: 'assert prompt',
    description: '确认已呈现JavaScript提示。如果断言失败，测试将停止。',
    target: {
      name: 'alert text',
      description: '要检查的文本',
    },
  },
  assertSelectedValue: {
    name: 'assert selected value',
    description:
      '确认下拉元素中所选选项的值属性包含所提供的值。如果断言失败，测试将停止。',
    target: {
      name: 'select locator',
      description: '标识下拉菜单的元素定位器',
    },
    value: {
      name: 'text',
      isOptional: true,
      description:
        '完全匹配的字符串。对模式匹配的支持正在进行中。请前往https://github.com/SeleniumHQ/selenium-ide/issues/141了解详细信息',
    },
  },
  assertSelectedLabel: {
    name: 'assert selected label',
    description:
      '确认下拉元素中所选选项的标签包含所提供的值。如果断言失败，测试将停止。',
    target: {
      name: 'select locator',
      description: '标识下拉菜单的元素定位器',
    },
    value: {
      name: 'text',
      isOptional: true,
      description:
        '完全匹配的字符串。对模式匹配的支持正在进行中。请前往https://github.com/SeleniumHQ/selenium-ide/issues/141了解详细信息',
    },
  },
  assertText: {
    name: 'assert text',
    description: '确认元素的文本包含提供的值。如果断言失败，测试将停止。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'text',
      isOptional: true,
      description:
        '完全匹配的字符串。对模式匹配的支持正在进行中。请前往https://github.com/SeleniumHQ/selenium-ide/issues/141了解详细信息',
    },
  },
  assertTitle: {
    name: 'assert title',
    description:
      '确认当前页面的标题包含所提供的文本。如果断言失败，测试将停止。',
    target: {
      name: 'text',
      isOptional: true,
      description:
        '完全匹配的字符串。对模式匹配的支持正在进行中。请前往https://github.com/SeleniumHQ/selenium-ide/issues/141了解详细信息',
    },
  },
  assertValue: {
    name: 'assert value',
    description:
      '确认输入字段（或其他具有值参数的字段）的值。对于复选框/单选元素，值将为“on”或“off”，具体取决于是否选中该元素。如果断言失败，测试将停止。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'text',
      isOptional: true,
      description:
        '完全匹配的字符串。对模式匹配的支持正在进行中。请前往https://github.com/SeleniumHQ/selenium-ide/issues/141了解详细信息',
    },
  },
  dismissConfirmation: {
    name: 'dismiss confirmation',
    description: '影响当前显示的Confirmation。此命令指示Selenium取消它。',
  },
  dismissPrompt: {
    name: 'dismiss prompt',
    description: '影响当前显示的Prompt。此命令指示Selenium将其取消。',
  },
  check: {
    name: 'check',
    description: '选中切换按钮（复选框/单选框）。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  click: {
    name: 'click',
    description: '单击目标元素（例如，链接、按钮、复选框或单选按钮）。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  clickAt: {
    name: 'click at',
    description:
      '单击目标元素（例如，链接、按钮、复选框或单选按钮）。坐标是相对于目标元素的（例如，0,0是元素的左上角），主要用于检查传递到它们的效果，例如材material ripple效果。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'coord string',
      description:
        '指定鼠标事件相对于从定位器中找到的元素的x，y位置（例如-10,20）',
    },
  },
  close: {
    name: 'close',
    description:
      '关闭当前窗口。没有必要关闭初始窗口，IDE将重新使用它；关闭它可能会对测试造成性能损失。',
  },
  debugger: {
    name: 'debugger',
    description: '中断执行并进入调试器',
  },
  do: {
    name: 'do',
    description:
      '创建一个至少执行一次正在进行的命令的循环。使用repeat-if命令终止分支。',
  },
  doubleClick: {
    name: 'double click',
    description: '双击某个元素（例如，链接、按钮、复选框或单选按钮）。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  doubleClickAt: {
    name: 'double click at',
    description:
      '双击目标元素（例如，链接、按钮、复选框或单选按钮）。坐标是相对于目标元素的（例如，0,0是元素的左上角），主要用于检查传递到它们上的效果，例如material ripple效果。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'coord string',
      description:
        '指定鼠标事件相对于从定位器中找到的元素的x，y位置（例如-10,20）',
    },
  },
  dragAndDropToObject: {
    name: 'drag and drop to object',
    description: '拖动一个元素并将其放置在另一个元素上。',
    target: {
      name: 'locator of object to be dragged',
      description: '要拖动元素的定位器',
    },
    value: {
      name: 'locator of drag destination object',
      description:
        '元素的定位器，其位置（例如，其中最中心的像素）将是放置要拖动对象的定位器的点',
    },
  },
  echo: {
    name: 'echo',
    description: '打印指定的消息。对调试很有帮助',
    target: {
      name: 'message',
      description: '要打印的消息',
    },
  },
  editContent: {
    name: 'edit content',
    description: '将内容可编辑元素的值设置为键入的值。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'value',
      description: '要键入的值',
    },
  },
  else: {
    name: 'else',
    description:
      'if块的一部分。当不满足if和/或else-if条件时，执行此分支中的命令。使用end命令终止分支。',
  },
  elseIf: {
    name: 'else if',
    description:
      'if块的一部分。如果不满足if条件，则执行此分支中的命令。使用end命令终止分支。',
    target: {
      name: 'conditional expression',
      description: '返回布尔结果以用于控制流命令的JavaScript表达式',
    },
  },
  end: {
    name: 'end',
    description: '终止if、while和times的控制流块。',
  },
  executeScript: {
    name: 'execute script',
    description:
      '在当前所选帧或窗口的上下文中执行JavaScript片段。脚本片段将作为匿名函数的主体执行。若要存储返回值，请使用“return”关键字并在值输入字段中提供变量名。',
    target: {
      name: 'script',
      description: '要运行的JavaScript代码片段',
    },
    value: {
      name: 'variable name',
      isOptional: true,
      description:
        '变量的名称（不带括号）。用于将表达式的结果存储在或引用中以进行检查（例如，使用“assert”或“verify”）',
    },
  },
  executeAsyncScript: {
    name: 'execute async script',
    description:
      '在当前所选帧或窗口的上下文中执行异步JavaScript片段。脚本片段将作为匿名函数的主体执行，并且必须返回Promise。如果使用“return”关键字，Promise结果将保存在变量上。',
    target: {
      name: 'script',
      description: '要运行的JavaScript代码片段',
    },
    value: {
      name: 'variable name',
      isOptional: true,
      description:
        '变量的名称（不带括号）。用于将表达式的结果存储在或引用中以进行检查（例如，使用“assert”或“verify”）',
    },
  },
  forEach: {
    name: 'for each',
    description: '创建一个循环，为给定集合中的每个项执行后续命令。',
    target: {
      name: 'array variable name',
      description: '包含JavaScript数组的变量名称',
    },
    value: {
      name: 'iterator variable name',
      description:
        '在循环控制流命令中迭代集合时使用的变量的名称（例如:for each）',
    },
  },
  if: {
    name: 'if',
    description: '在测试中创建一个条件分支。使用end命令终止分支。',
    target: {
      name: 'conditional expression',
      description: '返回布尔结果以用于控制流命令的JavaScript表达式',
    },
  },
  mouseDown: {
    name: 'mouse down',
    description: '模拟用户按下鼠标左键（尚未释放）。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  mouseDownAt: {
    name: 'mouse down at',
    description: '模拟用户在指定位置按下鼠标左键（尚未释放）。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'coord string',
      description:
        '指定鼠标事件相对于从定位器中找到的元素的x，y位置（例如-10,20）',
    },
  },
  mouseMoveAt: {
    name: 'mouse move at',
    description: '模拟用户在指定元素上按下鼠标按钮（尚未释放）。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'coord string',
      description:
        '指定鼠标事件相对于从定位器中找到的元素的x，y位置（例如-10,20）',
    },
  },
  mouseOut: {
    name: 'mouse out',
    description: '模拟用户将鼠标指针从指定元素移开。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  mouseOver: {
    name: 'mouse over',
    description: '模拟用户将鼠标悬停在指定元素上。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  mouseUp: {
    name: 'mouse up',
    description: '模拟用户释放鼠标按钮时发生的事件（例如，停止按住按钮）。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  mouseUpAt: {
    name: 'mouse up at',
    description:
      '模拟用户在指定位置释放鼠标按钮（例如，停止按住按钮）时发生的事件。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'coord string',
      description:
        '指定鼠标事件相对于从定位器中找到的元素的x，y位置（例如-10,20）',
    },
  },
  open: {
    name: 'open',
    description: '打开一个URL，等待页面加载后再继续。接受相对路径和绝对路径。',
    target: {
      name: 'url',
      description: '要打开的URL（可以是相对路径或绝对路径）',
    },
  },
  pause: {
    name: 'pause',
    description: '等待指定的时间。',
    target: {
      name: 'wait time',
      description: '等待的时间（以毫秒为单位）',
    },
  },
  removeSelection: {
    name: 'remove selection',
    description: '使用选项定位器从多选元素中的所选选项集中删除所选内容。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'option',
      description: '选项定位器，通常只是一个选项标签（例如“John Smith”）',
    },
  },
  repeatIf: {
    name: 'repeat if',
    description:
      '有条件地终止“do”控制流分支。如果所提供的条件表达式的结果为true，则会重新启动do循环。否则，它将结束循环。',
    target: {
      name: 'conditional expression',
      description: '返回布尔结果以用于控制流命令的JavaScript表达式',
    },
    value: {
      name: 'loop limit',
      isOptional: true,
      description: '为防止无限循环，循环控制流命令可以执行的最大次数',
    },
  },
  run: {
    name: 'run',
    description: '从当前项目运行测试用例。',
    target: {
      name: 'test case',
      description: '项目中的测试用例名称',
    },
  },
  runScript: {
    name: 'run script',
    description:
      '在当前测试窗口的正文中创建一个新的“script”标记，并将指定的文本添加到命令正文中。请注意，这些脚本标记中抛出的JS异常不是由Selenium管理的，因此，如果脚本有可能抛出异常，您可能应该将脚本包装在try/catch块中。',
    target: {
      name: 'script',
      description: '要运行的JavaScript代码片段',
    },
  },
  select: {
    name: 'select',
    description:
      '使用选项定位器从下拉菜单中选择一个元素。选项定位器提供了指定select元素的不同方式（例如，label=、value=、id=、index=）。如果没有提供选项定位器前缀，将尝试在标签上进行匹配。',
    target: {
      name: 'select locator',
      description: '标识下拉菜单的元素定位器',
    },
    value: {
      name: 'option',
      description: '选项定位器，通常只是一个选项标签（例如“John Smith”）',
    },
  },
  selectFrame: {
    name: 'select frame',
    description:
      '在当前窗口中选择一个frame。您可以多次调用此命令来选择嵌套frame。注意：要选择父frame，请使用“relative=parent”作为定位器。要选择顶部frame，请使用“relative=top”。您也可以按索引编号0选择一个frame（例如，选择第一个“index=0”的frame，或选择第三个“index=2”的frame）。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  selectWindow: {
    name: 'select window',
    description:
      '使用窗口定位器选择弹出窗口。一旦选择了弹出窗口，所有命令都将转到该窗口。窗口定位器使用控制句柄来选择窗口。',
    target: {
      name: 'window handle',
      description: '表示特定页面（tab或window）的句柄',
    },
  },
  sendKeys: {
    name: 'send keys',
    description:
      '模拟指定元素上的击键事件，就像您逐键键入值一样。这模拟真实用户键入指定字符串中的每个字符；它还受到真实用户的限制，例如无法键入不可见的或只读的元素。这对于需要显式键事件的动态UI小部件（如自动完成组合框）非常有用。与简单的“type”命令不同，该命令将强制指定值直接进入页面，该命令不会替换现有内容。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'key sequence',
      description:
        '一系列要键入的按键操作，可用于发送点击按键（例如 ${KEY_ENTER}）',
    },
  },
  setSpeed: {
    name: 'set speed',
    description:
      '设置执行速度（例如，设置每个Selenium操作之后的延迟的毫秒长度）。默认情况下，没有此类延迟，例如，延迟为0毫秒。此设置是全局设置，在更改之前将影响所有测试运行。',
    target: {
      name: 'wait time',
      description: '等待的时间（以毫秒为单位）',
    },
  },
  setWindowSize: {
    name: 'set window size',
    description: '设置浏览器的窗口大小，包括浏览器的界面。',
    target: {
      name: 'resolution',
      description: '使用“宽度x高度”指定窗口分辨率。（例如，1280x800）',
    },
  },
  store: {
    name: 'store',
    description: '将目标字符串保存为变量以便于重复使用。',
    target: {
      name: 'text',
      description: '要验证的文本',
    },
    value: {
      name: 'variable name',
      description:
        '变量的名称（不带括号）。用于将表达式的结果存储在或引用中以进行检查（例如，使用“assert”或“verify”）',
    },
  },
  storeAttribute: {
    name: 'store attribute',
    description:
      '获取元素属性的值。属性的值可能因浏览器而异（例如，“style”属性）。',
    target: {
      name: 'attribute locator',
      description:
        '一个元素定位器，后跟一个@符号，然后是的名称\n属性，例如“foo@bar"',
    },
    value: {
      name: 'variable name',
      description:
        '变量的名称（不带括号）。用于将表达式的结果存储在或引用中以进行检查（例如，使用“assert”或“verify”）',
    },
  },
  storeElementCount: {
    name: 'store element count',
    description:
      '获取与指定定位器匹配的节点数（例如，xpath=//table将给出table的数量）。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'variable name',
      description:
        '变量的名称（不带括号）。用于将表达式的结果存储在或引用中以进行检查（例如，使用“assert”或“verify”）',
    },
  },
  storeJson: {
    name: 'store json',
    description: '将JSON保存在对象的变量上',
    target: {
      name: 'json',
      description: 'JavaScript对象的字符串表示',
    },
    value: {
      name: 'variable name',
      description:
        '变量的名称（不带括号）。用于将表达式的结果存储在或引用中以进行检查（例如，使用“assert”或“verify”）',
    },
  },
  storeText: {
    name: 'store text',
    description:
      '获取元素的文本并将其存储以供以后使用。这适用于任何包含文本的元素。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'variable name',
      description:
        '变量的名称（不带括号）。用于将表达式的结果存储在或引用中以进行检查（例如，使用“assert”或“verify”）',
    },
  },
  storeTitle: {
    name: 'store title',
    description: '获取当前页面的标题。',
    target: {
      name: 'variable name',
      description:
        '变量的名称（不带括号）。用于将表达式的结果存储在或引用中以进行检查（例如，使用“assert”或“verify”）',
    },
  },
  storeValue: {
    name: 'store value',
    description:
      '获取元素的值并将其存储以供以后使用。这适用于任何输入类型的元素。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'variable name',
      description:
        '变量的名称（不带括号）。用于将表达式的结果存储在或引用中以进行检查（例如，使用“assert”或“verify”）',
    },
  },
  storeWindowHandle: {
    name: 'store window handle',
    description: '获取当前页面的句柄。',
    target: {
      name: 'window handle',
      description: '表示特定页面（tab或window）的句柄',
    },
  },
  times: {
    name: 'times',
    description: '创建一个循环，该循环执行前面的命令n次。',
    target: {
      name: 'times',
      description: '控制流循环在其块内执行命令的尝试次数',
    },
    value: {
      name: 'loop limit',
      isOptional: true,
      description: '为防止无限循环，循环控制流命令可以执行的最大次数',
    },
  },
  type: {
    name: 'type',
    description:
      '设置输入字段的值，就像您键入的一样。也可以用于设置组合框、复选框等的值。在这些情况下，值应该是所选选项的值，而不是可见文本。仅限Chrome浏览器：如果给定文件路径，它将被上传到输入（对于type=file），注意：不支持XPath定位器。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'value',
      description: '要键入的值',
    },
  },
  uncheck: {
    name: 'uncheck',
    description: '取消选中切换按钮（复选框/单选）。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  verify: {
    name: 'verify',
    description:
      '软断言:变量是期望值。变量的值将被转换为字符串进行比较。即使验证失败，测试仍将继续。',
    target: {
      name: 'variable name',
      description:
        '变量的名称（不带括号）。用于将表达式的结果存储在或引用中以进行检查（例如，使用“assert”或“verify”）',
    },
    value: {
      name: 'expected value',
      description: '您期望变量包含的结果（例如，true、false或其他值）',
    },
  },
  verifyChecked: {
    name: 'verify checked',
    description:
      '软断言:切换按钮（复选框/单选框）已被选中。即使验证失败，测试仍将继续。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  verifyEditable: {
    name: 'verify editable',
    description:
      '软断言:指定的输入元素是否可编辑（例如，未禁用）。即使验证失败，测试仍将继续。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  verifyElementPresent: {
    name: 'verify element present',
    description:
      '软断言:指定的元素在页面上的某个位置。即使验证失败，测试仍将继续。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  verifyElementNotPresent: {
    name: 'verify element not present',
    description:
      '软断言:指定的元素不在页面上的某个位置。即使验证失败，测试仍将继续。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  verifyNotChecked: {
    name: 'verify not checked',
    description:
      '软断言:未选中切换按钮（复选框/单选框）。即使验证失败，测试仍将继续。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  verifyNotEditable: {
    name: 'verify not editable',
    description:
      '软断言:指定的输入元素是否不可编辑（例如，禁用）。即使验证失败，测试仍将继续。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
  },
  verifyNotSelectedValue: {
    name: 'verify not selected value',
    description:
      '软断言:所需的元素尚未在选择菜单中由其选项属性选择。即使验证失败，测试仍将继续。',
    target: {
      name: 'select locator',
      description: '标识下拉菜单的元素定位器',
    },
    value: {
      name: 'option',
      description: '选项定位器，通常只是一个选项标签（例如“John Smith”）',
    },
  },
  verifyNotText: {
    name: 'verify not text',
    description: '软断言:元素的文本不存在。即使验证失败，测试仍将继续。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'text',
      description: '要验证的文本',
    },
  },
  verifySelectedLabel: {
    name: 'verify selected label',
    description:
      '软断言:指定的select元素中所选选项的可见文本。即使验证失败，测试仍将继续。',
    target: {
      name: 'select locator',
      description: '标识下拉菜单的元素定位器',
    },
    value: {
      name: 'text',
      isOptional: true,
      description:
        '完全匹配的字符串。对模式匹配的支持正在进行中。请前往https://github.com/SeleniumHQ/selenium-ide/issues/141了解详细信息',
    },
  },
  verifySelectedValue: {
    name: 'verify selected value',
    description:
      '软断言:所需元素已在选择菜单中由其选项属性选择。即使验证失败，测试仍将继续。',
    target: {
      name: 'select locator',
      description: '标识下拉菜单的元素定位器',
    },
    value: {
      name: 'option',
      description: '选项定位器，通常只是一个选项标签（例如“John Smith”）',
    },
  },
  verifyText: {
    name: 'verify text',
    description: '软断言:元素的文本存在。即使验证失败，测试仍将继续。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'text',
      description: '要验证的文本',
    },
  },
  verifyTitle: {
    name: 'verify title',
    description:
      '软断言:当前页面的标题包含所提供的文本。即使验证失败，测试仍将继续。',
    target: {
      name: 'text',
      description: '要验证的文本',
    },
  },
  verifyValue: {
    name: 'verify value',
    description:
      "软断言:输入字段（或任何其他具有值参数的字段）的值（过滤了'空'）。对于checkbox/radio元素，值将为“on”或“off”，具体取决于是否选中该元素。即使验证失败，测试仍将继续。",
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'text',
      isOptional: true,
      description:
        '完全匹配的字符串。对模式匹配的支持正在进行中。请前往https://github.com/SeleniumHQ/selenium-ide/issues/141了解详细信息',
    },
  },
  waitForElementEditable: {
    name: 'wait for element editable',
    description: '等待元素可编辑。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'wait time',
      description: '等待的时间（以毫秒为单位）',
    },
  },
  waitForElementNotEditable: {
    name: 'wait for element not editable',
    description: '等待元素不可编辑。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'wait time',
      description: '等待的时间（以毫秒为单位）',
    },
  },
  waitForElementNotPresent: {
    name: 'wait for element not present',
    description: '等待页面上不存在目标元素。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'wait time',
      description: '等待的时间（以毫秒为单位）',
    },
  },
  waitForElementNotVisible: {
    name: 'wait for element not visible',
    description: '等待目标元素在页面上不可见。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'wait time',
      description: '等待的时间（以毫秒为单位）',
    },
  },
  waitForElementPresent: {
    name: 'wait for element present',
    description: '等待目标元素出现在页面上。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'wait time',
      description: '等待的时间（以毫秒为单位）',
    },
  },
  waitForElementVisible: {
    name: 'wait for element visible',
    description: '等待目标元素在页面上可见。',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'wait time',
      description: '等待的时间（以毫秒为单位）',
    },
  },
  waitForText: {
    name: 'wait for text',
    description: '等待元素的文本出现',
    target: {
      name: 'locator',
      description: '元素定位器',
    },
    value: {
      name: 'text',
      description: '要验证的文本',
    },
  },
  while: {
    name: 'while',
    description:
      '创建一个循环，只要提供的条件表达式为true，该循环就会重复执行前面的命令。',
    target: {
      name: 'conditional expression',
      description: '返回布尔结果以用于控制流命令的JavaScript表达式',
    },
    value: {
      name: 'loop limit',
      isOptional: true,
      description: '为防止无限循环，循环控制流命令可以执行的最大次数',
    },
  },
}

export default commands
