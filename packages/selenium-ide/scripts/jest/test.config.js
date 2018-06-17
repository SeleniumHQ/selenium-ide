import "jest-dom/extend-expect"; // matchers for view tests

window.HTMLElement.prototype.scrollTo = jest.fn();
