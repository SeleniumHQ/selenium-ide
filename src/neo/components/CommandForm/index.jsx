import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import Input from "../FormInput";
import CommandInput from "../CommandInput";
import "./style.css";

@observer export default class CommandForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  static propTypes = {
    command: PropTypes.object
  };
  render() {
    return (
      <div className="command-form">
        <form>
          <CommandInput id="command" name="command" label="Command" value={this.state.command} onChange={(command) => { this.setState({ command }); this.props.setCommand(command); }} />
          <Input id="target" name="target" label="Target" value={this.props.command ? this.props.command.target : ""} onChange={this.props.command ? this.props.command.setTarget : null} />
          <Input id="value" name="value" label="Value" value={this.props.command ? this.props.command.value : ""} onChange={this.props.command ? this.props.command.setValue : null} />
        </form>
      </div>
    );
  }
}
