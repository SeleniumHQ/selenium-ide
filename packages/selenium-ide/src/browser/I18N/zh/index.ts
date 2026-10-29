import type { LanguageMap } from '../en/index'
import commandMap from '@seleniumhq/side-model/dist/I18N/zh/Commands'

// 窗口顶部菜单
const windowTab = {
  file: '&文件',
  edit: '&编辑',
  view: '&查看',
  help: '&帮助',
  title: '项目编辑器',
}
// Electron菜单
const electronMenuTree = {
  about: 'Electron信息',
  services: '服务信息',
  hideElectron: '隐藏Electron',
  hideOthers: '隐藏其他',
  showAll: '显示所有',
  quit: '退出',
}
// 文件菜单
const fileMenuTree = {
  newProject: '创建项目',
  loadProject: '导入项目',
  recentProjects: '最近使用项目',
  saveProject: '保存项目',
  saveProjectAs: '项目另存为...',
}
// 编辑菜单
const editMenuTree = {
  undo: '撤销 (针对输入)',
  redo: '恢复 (针对输入)',
  cut: '剪切 (针对输入)',
  copy: '复制 (针对输入)',
  paste: '粘贴 (针对输入)',
}

// 查看菜单
const viewMenuTree = {
  showDevTools: '开发者工具',
  resetPlaybackWindows: '重置回放窗口',
  refreshPlaybackWindow: '刷新回放窗口',
}

// 帮助菜单
const helpMenuTree = {
  dumpSession: '将Session转存到文件',
}

// 主页面菜单
const mainMenu = { tests: '用例', suites: '集合', config: '配置' }

// 配置tab
const configTab = {
  project: '项目配置',
  system: '系统配置',
  outPut: '导出配置',
}

// 导出配置页面
const outPutConfig = {
  webLink: '点击跳转至测试平台',
  platformUrl: '测试平台地址',
  platformUrlHelper: '用例最终展示在此前端页面',
  serviceHost: '后端服务地址',
  serviceHostHelper: '将用例导出到后端服务的地址',
  businessListUrl: '所属业务列表url地址',
  businessListUrlHelper: '用例所属的业务列表的url地址',
  caseInBusiness: '用例所属业务',
  caseInBusinessHelper: '测试用例将会归类到该业务下',
  exportUrl: '导出接口地址',
  exportUrlHelper: '用于导出用例的url地址',
  exportBtn: '导出',
  platformError: '请输入测试平台地址!',
  checkUrlError: '请输入后端服务地址和导出用例的url地址!',
  checkBusinessUrlError: '请检查后端服务地址和所属业务列表url地址否正确!',
  warn: '警告',
  success: '导出成功',
  fail: '导出失败',
  caseId: '导出的用例id:',
  failMessage: '请联系后台开发人员处理!',
}

// 系统配置页面
const systemConfig = {
  theme: '主题偏好',
  themeHelper: '需要重新启动才能生效',
  commandInsert: '新命令插入首选项',
  camelCase: '驼峰式大小写',
  ignoreErrors: '忽略证书/SSL错误',
  codeExport: '禁用代码导出兼容模式',
  bidi: '使用bidi模式',
  bidiHelper: 'Bidi设置（实验性质)',
  playbackBrowser: '选择回放浏览器',
  restartDriver: '重启 driver',
}

// 项目配置页面
const projectConfig = {
  name: '项目名称',
  stepTimeout: '步骤超时（毫秒）',
  stepTimeoutHelper: '如果花费的时间超过此设置,步骤将失败',
  stepDelay: '步骤延迟（毫秒）',
  stepDelayHelper: '每个步骤都会使用此设置暂停',
  projectPlugins: '项目插件',
}
// 集合Tab
const suitesTab = {
  testInSuite: '集合中的用例',
  dropTests: '放置用例到此处',
  AvailableTests: '可使用的用例列表',
  name: '集合名称',
  timeout: '超时时间（毫秒）',
  parallel: '并发执行',
  persistSession: '持久化会话',
  dialogTitle: '请指定新的集合名称',
  suiteName: '集合名称',
  cancel: '取消',
  create: '创建',
  deleteNotice: '确认删除集合 {name}?',
  tooltip: '双击修改名称,右键导出或者删除集合',
  notDeleteNotice: '只有一个集合时不允许删除!',
  noSuiteSelected: '没有集合被选中',
  playSuite: '回放集合',
  deleteSuite: '删除集合',
  exportSuite: '导出集合为',
}

// 用例Tab
const testsTab = {
  allTests: '[所有用例]',
  deleteNotice: '确认删除用例?',
  tooltip: '双击修改名称,右键导出或者删除集合',
  notDeleteNotice: '只有一个用例时不允许删除!',
  dialogTitle: '请指定新的用例名称',
  testName: '用例名称',
  cancel: '取消',
  create: '创建',
  noTestSelected: '没有用例被选中',
  noCommandsSelected: '没有指令被选中',
  add: '添加',
  remove: '删除',
  deleteTest: '删除用例',
  exportTest: '导出用例为',
}

// 选择项目页面
const splash = {
  present: '欢迎使用Selenium IDE桌面版',
  logPath: '您的日志文件路径:',
  openNotice: '您可以加载或者创建项目',
  openRecent: '或者打开最近使用的项目',
  loadProject: '导入项目',
  createProject: '新建项目',
  recentOpen: '最近打开:',
  languageSelect: '选择语言',
}

// 用例回放页面
const playback = {
  content: '非bidi模式下,用例的录制和回放将会展示在这里',
  windowSize: '强制窗口尺寸（如果大于面板则缩小，如果小于面板则裁剪）',
  width: '宽度',
  height: '高度',
  url: '录制地址',
}

// 用例编辑页面
const testCore = {
  play: '回放',
  stop: '停止',
  record: '录制',
  pause: '暂停',
  removeCommand: '删除指令',
  addCommand: '添加指令',
  stepCommand: '指令',
  openNewWindow: '打开一个新窗口',
  notOpenNewWindow: '不打开新窗口',
  enableCommand: '启用当前指令',
  disableCommand: '禁用当前指令',
  comment: '备注',
  target: '关键字',
  value: '指令值',
  windowHandleName: '窗口句柄名称',
  windowHandleNameNote: '要设置为新窗口句柄的变量名称',
  windowTimeout: '窗口超时',
  windowTimeoutNote: '等待窗口打开的时间量（以毫秒为单位）',
  commands: '指令集',
  tabCommand: '指令',
  tabTarget: '关键字',
  tabValue: '指令值',
  cutCommand: '剪切指令',
  copyCommand: '复制指令',
  pasteCommand: '粘贴指令',
  disableCommandSide: '禁用指令',
  deleteCommand: '删除指令',
  appendCommand: '追加指令',
  insertCommand: '插入指令',
  recordFromHere: '从此处录制',
  playToHere: '回放到此处',
  playFromHere: '从此处回放',
  playThisStep: '回放此步骤',
  playFromStart: '从头开始回放',
}

export const language: LanguageMap = {
  windowTab,
  electronMenuTree,
  fileMenuTree,
  editMenuTree,
  viewMenuTree,
  helpMenuTree,
  mainMenu,
  testsTab,
  suitesTab,
  configTab,
  systemConfig,
  projectConfig,
  outPutConfig,
  splash,
  playback,
  testCore,
  commandMap,
}

export default language
