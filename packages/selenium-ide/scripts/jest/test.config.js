import "jest-dom/extend-expect"; // matchers for view tests

window.HTMLElement.prototype.scrollTo = jest.fn();

window.MutationObserver = () => {
  return {
    observe: jest.fn(),
    disconnect: jest.fn()
  };
};
