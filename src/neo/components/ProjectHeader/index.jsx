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
  componentDidMount() {
    this.projectTitle.setAttribute("contentEditable", true);
  }
  render() {
    return (
      <div className="header">
        <Title title={`Selenium IDE - ${this.state.title}`} />
        <span className="title" ref={(r) => { this.projectTitle = r; }}>{this.state.title}</span>
      </div>
    );
  }
}
