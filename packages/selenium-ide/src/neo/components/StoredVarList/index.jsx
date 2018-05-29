import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import "./style.css";

@observer
export default class StoredVarList extends React.Component {
  render() {
    return (
      <div className="storedVars" >
        <ul>
          storedVars
        </ul>
      </div>
    );
  }
  static propTypes = {
    store: PropTypes.object
  };
}