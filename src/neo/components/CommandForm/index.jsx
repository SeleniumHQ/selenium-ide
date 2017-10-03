import React from "react";

export default class CommandForm extends React.Component {
  render() {
    return (
      <div>
        <form>
          <label htmlFor="command">Command</label>
          <input type="text" id="command" name="command" />
          <label htmlFor="target">Target</label>
          <input type="text" id="target" name="target" />
          <label htmlFor="value">Value</label>
          <input type="text" id="value" name="value" />
        </form>
      </div>
    );
  }
}
