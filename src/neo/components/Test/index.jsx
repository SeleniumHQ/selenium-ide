import React from "react";
import PropTypes from "prop-types";
import { DragSource } from "react-dnd";
import classNames from "classnames";
import "./style.css";

export const Type = "test";
const testSource = {
  beginDrag(props) {
    return {
      id: props.id,
      suite: props.suite
    };
  }
};
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

export default class Test extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    suite: PropTypes.string,
    selected: PropTypes.bool,
    changed: PropTypes.bool,
    isDragging: PropTypes.bool,
    selectTest: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func
  };
  handleClick(testId) {
    this.props.selectTest(testId);
  }
  render() {
    const rendered = <a href="#" className={classNames("test", {"changed": this.props.changed}, {"selected": this.props.selected}, {"dragging": this.props.isDragging})} onClick={this.handleClick.bind(this, this.props.id)}>
      <span>{this.props.name}</span>
    </a>;
    return (this.props.suite ? this.props.connectDragSource(rendered) : rendered);
  }
}

export const DraggableTest = DragSource(Type, testSource, collect)(Test);
