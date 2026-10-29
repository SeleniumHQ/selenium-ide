import { Commands as commandMap } from '@seleniumhq/side-model'

const windowTab = {
  file: '&File',
  edit: '&Edit',
  view: '&View',
  help: '&Help',
  title: 'Project Editor',
}

const electronMenuTree = {
  about: 'About Electron',
  services: 'Services',
  hideElectron: 'Hide Electron',
  hideOthers: 'Hide Others',
  showAll: 'Show All',
  quit: 'Quit',
}

const fileMenuTree = {
  newProject: 'New Project',
  loadProject: 'Load Project',
  recentProjects: 'Recent Projects',
  saveProject: 'Save Project',
  saveProjectAs: 'Save Project As...',
}

const editMenuTree = {
  undo: 'Undo (for input)',
  redo: 'Redo (for input)',
  cut: 'Cut (for input)',
  copy: 'Copy (for input)',
  paste: 'Paste (for input)',
}

const viewMenuTree = {
  showDevTools: 'Show DevTools',
  resetPlaybackWindows: 'Reset Playback Windows',
  refreshPlaybackWindow: 'Refresh Playback Window',
}

const helpMenuTree = {
  dumpSession: 'Dump Session To File',
}

const mainMenu = { tests: 'Tests', suites: 'Suites', config: 'Config' }

const configTab = {
  project: 'Project',
  system: 'System',
  outPut: 'outPut',
}

const outPutConfig = {
  webLink: 'click to jump to the testing platform',
  platformUrl: 'test platform address',
  platformUrlHelper: 'The final use case is displayed on this front-end page',
  serviceHost: 'backend service address',
  serviceHostHelper:
    'export the address of the use case to the backend service',
  businessListUrl: 'business list url address',
  businessListUrlHelper:
    'url address of the business list to which the use case belongs',
  caseInBusiness: 'business to which the use case belongs',
  caseInBusinessHelper: 'test cases will be classified under this business',
  exportUrl: 'export interface url address',
  exportUrlHelper: 'export the url address of the test case',
  exportBtn: 'export',
  platformError: 'please enter the testing platform address!',
  checkUrlError:
    'please enter the backend service address and the url address for exporting the test case!',
  checkBusinessUrlError:
    'please check if the backend service address and the corresponding business list URL address are correct!',
  warn: 'warn',
  success: 'export success',
  fail: 'export fail',
  caseId: 'exported test case id:',
  failMessage: 'please contact the backend developer for assistance!',
}

const systemConfig = {
  theme: 'Theme preference',
  themeHelper: 'restart required to take effect',
  commandInsert: 'New command insert preference',
  camelCase: 'Camel case various names in UI',
  ignoreErrors: 'Ignore Certificate/SSL errors',
  codeExport: 'Disable code export compatibility mode',
  bidi: 'Use Bidi',
  bidiHelper: 'Bidi settings (Experimental / Non working)',
  playbackBrowser: 'Selected Playback Browser',
  restartDriver: 'restart driver',
}

const projectConfig = {
  name: 'name',
  stepTimeout: 'Step Timeout (MILLISECONDS)',
  stepTimeoutHelper: 'Steps will fail if they take longer than this setting',
  stepDelay: 'Step Delay (MILLISECONDS)',
  stepDelayHelper: 'Each step will pause by this setting',
  projectPlugins: 'Project Plugins',
}

const suitesTab = {
  testInSuite: 'Tests in suite',
  dropTests: 'Drop Tests Here',
  AvailableTests: 'Available tests',
  name: 'Name',
  timeout: 'Timeout (MILLISECONDS)',
  parallel: 'Parallel',
  persistSession: 'Persist Session',
  dialogTitle: 'Please specify the new suite name',
  suiteName: 'Suite Name',
  cancel: 'Cancel',
  create: 'Create',
  deleteNotice: 'Are you sure you want to delete suite {name}?',
  tooltip:
    'Double click to modify the name.\nRight click to export or delete suites',
  notDeleteNotice: 'If only one suite is left, it is not allowed to be deleted',
  noSuiteSelected: 'No Suite Selected',
  playSuite: 'Play Suite',
  deleteSuite: 'Delete suite(s)',
  exportSuite: 'Export suite(s) to ',
}

const testsTab = {
  allTests: '[All tests]',
  deleteNotice: 'Delete this test?',
  tooltip:
    'Double click to modify the name,\nRight click to export or delete test case',
  notDeleteNotice: 'only one test case is not allowed to be deleted!',
  dialogTitle: 'Please specify the new test name',
  testName: 'Test Name',
  cancel: 'Cancel',
  create: 'Create',
  noTestSelected: 'No Test Selected',
  noCommandsSelected: 'No commands selected',
  add: 'Add',
  remove: 'Remove',
  deleteTest: 'Delete test(s)',
  exportTest: 'Export test(s) to ',
}

const playback = {
  content: 'This is where recording and playback will occur',
  windowSize:
    'Force panel window dimensions (will zoom out if larger than panel and crop if smaller)',
  width: 'W',
  height: 'H',
  url: 'URL',
}

const splash = {
  present: 'Welcome to the Selenium IDE client',
  logPath: 'Your log file path:',
  openNotice: 'You can load or create one project',
  loadProject: 'Load Project',
  createProject: 'Create Project',
  openRecent: 'Recent Projects',
  languageSelect: 'choose language',
}

// 用例编辑页面
const testCore = {
  play: 'Play',
  stop: 'Stop',
  record: 'Record',
  pause: 'Pause',
  removeCommand: 'Remove Command',
  addCommand: 'Add Command',
  stepCommand: 'Command',
  openNewWindow: 'Opens a new window',
  notOpenNewWindow: 'Does not open a new window',
  enableCommand: 'Enable this command',
  disableCommand: 'Disable this command',
  comment: 'Comment',
  target: 'Target',
  value: 'Value',
  windowHandleName: 'Window Handle Name',
  windowHandleNameNote: 'Variable name to set to the new window handle',
  windowTimeout: 'Window Timeout',
  windowTimeoutNote:
    'The amount of time to wait for the window to open (in milliseconds)',
  commands: 'Commands',
  tabCommand: 'Cmd',
  tabTarget: 'Target',
  tabValue: 'Value',
  cutCommand: 'Cut Command',
  copyCommand: 'Copy Command',
  pasteCommand: 'Paste Command',
  disableCommandSide: 'Disable Command',
  deleteCommand: 'Delete Command',
  appendCommand: 'Append Command',
  insertCommand: 'Insert Command',
  recordFromHere: 'Record From Here',
  playToHere: 'Play To Here',
  playFromHere: 'Play From Here',
  playThisStep: 'Play This Step',
  playFromStart: 'Play From Start',
}

export const language = {
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

// Creating a type of this so other locales are prompted to be filled in by
// the developer
export type LanguageMap = typeof language

export default language
