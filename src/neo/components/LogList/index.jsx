import React from "react";
import { PropTypes as MobxPropTypes } from "mobx-react";
import LogMessage from "../LogMessage";
import "./style.css";

export default class LogList extends React.Component {
  render() {
    return (
      <div className="logs">
        <ul>
          {this.props.logs.map(({id, message, status}) => (
            <LogMessage key={id} status={status}>{message}</LogMessage>
          ))}
        </ul>
      </div>
    );
  }
  static propTypes = {
    logs: MobxPropTypes.arrayOrObservableArray
  };
}
