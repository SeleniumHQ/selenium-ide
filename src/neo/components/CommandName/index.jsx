import React from "react";
import PropTypes from "prop-types";
import { CommandsArray } from "../../models/Command";

const CommandsDictionary = {
  addSelection: "add selection",
  answerOnNextPrompt: "answer on next prompt",
  assertAlert: "assert alert",
  assertConfirmation: "assert confirmation",
  assertPrompt: "assert prompt",
  assertText: "assert text",
  assertTitle: "assert title",
  chooseCancelOnNextConfirmation: "choose cancel on next confirmation",
  chooseCancelOnNextPrompt: "choose cancel on next prompt",
  chooseOkOnNextConfirmation: "choose ok on next confirmation",
  clickAt: "click at",
  doubleClickAt: "double click at",
  dragAndDropToObject: "drag and drop to object",
  echo: "echo",
  editContent: "edit content",
  mouseDownAt: "mouse down at",
  mouseMoveAt: "mouse move at",
  mouseOut: "mouse out",
  mouseOver: "mouse over",
  mouseUpAt: "mouse up at",
  open: "open",
  pause: "pause",
  removeSelection: "remove selection",
  runScript: "run script",
  select: "select",
  selectFrame: "select frame",
  selectWindow: "select window",
  sendKeys: "send keys",
  store: "store",
  storeText: "store text",
  storeTitle: "store title",
  type: "type",
  verifyText: "verify text",
  verifyTitle: "verify title"
};

export default class CommandName extends React.Component {
  static propTypes = {
    children: PropTypes.oneOf(CommandsArray)
  };
  render() {
    return CommandsDictionary[this.props.children] ? CommandsDictionary[this.props.children] : this.props.children;
  }
}
