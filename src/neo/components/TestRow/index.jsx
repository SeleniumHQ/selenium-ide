import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { DragSource, DropTarget } from "react-dnd";
import CommandName from "../CommandName";
import MoreButton from "../ActionButtons/More";
import ListMenu, { ListMenuItem } from "../ListMenu";
import "./style.css";

export const Type = "command";

const commandSource = {
  beginDrag(props) {
    props.setDrag(true);
    return {
      id: props.id,
      index: props.index
    };
  },
  endDrag(props) {
    props.setDrag(false);
  }
};

const commandTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = component.decoratedComponentInstance.node.getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    props.swapCommands(dragIndex, hoverIndex);

    // save time on index lookups
    monitor.getItem().index = hoverIndex;
  }
};

export const RowState = {
  Pending: "pending",
  Passed: "passed",
  Failed: "failed",
  Selected: "selected"
};

@DropTarget(Type, commandTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource(Type, commandSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
export default class TestRow extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    command: PropTypes.string.isRequired,
    target: PropTypes.string,
    value: PropTypes.string,
    state: PropTypes.oneOf(Object.keys(RowState)),
    onClick: PropTypes.func,
    addCommand: PropTypes.func,
    remove: PropTypes.func,
    swapCommands: PropTypes.func,
    isDragging: PropTypes.bool,
    connectDragSource: PropTypes.func,
    connectDropTarget: PropTypes.func,
    dragInProgress: PropTypes.bool,
    setDrag: PropTypes.func
  };
  handleClick(e) {
    if (this.node === e.target.parentElement) {
      this.props.onClick(e);
    }
  }
  render() {
    return (this.props.connectDragSource(this.props.connectDropTarget(
      <tr ref={node => {return(this.node = node || this.node);}} className={classNames({[RowState[this.props.state]]: this.props.state})} onClick={this.handleClick.bind(this)} style={{
        opacity: this.props.isDragging ? "0" : "1",
        cursor: this.props.dragInProgress ? "move" : "pointer"
      }}>
        <td><CommandName>{this.props.command}</CommandName></td>
        <td>{this.props.target}</td>
        <td>{this.props.value}</td>
        <td className="buttons">
          <div>
            <ListMenu opener={
              <MoreButton />
            }>
              <ListMenuItem onClick={this.props.addCommand}>Add command</ListMenuItem>
              <ListMenuItem onClick={this.props.remove}>Remove command</ListMenuItem>
            </ListMenu>
          </div>
        </td>
      </tr>
    )));
  }
}
