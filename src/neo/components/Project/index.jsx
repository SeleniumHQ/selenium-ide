import React from "react";
import PropTypes from "prop-types";

export default class Project extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired
  };
  render() {
    return (
      <span>
        <p>{this.props.name}</p>
      </span>
    );
  }
}
