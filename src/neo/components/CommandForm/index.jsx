import React from "react";
import Input from "../FormInput";
import "./style.css";

export default class CommandForm extends React.Component {
  render() {
    return (
      <div className="command-form">
        <form>
          <Input id="command" name="command" label="Command" />
          <Input id="target" name="target" label="Target" />
          <Input id="value" name="value" label="Value" />
        </form>
      </div>
    );
  }
}
