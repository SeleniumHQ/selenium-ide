// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import React from "react";
import PropTypes from "prop-types";
import { DragSource, DropTarget} from "react-dnd";
import classNames from "classnames";
import { modifier } from "modifier-keys";
import RemoveButton from "../ActionButtons/Remove";
import { withOnContextMenu } from "../ContextMenu";
import ListMenu, { ListMenuItem } from "../ListMenu";
import MoreButton from "../ActionButtons/More";
import "./style.css";

export const Type = "test";
const testSource = {
  beginDrag(props) {
    return {
      id: props.test.id,
      index: props.index,
      suite: props.suite.id
    };
  }
};
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

const testTarget = {
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

    props.swapTestCases(dragIndex, hoverIndex);

    // save time on index lookups
    monitor.getItem().index = hoverIndex;
  }
};

@DropTarget(Type, testTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource(Type, testSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))

export class Test extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    test: PropTypes.object.isRequired,
    suite: PropTypes.object,
    selected: PropTypes.bool,
    changed: PropTypes.bool,
    isDragging: PropTypes.bool,
    selectTest: PropTypes.func.isRequired,
    renameTest: PropTypes.func,
    removeTest: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func,
    connectDropTarget: PropTypes.func,
    dragInProgress: PropTypes.bool,
    setDrag: PropTypes.func,
    moveSelectionUp: PropTypes.func,
    moveSelectionDown: PropTypes.func,
    setSectionFocus: PropTypes.func,
    swapTestCases: PropTypes.func,
    onContextMenu: PropTypes.func,
    setContextMenu: PropTypes.func
  };
  componentDidMount() {
    if (this.props.selected) {
      this.props.setSectionFocus("navigation", () => {
        this.node.focus();
      });
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.selected && !prevProps.selected) {
      this.node.focus();
      this.props.setSectionFocus("navigation", () => {
        this.node.focus();
      });
    }
  }
  componentWillUnmount() {
    if (this.props.selected) {
      this.props.setSectionFocus("navigation", undefined);
    }
  }
  handleClick(test, suite) {
    this.props.selectTest(test, suite);
  }
  handleKeyDown(event) {
    const e = event.nativeEvent;
    modifier(e);
    const noModifiers = (!e.primaryKey && !e.secondaryKey);

    if (this.props.moveSelectionUp && noModifiers && e.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      this.props.moveSelectionUp();
    } else if (this.props.moveSelectionDown && noModifiers && e.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      this.props.moveSelectionDown();
    }
  }
  render() {
    const listMenu = <ListMenu width={130} padding={-5} opener={<MoreButton />}>
      {this.props.suite ?
        null :
        <ListMenuItem onClick={() => this.props.renameTest(this.props.test.name, this.props.test.setName)}>Rename</ListMenuItem> }
      <ListMenuItem onClick={this.props.removeTest}>Delete</ListMenuItem>
    </ListMenu>;
    //setting component of context menu.
    this.props.setContextMenu ? this.props.setContextMenu(listMenu) : null;

    const rendered = <a
      href="#"
      ref={(node) => { this.node = node; }}
      className={classNames("test", this.props.className, { "changed": this.props.changed }, { "selected": this.props.selected })}
      onClick={this.handleClick.bind(this, this.props.test, this.props.suite)}
      onFocus={this.handleClick.bind(this, this.props.test, this.props.suite)}
      onKeyDown={this.handleKeyDown.bind(this)}
      tabIndex={this.props.selected ? "0" : "-1"}
      onContextMenu={this.props.onContextMenu}
      style={{
        opacity: this.props.isDragging ? "0" : "1"
      }}>
      <span>{this.props.test.name}</span>
      {this.props.renameTest ?
        listMenu :
        <RemoveButton onClick={(e) => {e.stopPropagation(); this.props.removeTest();}} />}
    </a>;
    return (this.props.suite ? this.props.connectDragSource(this.props.connectDropTarget(rendered)) : rendered);
  }
}
export const DraggableTest = DragSource(Type, testSource, collect)(Test);

export default withOnContextMenu(Test);
