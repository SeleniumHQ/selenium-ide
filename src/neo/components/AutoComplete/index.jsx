import React from "react";
import PropTypes from "prop-types";
import Autocomplete from "react-autocomplete";
import tick from "../../images/ic_tick.svg";

export default class AutoComplete extends React.Component {
  static propTypes = {
    renderDefaultStyledItem: PropTypes.func
  };
  render() {
    return (
      <Autocomplete
        renderInput={(props) => (
          <span style={{
            position: "relative"
          }}>
            <input {...props} style={{
              width: "100%",
              boxSizing: "border-box"
            }}/>
            <img src={tick} style={{
              position: "absolute",
              top: "0",
              bottom: "0",
              right: "8px",
              margin: "auto 0",
              transform: "rotate(90deg)"
            }} />
          </span>
        )}
        renderItem={(item, isHighlighted) =>
          <div key={item} style={{
            background: isHighlighted ? "#f3f3f3" : "white",
            padding: "8px"
          }}>
            {this.props.renderDefaultStyledItem ? this.props.renderDefaultStyledItem(item, isHighlighted) : item}
          </div>
        }
        menuStyle={{
          zIndex: 1,
          borderRadius: "3px",
          border: "1px solid #DEDEDE",
          boxShadow: "0 0 3px 0 rgba(0,0,0,0.3)",
          background: "rgba(255, 255, 255, 0.9)",
          padding: "2px 0",
          fontSize: "90%",
          position: "fixed",
          overflow: "auto",
          maxHeight: "30%"
        }}
        {...this.props}
      />
    );
  }
}

