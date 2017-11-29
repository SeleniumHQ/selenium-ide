import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./style.css";

export default class FlatButton extends React.Component {
  static propTypes = {
    buttonRef: PropTypes.func
  };
  render() {
    const props = {...this.props};
    delete props.buttonRef;
    return (<button type="button" ref={this.props.buttonRef} {...props} className={classNames("btn", this.props.className)} />); // eslint-disable-line react/prop-types
  }
}
