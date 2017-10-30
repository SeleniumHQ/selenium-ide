import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { Commands } from "../../models/Command";
import Input from "../FormInput";
import CommandInput from "../CommandInput";
import FlatButton from "../FlatButton";
import find from "../../images/ic_find.svg";
import select from "../../images/ic_select.svg";
import "./style.css";

@observer export default class CommandForm extends React.Component {
  static propTypes = {
    command: PropTypes.object
  };
  parseCommandName(command) {
    return Commands[command] ? Commands[command] : command;
  }
  render() {
    return (
      <div className="command-form">
        <form>
          <CommandInput
            id="command"
            name="command"
            label="Command"
            value={this.props.command ? this.parseCommandName(this.props.command.command) : ""}
            disabled={!this.props.command}
            onChange={this.props.command ? this.props.command.setCommand : null} />
          <div className="target">
            <Input
              id="target"
              name="target"
              label="Target"
              value={this.props.command ? this.props.command.target : ""}
              disabled={!this.props.command}
              onChange={this.props.command ? this.props.command.setTarget : null} />
            <FlatButton className="icon"><img src={select} /></FlatButton>
            <FlatButton className="icon"><img src={find} /></FlatButton>
          </div>
          <Input
            id="value"
            name="value"
            label="Value"
            value={this.props.command ? this.props.command.value : ""}
            disabled={!this.props.command}
            onChange={this.props.command ? this.props.command.setValue : null} />
        </form>
      </div>
    );
  }
}
