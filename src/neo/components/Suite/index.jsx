import React from "react";
import PropTypes from "prop-types";
import { PropTypes as MobxPropTypes } from "mobx-react";
import { DropTarget } from "react-dnd";
import classNames from "classnames";
import styled from "styled-components";
import TestList from "../TestList";
import { Type } from "../Test";
import ListMenu, { ListMenuItem } from "../ListMenu";
import MoreButton from "../ActionButtons/More";
import tick from "../../images/ic_tick.svg";
import "./style.css";

function containsTest(tests, test) {
  return tests.find((currTest) => (currTest.id === test.id));
}

const testTarget = {
  canDrop(props, monitor) {
    const test = monitor.getItem();
    return !containsTest(props.tests, test);
  },
  drop(props, monitor) {
    if (monitor.didDrop()) {
      return;
    }

    props.moveTest(monitor.getItem(), props.id);
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
  display: flex;
  &:before {
    mask-image: url(${tick});
    content: " ";
    width: 9px;
    height: 9px;
    background-color: ${props => props.isActive ? "#40A6FF" : "#505050"};
    display: inline-block;
    transform: ${props => props.isActive ? "rotate(90deg)" : "rotate(0deg)"};
    transition: all 100ms linear;
    align-self: center;
  }
`;

class Suite extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isActive: false
    };
    this.handleClick = this.handleClick.bind(this);
  }
  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    tests: MobxPropTypes.arrayOrObservableArray.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    moveTest: PropTypes.func.isRequired,
    isOver: PropTypes.bool,
    canDrop: PropTypes.bool
  };
  handleClick() {
    this.setState({
      isActive: !this.state.isActive
    });
  }
  render() {
    return this.props.connectDropTarget(
      <div>
        <div className="project">
          <a href="#" className={classNames({"hover": (this.props.isOver && this.props.canDrop)})} onClick={this.handleClick}>
            <ArrowProject isActive={this.state.isActive}>
              <span className="title">{this.props.name}</span>
            </ArrowProject>
          </a>
          <ListMenu width={130} opener={
            <MoreButton />
          }>
            <ListMenuItem>Add tests</ListMenuItem>
            <ListMenuItem onClick={this.props.remove}>Delete</ListMenuItem>
          </ListMenu>
        </div>
        <TestList collapsed={!this.state.isActive} suite={this.props.id} tests={this.props.tests} />
      </div>
    );
  }
}

export default DropTarget(Type, testTarget, collect)(Suite);
