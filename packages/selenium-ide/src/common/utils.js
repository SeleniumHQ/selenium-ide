import { userAgent as _userAgent, environment } from '@seleniumhq/side-utils'
export const isProduction = environment.isProduction
export const isStaging = environment.isStaging
export const isTest = environment.isTest
export const userAgent = _userAgent.userAgent
export const isJDXQACompatible = environment.jdxQACompatible
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
