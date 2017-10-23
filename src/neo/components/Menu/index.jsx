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
  static width = 200;
  static padding = 5;
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    node: PropTypes.instanceOf(HTMLElement),
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
    const boundingRect = this.props.node ? this.props.node.getBoundingClientRect() : undefined;
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
            transformOrigin: `${Menu.width}px 0px 0px`,
            width: `${Menu.width}px`,
            top: `${boundingRect ? boundingRect.top - Menu.padding : "40"}px`,
            left: `${boundingRect ? boundingRect.left - Menu.width - Menu.padding : "40"}px`
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
