import React from "react";
import "./style.css";

export default class UrlBar extends React.Component {
  render() {
    return (
      <div className="url">
        <input id="url" name="url" type="url" placeholder="http://www.seleniumhq.org" />
      </div>
    );
  }
}
