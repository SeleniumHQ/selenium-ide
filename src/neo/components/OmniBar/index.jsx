import React from "react";
import UrlBar from "../UrlBar";
import "./style.css";

export default class OmniBar extends React.Component {
  render() {
    return (
      <nav className="omnibar">
        <UrlBar />
      </nav>
    );
  }
}
