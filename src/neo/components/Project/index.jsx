import React from "react";
import PropTypes from "prop-types";
import { DropTarget } from "react-dnd";
import classNames from "classnames";
import styled from "styled-components";
import TestList from "../TestList";
import { Type } from "../Test";
import tick from "../../images/ic_tick.svg";
import folder from "../../images/ic_folder.svg";
import "./style.css";

function containsTest(tests, test) {
  return tests.find((currTest) => (currTest.id === test.id));
}

const testTarget = {
  canDrop(props, monitor) {
    const test = monitor.getItem();
    return !containsTest(props.tests, test);
  },
  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      return;
    }

    props.moveTest(monitor.getItem(), props.name);
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
}

const ArrowProject = styled.span`
  &:before {
    mask-image: url(${tick});
    content: " ";
    width: 9px;
    height: 9px;
    background-color: ${props => props.isActive ? "#40A6FF" : "#505050"};
    display: inline-block;
    transform: ${props => props.isActive ? "rotate(90deg)" : "rotate(0deg)"};
    transition: all 100ms linear;
    vertical-align: middle;
  }
`;

class Project extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isActive: false
    };
    this.handleClick = this.handleClick.bind(this);
  }
  static propTypes = {
    name: PropTypes.string.isRequired,
    tests: PropTypes.array.isRequired,
    selectedTest: PropTypes.string,
    selectTest: PropTypes.func.isRequired
  };
  handleClick() {
    this.setState({
      isActive: !this.state.isActive
    });
  }
  render() {
    return this.props.connectDropTarget(
      <div className={classNames("project", {"hover": (this.props.isOver && this.props.canDrop)})}>
        <a href="#" onClick={this.handleClick}>
          <ArrowProject isActive={this.state.isActive}>
            <img src={folder} alt="project" />
            <span className="title">{this.props.name}</span>
          </ArrowProject>
        </a>
        <TestList collapsed={!this.state.isActive} project={this.props.name} tests={this.props.tests} selectedTest={this.props.selectedTest} selectTest={this.props.selectTest} />
      </div>
    );
  }
}

export default DropTarget(Type, testTarget, collect)(Project);
