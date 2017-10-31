import React from "react";
import PropTypes from "prop-types";
import "./style.css";

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  static propTypes = {
    filter: PropTypes.func
  };
  handleChange(e) {
    if (this.props.filter) this.props.filter(e.target.value);
  }
  render() {
    return (
      <div>
        <input className="search" type="search" placeholder="Search tests..." onChange={this.handleChange} />
      </div>
    );
  }
}
