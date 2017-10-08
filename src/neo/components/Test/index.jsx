import React from "react";
import PropTypes from "prop-types";
import { DragSource } from "react-dnd";
import classNames from "classnames";
import test from "../../images/ic_test.svg";
import "./style.css";

export const Type = "test";
const testSource = {
  beginDrag(props) {
    return { id: props.id };
  },
  endDrag(props, monitor, component) {
    if (!monitor.didDrop()) {
      return;
    }

    console.log(monitor.getItem());
    console.log(monitor.getDropResult());
  }
};
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

class Test extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    selected: PropTypes.bool,
    selectTest: PropTypes.func.isRequired
  };
  handleClick(testId) {
    this.props.selectTest(testId);
  }
  render() {
    return (this.props.connectDragSource(
      <a href="#" className={classNames("test", {"selected": this.props.selected})} onClick={this.handleClick.bind(this, this.props.id)}>
        <img src={test} alt="test" />
        <span>{this.props.name}</span>
      </a>
    ));
  }
}

export default DragSource(Type, testSource, collect)(Test);
