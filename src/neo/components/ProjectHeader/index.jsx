import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Title from "react-document-title";
import "./style.css";

export default class ProjectHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Untitled Project"
    };
  }
  static propTypes = {
    changed: PropTypes.bool
  };
  componentDidMount() {
    this.projectTitle.setAttribute("contentEditable", true);
  }
  render() {
    return (
      <div className="header">
        <Title title={`Selenium IDE - ${this.state.title}`} />
        <span className={classNames("title", {"changed": this.props.changed})} ref={(r) => { this.projectTitle = r; }}>{this.state.title}</span>
      </div>
    );
  }
}
