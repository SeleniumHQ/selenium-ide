import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import classNames from "classnames";
import { Commands } from "../../models/Command";
import Input from "../FormInput";
import CommandInput from "../CommandInput";
import FlatButton from "../FlatButton";
import { find, select } from "../../IO/SideeX/find-select";
import "./style.css";

@observer export default class CommandForm extends React.Component {
  static propTypes = {
    command: PropTypes.object,
    isSelecting: PropTypes.bool,
    onSubmit: PropTypes.func
  };
  parseCommandName(command) {
    return Commands[command] ? Commands[command] : command;
  }
  render() {
    return (
      <div className="command-form">
        <form onSubmit={(e) => { e.preventDefault(); }}>
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
            <FlatButton className={classNames("icon", "si-select", {"active": this.props.isSelecting})} onClick={select} />
            <FlatButton className="icon si-search" onClick={() => {find(this.props.command.target);}} />
          </div>
          <Input
            id="value"
            name="value"
            label="Value"
            value={this.props.command ? this.props.command.value : ""}
            disabled={!this.props.command}
            onChange={this.props.command ? this.props.command.setValue : null} />
          <input type="submit" onClick={this.props.onSubmit} />
        </form>
      </div>
    );
  }
}
