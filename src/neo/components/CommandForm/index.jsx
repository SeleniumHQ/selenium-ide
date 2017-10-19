import React from "react";
import Input from "../FormInput";
import CommandInput from "../CommandInput";
import "./style.css";

export default class CommandForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div className="command-form">
        <form>
          <CommandInput id="command" name="command" label="Command" value={this.state.command} onChange={(command) => { this.setState({ command }); }} />
          <Input id="target" name="target" label="Target" />
          <Input id="value" name="value" label="Value" />
        </form>
      </div>
    );
  }
}
