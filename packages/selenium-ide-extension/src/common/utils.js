import parser from 'ua-parser-js'

export const isProduction = process.env.NODE_ENV === 'production'

export const isStaging = process.env.NODE_ENV === 'staging'

export const isTest = process.env.NODE_ENV === 'test'

export const userAgent = parser(window.navigator.userAgent)

export function isChrome() {
  userAgent.browser.name === 'Chrome'
}

export function isFirefox() {
  userAgent.browser.name === 'Firefox'
}
