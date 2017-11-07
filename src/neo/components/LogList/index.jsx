import React from "react";
import { observer } from "mobx-react";
import LogMessage from "../LogMessage";
import LogStore from "../../stores/view/Logs";
import "./style.css";

@observer
export default class LogList extends React.Component {
  constructor(props) {
    super(props);
    this.store = new LogStore();
  }
  componentWillUnmount() {
    this.store.dispose();
  }
  render() {
    return (
      <div className="logs">
        <ul>
          {this.store.logs.map(({id, message, status}) => (
            <LogMessage key={id} status={status}>{message}</LogMessage>
          ))}
        </ul>
      </div>
    );
  }
}
