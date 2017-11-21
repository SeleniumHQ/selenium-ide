import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { DragSource, DropTarget } from "react-dnd";
import { modifier, parse } from "modifier-keys";
import CommandName from "../CommandName";
import MoreButton from "../ActionButtons/More";
import ListMenu, { ListMenuItem, ListMenuSeparator } from "../ListMenu";
import MultilineEllipsis from "../MultilineEllipsis";
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

@DropTarget(Type, commandTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource(Type, commandSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
export default class TestRow extends React.Component {
  constructor(props) {
    super(props);
    this.paste = this.paste.bind(this);
  }
  static propTypes = {
    id: PropTypes.string,
    index: PropTypes.number,
    selected: PropTypes.bool,
    className: PropTypes.string,
    command: PropTypes.string.isRequired,
    target: PropTypes.string,
    value: PropTypes.string,
    onClick: PropTypes.func,
    addCommand: PropTypes.func,
    insertCommand: PropTypes.func,
    remove: PropTypes.func,
    swapCommands: PropTypes.func,
    isDragging: PropTypes.bool,
    connectDragSource: PropTypes.func,
    connectDropTarget: PropTypes.func,
    dragInProgress: PropTypes.bool,
    setDrag: PropTypes.func,
    clipboard: PropTypes.any,
    copyToClipboard: PropTypes.func,
    clearAllCommands: PropTypes.func,
    moveSelectionUp: PropTypes.func,
    moveSelectionDown: PropTypes.func
  };
  componentDidUpdate(prevProps) {
    if (this.props.selected && !prevProps.selected) {
      this.node.focus();
    }
  }
  handleKeyDown(event) {
    const e = event.nativeEvent;
    modifier(e);
    const key = e.key.toUpperCase();
    const noModifiers = (!e.primaryKey && !e.secondaryKey);
    const onlyPrimary = (e.primaryKey && !e.secondaryKey);

    if (this.props.remove && noModifiers && (e.key === "Delete" || e.key == "Backspace")) {
      this.props.remove();
    } else if (this.props.moveSelectionUp && noModifiers && e.key === "ArrowUp") {
      this.props.moveSelectionUp();
    } else if (this.props.moveSelectionDown && noModifiers && e.key === "ArrowDown") {
      this.props.moveSelectionDown();
    } else if (this.props.copyToClipboard && onlyPrimary && key === "X") {
      this.props.copyToClipboard();
      this.props.remove();
    } else if (this.props.copyToClipboard && onlyPrimary && key === "C") {
      this.props.copyToClipboard();
    } else if (onlyPrimary && key === "V") {
      this.paste();
    }
  }
  paste() {
    if (this.props.clipboard && this.props.clipboard.constructor.name === "Command") {
      this.props.addCommand(this.props.clipboard);
    }
  }
  render() {
    const rendered = <tr
      ref={node => {return(this.node = node || this.node);}}
      className={classNames(this.props.className, {"selected": this.props.selected}, {"dragging": this.props.dragInProgress})}
      tabIndex={this.props.selected ? "0" : "-1"}
      onClick={this.props.onClick}
      onKeyDown={this.handleKeyDown.bind(this)}
      onFocus={this.props.onClick}
      style={{
        opacity: this.props.isDragging ? "0" : "1"
      }}>
      <td><span></span><CommandName>{this.props.command}</CommandName></td>
      <td><MultilineEllipsis lines={3}>{this.props.target}</MultilineEllipsis></td>
      <td><MultilineEllipsis lines={3}>{this.props.value}</MultilineEllipsis></td>
      <td className="buttons">
        <div>
          { this.props.swapCommands ? 
            <ListMenu width={300} padding={-5} opener={
              <MoreButton />
            }>
              <ListMenuItem label={parse("x", { primaryKey: true})} onClick={() => {this.props.copyToClipboard(); this.props.remove();}}>Cut</ListMenuItem>
              <ListMenuItem label={parse("c", { primaryKey: true})} onClick={this.props.copyToClipboard}>Copy</ListMenuItem>
              <ListMenuItem label={parse("v", { primaryKey: true})} onClick={this.paste}>Paste</ListMenuItem>
              <ListMenuItem label="Del" onClick={this.props.remove}>Delete</ListMenuItem>
              <ListMenuSeparator />
              <ListMenuItem onClick={() => { this.props.insertCommand(); }}>Insert New Command</ListMenuItem>
              <ListMenuSeparator />
              <ListMenuItem onClick={this.props.clearAllCommands}>Clear All</ListMenuItem>
            </ListMenu> : null }
        </div>
      </td>
    </tr>;
    return (this.props.swapCommands ? this.props.connectDragSource(this.props.connectDropTarget(rendered)) : rendered);
  }
}
