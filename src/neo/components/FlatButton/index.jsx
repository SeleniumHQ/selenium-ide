import React from "react";
import classNames from "classnames";
import "./style.css";

export default class FlatButton extends React.Component {
  render() {
    return (<button {...this.props} className={classNames("btn", "danger", this.props.className)} />); // eslint-disable-line react/prop-types
  }
}
