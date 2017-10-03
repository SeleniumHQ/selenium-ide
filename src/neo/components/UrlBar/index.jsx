import React from "react";
import "./style.css";

export default class UrlBar extends React.Component {
  render() {
    return (
      <span className="url">
        <label htmlFor="url">Base URL</label>
        <input id="url" name="url" type="text" placeholder="http://www.seleniumhq.org" />
      </span>
    );
  }
}
