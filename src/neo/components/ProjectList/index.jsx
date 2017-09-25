import React from "react";
import PropTypes from "prop-types";

export default class ProjectList extends React.Component {
  static propTypes = {
    projects: PropTypes.array.isRequired
  };
  render() {
    return (
      <ul>
      </ul>
    );
  }
}
