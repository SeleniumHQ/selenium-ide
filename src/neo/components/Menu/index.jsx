import React from "react";
import PropTypes from "prop-types";
import ReactModal from "react-modal";
import classNames from "classnames";
import "./style.css";

export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isClosing: true
    };
    this.handleClosing = this.handleClosing.bind(this);
  }
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    requestClose: PropTypes.func.isRequired
  };
  componentWillReceiveProps(nextProps) {
    if (this.state.isClosing && nextProps.isOpen) {
      setTimeout(() => {this.setState({ isClosing: false });}, 0);
    }
  }
  handleClosing() {
    this.setState({ isClosing: true });
    this.props.requestClose();
  }
  render() {
    return (
      <ReactModal
        className={classNames("menu", "content", { "closed": this.state.isClosing })}
        isOpen={this.props.isOpen}
        ariaHideApp={false}
        shouldCloseOnOverlayClick={true}
        closeTimeoutMS={300}
        onRequestClose={this.handleClosing}
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
