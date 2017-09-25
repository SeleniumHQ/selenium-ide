import React from "react";
import "./style.css";

export default class Progress extends React.Component {
  render() {
    return (
      <progress className="progress" value="22" max="100"></progress>
    );
  }
}
