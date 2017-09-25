import React from "react";
import Progress from "../Progress";
import "./style.css";

export default class Runs extends React.Component {
  render() {
    return (
      <div className="runs">
        <Progress />
        <div>
          <span className="left">Runs: 18</span>
          <span className="right">Failures: <span className="failures">2</span></span>
        </div>
      </div>
    );
  }
}
