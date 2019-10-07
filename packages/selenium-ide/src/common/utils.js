import { userAgent as _userAgent, environment } from '@seleniumhq/side-utils'
export const isProduction = environment.isProduction
export const isStaging = environment.isStaging
export const isTest = environment.isTest
export const userAgent = _userAgent.userAgent
export function isChrome() {
  _userAgent.isChrome
}
export function isFirefox() {
  _userAgent.isFirefox
}
