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
    id: 'verifyText',
    title: 'Verify Text',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
  })
  browser.contextMenus.create({
    id: 'verifyTitle',
    title: 'Verify Title',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
  })
  browser.contextMenus.create({
    id: 'assertText',
    title: 'Assert Text',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
  })
  browser.contextMenus.create({
    id: 'assertTitle',
    title: 'Assert Title',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
  })
  browser.contextMenus.create({
    id: 'storeText',
    title: 'Store Text',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
  })
  browser.contextMenus.create({
    id: 'storeTitle',
    title: 'Store Title',
    documentUrlPatterns: ['<all_urls>'],
    contexts: ['all'],
  })
}

function destroyContextMenus() {
  browser.contextMenus.removeAll()
}
