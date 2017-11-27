import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Progress from "../Progress";
import "./style.css";

export default class Runs extends React.Component {
  static propTypes = {
    runs: PropTypes.number,
    failures: PropTypes.number,
    hasError: PropTypes.bool,
    progress: PropTypes.number,
    totalProgress: PropTypes.number
  };
  static defaultProps = {
    runs: 0,
    failures: 0
  };
  render() {
    return (
      <div className="runs">
        <Progress hasError={this.props.hasError} progress={this.props.progress} totalProgress={this.props.totalProgress} />
        <div className="status">
          <span>Runs: {this.props.runs}</span>
          <span>Failures: <span className={classNames({"failures": this.props.failures})}>{this.props.failures}</span></span>
        </div>
      </div>
    );
  }
}
