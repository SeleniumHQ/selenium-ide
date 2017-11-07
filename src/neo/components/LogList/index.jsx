import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import LogMessage from "../LogMessage";
import "./style.css";

@observer
export default class LogList extends React.Component {
  render() {
    return (
      <div className="logs">
        <ul>
          {this.props.store.logs.map(({id, message, status}) => (
            <LogMessage key={id} status={status}>{message}</LogMessage>
          ))}
        </ul>
      </div>
    );
  }
  static propTypes = {
    store: PropTypes.object
  };
}
