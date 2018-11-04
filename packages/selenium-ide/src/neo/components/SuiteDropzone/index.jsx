import React from 'react'
import PropTypes from 'prop-types'
import { DropTarget } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'

const boxTarget = {
  drop(props, monitor) {
    const files = monitor.getItem().files
    if (props.loadProject && files.length && /\.side$/.test(files[0].name)) {
      props.loadProject(files[0])
    }
  },
}

@DropTarget(NativeTypes.FILE, boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))
export default class SuiteDropzone extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    loadProject: PropTypes.func,
    connectDropTarget: PropTypes.func.isRequired,
  }
  render() {
    return this.props.connectDropTarget(<div>{this.props.children}</div>)
  }
}
