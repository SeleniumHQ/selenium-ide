import React from "react";
import Title from "react-document-title";
import "./style.css";

export default class ProjectHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Untitled Project"
    };
  }
  render() {
    return (
      <div className="header">
        <Title title={`Selenium IDE - ${this.state.title}`} />
        <input type="text" defaultValue={this.state.title} placeholder="Project Name" />
      </div>
    );
  }
}
