import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import LogMessage from "../LogMessage";
import "./style.css";

@observer
export default class LogList extends React.Component {
  componentDidUpdate() {
    this.container.scrollTo(0, 10000);
  }
  render() {
    return (
      <div className="logs" ref={container => {this.container = container;}}>
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
