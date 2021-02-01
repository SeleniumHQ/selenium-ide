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

import React from 'react'
import PropTypes from 'prop-types'
import { DragSource, DropTarget } from 'react-dnd'
import classNames from 'classnames'
import { modifier } from 'modifier-keys'
import Callstack from '../Callstack'
import RemoveButton from '../ActionButtons/Remove'
import { withOnContextMenu } from '../ContextMenu'
import ListMenu, { ListMenuItem } from '../ListMenu'
import MoreButton from '../ActionButtons/More'
import './style.css'

export const Type = 'test'

const testSource = {
  beginDrag(props) {
    return {
      id: props.test.id,
      index: props.index,
      test: props.test,
      suite: props.suite,
    }
  },
  isDragging(props, monitor) {
    return (
      props.test.id === monitor.getItem().id &&
      props.suite.id === monitor.getItem().suite.id
    )
  },
}

function collectSource(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

const testTarget = {
  canDrop(props, monitor) {
    const test = monitor.getItem().test
    const suite = props.suite
    return !suite.containsTest(test)
  },
  hover(props, monitor, component) {
    // check if they are different suites
    const dragged = monitor.getItem()
    if (monitor.canDrop() && props.suite !== dragged.suite) {
      dragged.suite.removeTestCase(dragged.test)
      props.suite.addTestCase(dragged.test)
      dragged.suite = props.suite
      dragged.index = props.suite.tests.length - 1
      return
    } else if (!monitor.canDrop() && props.suite !== dragged.suite) {
      // trying to move a duplicate
      return
    }
    const dragIndex = dragged.index
    const hoverIndex = props.index

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return
    }

    // Determine rectangle on screen
    const hoverBoundingRect = component
      .getDecoratedComponentInstance()
      .node.getBoundingClientRect()

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

    // Determine mouse position
    const clientOffset = monitor.getClientOffset()

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }

    props.swapTests(dragIndex, hoverIndex)

    // save time on index lookups
    monitor.getItem().index = hoverIndex
  },
}

const collectTarget = connect => ({
  connectDropTarget: connect.dropTarget(),
})

