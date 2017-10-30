import React from "react";
import PropTypes from "prop-types";
import "./style.css";

export default class UrlBar extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    setUrl: PropTypes.func.isRequired
  };
  render() {
    return (
      <div className="url">
        <input id="url" name="url" type="url" placeholder="http://www.seleniumhq.org" onChange={(e) => {this.props.setUrl(e.target.value);}} />
      </div>
    );
  }
}
