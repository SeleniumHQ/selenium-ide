import React from "react";
import PropTypes from "prop-types";
import AutoComplete from "../AutoComplete";
import "./style.css";

export default class UrlBar extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    urls: PropTypes.array,
    setUrl: PropTypes.func.isRequired
  };
  render() {
    return (
      <div className="url">
        <div>
          <AutoComplete
            items={this.props.urls ? this.props.urls : []}
            value={this.props.url}
            inputProps={{
              type: "url",
              placeholder: "Playback base URL"
            }}
            shouldItemRender={(item, value) => (item.indexOf(value) !== -1)}
            onChange={(e) => {this.props.setUrl(e.target.value);}}
            onSelect={this.props.setUrl}
          />
        </div>
      </div>
    );
  }
}