export default class Test extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    callstack: PropTypes.array,
    test: PropTypes.object.isRequired,
    suite: PropTypes.object,
    menu: PropTypes.node,
    selected: PropTypes.bool,
    isExecuting: PropTypes.bool,
    paused: PropTypes.bool,
    selectedStackIndex: PropTypes.number,
    changed: PropTypes.bool,
    isDragging: PropTypes.bool,
    selectTest: PropTypes.func.isRequired,
    renameTest: PropTypes.func,
    duplicateTest: PropTypes.func,
    removeTest: PropTypes.func,
    connectDropTarget: PropTypes.func,
    connectDragSource: PropTypes.func,
    moveSelectionUp: PropTypes.func,
    moveSelectionDown: PropTypes.func,
    setSectionFocus: PropTypes.func,
    onContextMenu: PropTypes.func,
    setContextMenu: PropTypes.func,
    codeExport: PropTypes.func,
  }
  static defaultProps = {
    noMenu: false,
  }
  componentDidMount() {
    if (this.props.selected) {
      this.props.setSectionFocus('navigation', () => {
        this.node.focus()
      })
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.selected && !prevProps.selected) {
      this.node.focus()
      this.props.setSectionFocus('navigation', () => {
        this.node.focus()
      })
    }
  }
  componentWillUnmount() {
    if (this.props.selected) {
      this.props.setSectionFocus('navigation', undefined)
    }
  }
  handleClick(test, suite) {
    this.props.selectTest(test, suite)
  }
  handleKeyDown(event) {
    const e = event.nativeEvent
    modifier(e)
    const noModifiers = !e.primaryKey && !e.secondaryKey

    if (this.props.moveSelectionUp && noModifiers && e.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      // if we have a stack, and the top test isnt selected
      if (this.props.callstack && this.props.selectedStackIndex !== undefined) {
        this.props.selectTest(
          this.props.test,
          this.props.suite,
          this.props.selectedStackIndex - 1
        )
      } else {
        this.props.moveSelectionUp()
      }
    } else if (
      this.props.moveSelectionDown &&
      noModifiers &&
      e.key === 'ArrowDown'
    ) {
      event.preventDefault()
      event.stopPropagation()
      // if we have a stack and the bottom stack member isnt selected
      if (
        this.props.callstack &&
        (this.props.selectedStackIndex === undefined ||
          this.props.selectedStackIndex + 1 < this.props.callstack.length)
      ) {
        this.props.selectTest(
          this.props.test,
          this.props.suite,
          this.props.selectedStackIndex !== undefined
            ? this.props.selectedStackIndex + 1
            : 0
        )
      } else {
        this.props.moveSelectionDown()
      }
    }
  }
  handleCallstackClick(test, suite, index) {
    this.props.selectTest(test, suite, index)
  }
  render() {
    const rendered = (
      <div
        ref={node => {
          this.node = node
        }}
        className={classNames(
          'test',
          { changed: this.props.changed },
          { selected: this.props.selected },
          { paused: this.props.paused }
        )}
        onKeyDown={this.handleKeyDown.bind(this)}
        tabIndex={this.props.selected ? '0' : '-1'}
        onContextMenu={this.props.onContextMenu}
        style={{
          opacity: this.props.isDragging ? '0' : '1',
        }}
        role="Link"
      >
        <a
          ref={button => {
            this.button = button
          }}
          className={classNames(
            'name',
            this.props.className,
            {
              selected:
                this.props.selected &&
                this.props.selectedStackIndex === undefined,
            },
            {
              executing:
                this.props.isExecuting &&
                this.props.callstack &&
                !this.props.callstack.length,
            }
          )}
          onClick={this.handleClick.bind(
            this,
            this.props.test,
            this.props.suite
          )}
        >
          <span>{this.props.test.name}</span>
          {this.props.menu}
          {this.props.removeTest &&
            !this.props.menu && (
              <RemoveButton
                onClick={e => {
                  e.stopPropagation()
                  this.props.removeTest()
                }}
                aria-label="Remove test"
              />
            )}
        </a>
        {this.props.callstack ? (
          <Callstack
            stack={this.props.callstack}
            selectedIndex={this.props.selectedStackIndex}
            isExecuting={this.props.isExecuting}
            onClick={this.handleCallstackClick.bind(
              this,
              this.props.test,
              this.props.suite
            )}
          />
        ) : (
          undefined
        )}
      </div>
    )
    return this.props.connectDragSource
      ? this.props.connectDropTarget(this.props.connectDragSource(rendered))
      : rendered
  }
}

@withOnContextMenu
export class MenuTest extends React.Component {
  render() {
    /* eslint-disable react/prop-types */
    const listMenu = (
      <ListMenu
        width={130}
        padding={-5}
        opener={<MoreButton aria-label="More options" canFocus={true} />}
      >
        <ListMenuItem
          onClick={() =>
            this.props.renameTest(this.props.test.name).then(name => {
              this.props.test.setName(name)
            })
          }
        >
          Rename
        </ListMenuItem>
        <ListMenuItem onClick={this.props.duplicateTest}>
          Duplicate
        </ListMenuItem>
        <ListMenuItem onClick={this.props.removeTest}>Delete</ListMenuItem>
        <ListMenuItem onClick={this.props.codeExport}>Export</ListMenuItem>
      </ListMenu>
    )
    //setting component of context menu.
    this.props.setContextMenu ? this.props.setContextMenu(listMenu) : null
    return <Test {...this.props} menu={listMenu} />
  }
}

export const DraggableTest = DropTarget(Type, testTarget, collectTarget)(
  DragSource(Type, testSource, collectSource)(Test)
)
