import React from "react";
import "./style.css";

export default class ProjectHeader extends React.Component {
  render() {
    return (
      <div className="header">
        <input type="text" defaultValue="Untitled Project" placeholder="Project Name" />
      </div>
    );
  }
}
