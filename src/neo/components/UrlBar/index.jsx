import React from "react";
import "./style.css";

export default class UrlBar extends React.Component {
  render() {
    return (
      <input className="url" type="text" placeholder="http://www.seleniumhq.org" />
    );
  }
}
