import 'jest-dom/extend-expect' // matchers for view tests

window.HTMLElement.prototype.scrollTo = jest.fn()

class MutationObserver {
  constructor() {
    this.observe = jest.fn()
    this.disconnect = jest.fn()
  }
}

window.MutationObserver = MutationObserver
