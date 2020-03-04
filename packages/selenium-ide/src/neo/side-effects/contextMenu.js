import browser from 'webextension-polyfill'
import { reaction } from 'mobx'
import UiState from '../stores/view/UiState'

reaction(
  () => UiState.isRecording,
  isRecording => {
    isRecording ? createContextMenus() : destroyContextMenus()
  }
)

function createContextMenus() {
  browser.contextMenus.create({
    id: 'mouseOver',
    title: 'Mouse Over',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
  })
  browser.contextMenus.create({
    type: 'separator',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
  })
  browser.contextMenus.create({
    id: 'assert',
    title: 'Assert',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
  })
  browser.contextMenus.create({
    id: 'assertChecked',
    title: 'Checked',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'assert',
  })
  browser.contextMenus.create({
    id: 'assertEditable',
    title: 'Editable',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'assert',
  })
  browser.contextMenus.create({
    id: 'assertNotChecked',
    title: 'Not Checked',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'assert',
  })
  browser.contextMenus.create({
    id: 'assertNotEditable',
    title: 'Not Editable',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'assert',
  })
  browser.contextMenus.create({
    id: 'assertElementNotPresent',
    title: 'Not Present',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'assert',
  })
  browser.contextMenus.create({
    id: 'assertNotSelectedValue',
    title: 'Not Selected Value',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'assert',
  })
  browser.contextMenus.create({
    id: 'assertNotText',
    title: 'Not Text',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'assert',
  })
  browser.contextMenus.create({
    id: 'assertElementPresent',
    title: 'Present',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'assert',
  })
  browser.contextMenus.create({
    id: 'assertSelectedLabel',
    title: 'Selected Label',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'assert',
  })
  browser.contextMenus.create({
    id: 'assertSelectedValue',
    title: 'Selected Value',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'assert',
  })
  browser.contextMenus.create({
    id: 'assertText',
    title: 'Text',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'assert',
  })
  browser.contextMenus.create({
    id: 'assertTitle',
    title: 'Title',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'assert',
  })
  browser.contextMenus.create({
    id: 'assertValue',
    title: 'Value',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'assert',
  })
  browser.contextMenus.create({
    id: 'store',
    title: 'Store',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
  })
  browser.contextMenus.create({
    id: 'storeText',
    title: 'Text',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'store',
  })
  browser.contextMenus.create({
    id: 'storeTitle',
    title: 'Title',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'store',
  })
  browser.contextMenus.create({
    id: 'storeValue',
    title: 'Value',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'store',
  })
  browser.contextMenus.create({
    id: 'verify',
    title: 'Verify',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
  })
  browser.contextMenus.create({
    id: 'verifyChecked',
    title: 'Checked',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'verify',
  })
  browser.contextMenus.create({
    id: 'verifyEditable',
    title: 'Editable',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'verify',
  })
  browser.contextMenus.create({
    id: 'verifyNotChecked',
    title: 'Not Checked',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'verify',
  })
  browser.contextMenus.create({
    id: 'verifyNotEditable',
    title: 'Not Editable',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'verify',
  })
  browser.contextMenus.create({
    id: 'verifyElementNotPresent',
    title: 'Not Present',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'verify',
  })
  browser.contextMenus.create({
    id: 'verifyNotSelectedValue',
    title: 'Not Selected Value',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'verify',
  })
  browser.contextMenus.create({
    id: 'verifyNotText',
    title: 'Not Text',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'verify',
  })
  browser.contextMenus.create({
    id: 'verifyElementPresent',
    title: 'Present',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'verify',
  })
  browser.contextMenus.create({
    id: 'verifySelectedLabel',
    title: 'Selected Label',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'verify',
  })
  browser.contextMenus.create({
    id: 'verifySelectedValue',
    title: 'Selected Value',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'verify',
  })
  browser.contextMenus.create({
    id: 'verifyText',
    title: 'Text',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'verify',
  })
  browser.contextMenus.create({
    id: 'verifyTitle',
    title: 'Title',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'verify',
  })
  browser.contextMenus.create({
    id: 'verifyValue',
    title: 'Value',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'verify',
  })
  browser.contextMenus.create({
    id: 'waitFor',
    title: 'Wait For',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
  })
  browser.contextMenus.create({
    id: 'waitForElementEditable',
    title: 'Editable',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'waitFor',
  })
  browser.contextMenus.create({
    id: 'waitForElementNotEditable',
    title: 'Not Editable',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'waitFor',
  })
  browser.contextMenus.create({
    id: 'waitForElementNotPresent',
    title: 'Not Present',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'waitFor',
  })
  browser.contextMenus.create({
    id: 'waitForElementNotVisible',
    title: 'Not Visible',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'waitFor',
  })
  browser.contextMenus.create({
    id: 'waitForElementPresent',
    title: 'Present',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'waitFor',
  })
  browser.contextMenus.create({
    id: 'waitForElementVisible',
    title: 'Visible',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'waitFor',
  })
  browser.contextMenus.create({
    id: 'waitForText',
    title: 'Text',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
    parentId: 'waitFor',
  })
}

function destroyContextMenus() {
  browser.contextMenus.removeAll()
}
