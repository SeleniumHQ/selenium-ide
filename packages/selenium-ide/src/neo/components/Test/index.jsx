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
import { DragSource } from "react-dnd";
import classNames from "classnames";
import { modifier } from "modifier-keys";
import Callstack from "../Callstack";
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
class Test extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    callstack: PropTypes.object,
    test: PropTypes.object.isRequired,
    suite: PropTypes.object,
    selected: PropTypes.bool,
    selectedStackIndex: PropTypes.number,
    changed: PropTypes.bool,
    isDragging: PropTypes.bool,
    selectTest: PropTypes.func.isRequired,
    renameTest: PropTypes.func,
    removeTest: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func,
    moveSelectionUp: PropTypes.func,
    moveSelectionDown: PropTypes.func,
    setSectionFocus: PropTypes.func,
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
    this.props.selectTest(test, suite, this.props.callstack ? this.props.callstack.length - 1 : undefined);
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
        display: this.props.isDragging ? "none" : "block"
      }}>
      <div className="name">
        <span>{this.props.test.name}</span>
        {this.props.renameTest ?
          listMenu :
          <RemoveButton onClick={(e) => {e.stopPropagation(); this.props.removeTest();}} />
        }
      </div>
      {this.props.callstack ? <Callstack stack={this.props.callstack} selectedIndex={this.props.selectedStackIndex} /> : undefined}
    </a>;
    return (this.props.suite ? this.props.connectDragSource(rendered) : rendered);
  }
}

export const DraggableTest = DragSource(Type, testSource, collect)(Test);

export default withOnContextMenu(Test);
