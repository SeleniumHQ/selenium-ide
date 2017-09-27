import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import "./style.css";

export default class Progress extends React.Component {
  static propTypes = {
    hasError: PropTypes.bool,
    progress: PropTypes.number,
    totalProgress: PropTypes.number
  };
  static defaultProps = {
    progress: 0,
    totalProgress: 0
  };
  render() {
    return (
      <progress className={classNames("progress", {"has-error": this.props.hasError})} value={this.props.progress} max={this.props.totalProgress}></progress>
    );
  }
}
