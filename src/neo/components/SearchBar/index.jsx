import React from "react";
import "./style.css";

export default class SearchBar extends React.Component {
  render() {
    return (
      <div>
        <input className="search" type="search" placeholder="Search tests..." />
      </div>
    );
  }
}
