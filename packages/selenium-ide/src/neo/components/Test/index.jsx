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
export default class Test extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    callstack: PropTypes.object,
    test: PropTypes.object.isRequired,
    suite: PropTypes.object,
    menu: PropTypes.node,
    selected: PropTypes.bool,
    selectedStackIndex: PropTypes.number,
    changed: PropTypes.bool,
    isDragging: PropTypes.bool,
    selectTest: PropTypes.func.isRequired,
    renameTest: PropTypes.func,
    removeTest: PropTypes.func,
    connectDragSource: PropTypes.func,
    moveSelectionUp: PropTypes.func,
    moveSelectionDown: PropTypes.func,
    setSectionFocus: PropTypes.func,
    onContextMenu: PropTypes.func,
    setContextMenu: PropTypes.func
  };
  static defaultProps = {
    noMenu: false
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
      // if we have a stack, and the top test isnt selected
      if (this.props.callstack && this.props.selectedStackIndex !== undefined) {
        this.props.selectTest(this.props.test, this.props.suite, this.props.selectedStackIndex - 1);
      } else {
        this.props.moveSelectionUp();
      }
    } else if (this.props.moveSelectionDown && noModifiers && e.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      // if we have a stack and the bottom stack member isnt selected
      if (this.props.callstack && (this.props.selectedStackIndex === undefined || this.props.selectedStackIndex + 1 < this.props.callstack.length)) {
        this.props.selectTest(this.props.test, this.props.suite, this.props.selectedStackIndex !== undefined ? this.props.selectedStackIndex + 1 : 0);
      } else {
        this.props.moveSelectionDown();
      }
    }
  }
  handleCallstackClick(test, suite, index) {
    this.props.selectTest(test, suite, index);
  }
  render() {
    const rendered = <div
      ref={(node) => { this.node = node; }}
      className={classNames("test", this.props.className, { "changed": this.props.changed }, { "selected": this.props.selected })}
      onKeyDown={this.handleKeyDown.bind(this)}
      tabIndex={this.props.selected ? "0" : "-1"}
      onContextMenu={this.props.onContextMenu}
      style={{
        display: this.props.isDragging ? "none" : "block"
      }}>
      <a
        ref={(button) => { this.button = button; }}
        className={classNames("name", { "selected": this.props.selected && this.props.selectedStackIndex === undefined })}
        onClick={this.handleClick.bind(this, this.props.test, this.props.suite)}>
        <span>{this.props.test.name}</span>
        {this.props.menu}
        {this.props.removeTest && !this.props.menu && <RemoveButton onClick={(e) => {e.stopPropagation(); this.props.removeTest();}} />}
      </a>
      {this.props.callstack ? <Callstack
        stack={this.props.callstack}
        selectedIndex={this.props.selectedStackIndex}
        onClick={this.handleCallstackClick.bind(this, this.props.test, this.props.suite)}
      /> : undefined}
    </div>;
    return (this.props.connectDragSource ? this.props.connectDragSource(rendered) : rendered);
  }
}

@withOnContextMenu
export class MenuTest extends React.Component {
  render () {
    /* eslint-disable react/prop-types */
    const listMenu = <ListMenu width={130} padding={-5} opener={<MoreButton />}>
      <ListMenuItem onClick={() => this.props.renameTest(this.props.test.name, this.props.test.setName)}>Rename</ListMenuItem>
      <ListMenuItem onClick={this.props.removeTest}>Delete</ListMenuItem>
    </ListMenu>;
    //setting component of context menu.
    this.props.setContextMenu ? this.props.setContextMenu(listMenu) : null;
    return (
      <Test {...this.props} menu={listMenu} />
    );
  }
}

export const DraggableTest = DragSource(Type, testSource, collect)(Test);
