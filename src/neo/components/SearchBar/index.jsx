import React from "react";
import PropTypes from "prop-types";
import "./style.css";

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  static propTypes = {
    value: PropTypes.string,
    filter: PropTypes.func
  };
  handleChange(e) {
    if (this.props.filter) this.props.filter(e.target.value);
  }
  render() {
    return (
      <div>
        <input ref={this.props.inputRef} className="search" type="search" placeholder="Search tests..." value={this.props.value} onChange={this.handleChange} />
      </div>
    );
  }
}
