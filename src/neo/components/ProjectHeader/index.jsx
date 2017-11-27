import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import Title from "react-document-title";
import ContentEditable from "react-contenteditable";
import OpenButton from "../ActionButtons/Open";
import SaveButton from "../ActionButtons/Save";
import "./style.css";

export default class ProjectHeader extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  static propTypes = {
    title: PropTypes.string.isRequired,
    changed: PropTypes.bool,
    changeName: PropTypes.func.isRequired,
    load: PropTypes.func,
    save: PropTypes.func
  };
  handleChange(e) {
    this.props.changeName(e.target.value);
  }
  render() {
    return (
      <div className="header">
        <Title title={`Selenium IDE - ${this.props.title}${this.props.changed ? "*" : ""}`} />
        <div><ContentEditable className={classNames("title", {"changed": this.props.changed})} onChange={this.handleChange} html={this.props.title} /></div>
        <span className="buttons right">
          <OpenButton onFileSelected={this.props.load} />
          <SaveButton onClick={this.props.save} />
        </span>
      </div>
    );
  }
}
