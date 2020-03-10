import { userAgent as _userAgent, environment } from '@seleniumhq/side-utils'
export const isProduction = environment.isProduction
export const isStaging = environment.isStaging
export const isTest = environment.isTest
export const userAgent = _userAgent.userAgent
export const isJDXQACompatible = environment.jdxQACompatible

const axios = require('axios').default

export function isChrome() {
  _userAgent.isChrome
}
export function isFirefox() {
  _userAgent.isFirefox
}

export function getJDXCfg() {
  return {
    SERVER_URL: 'http://localhost',
    SERVER_PORT: 8888,
  }
}

export function getJDXServerURL(path) {
  return getJDXCfg().SERVER_URL + ':' + getJDXCfg().SERVER_PORT + path
}

export function postJSON(url, method, data) {
  if (!url) {
    url = getJDXServerURL('/')
  }

  return axios({
    method,
    url,
    data,
  })
}
