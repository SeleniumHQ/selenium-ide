import React from "react";
import ReactTooltip from "react-tooltip";
import "./style.css";

export default function Tooltip(props) {
  return <ReactTooltip className="se-tooltip" place="bottom" effect="solid" html={true} {...props} />;
}
