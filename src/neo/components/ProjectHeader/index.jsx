import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Title from "react-document-title";
import ContentEditable from "react-contenteditable";
import "./style.css";

export default class ProjectHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Untitled Project"
    };
    this.handleChange = this.handleChange.bind(this);
  }
  static propTypes = {
    changed: PropTypes.bool
  };
  handleChange(e) {
    this.setState({ title: e.target.value });
  }
  render() {
    return (
      <div className="header">
        <Title title={`Selenium IDE - ${this.state.title}`} />
        <ContentEditable className={classNames("title", {"changed": this.props.changed})} onChange={this.handleChange} html={this.state.title} />
      </div>
    );
  }
}
