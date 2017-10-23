import React from "react";
import ReactModal from "react-modal";
import "./style.css";

export default class Menu extends React.Component {
  render() {
    return (
      <ReactModal
        className="menu content"
        isOpen={this.props.isOpen}
        ariaHideApp={false}
        shouldCloseOnOverlayClick={true}
        onRequestClose={this.props.requestClose}
        style={{
          overlay: {
            backgroundColor: "transparent"
          },
          content: {
            top: "40px",
            left: "40px"
          }
        }}
      >
        <ul className="buttons">
          <li>
            <a>Add new command</a>
          </li>
          <li>
            <a>Remove command</a>
          </li>
        </ul>
      </ReactModal>
    );
  }
}
