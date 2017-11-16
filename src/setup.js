/**
 * This file will put everything we need on window so that we can use it from within the extension
 */
import browser from "webextension-polyfill";

function log(func, ...argv) {
  func(...argv).catch(process.env.NODE_ENV !== "production" ? console.log.bind(console) : () => {});
}

browser.runtime.sendMessage = log.bind(undefined, browser.runtime.sendMessage);

window.browser = browser;
