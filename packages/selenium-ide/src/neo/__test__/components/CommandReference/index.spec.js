import React from "react";
import {renderIntoDocument, cleanup} from "react-testing-library";
import CommandReference from "../../../components/CommandReference"

describe("<CommandReference />", () => {
  afterEach(cleanup);
  it("should render a name", () => {
    const { container } = renderIntoDocument(<CommandReference currentCommand={{name: "name"}}/>);
    const commandName = container.querySelector(".name");
    expect(commandName).toHaveTextContent("name ");
  });
  it("should render a name with a target", () => {
    const { container } = renderIntoDocument(<CommandReference currentCommand={{name: "name", target: {name: "target"}}}/>);
    const commandName = container.querySelector(".name");
    expect(commandName).toHaveTextContent("name target");
  });
  it("should render a name with a target and a value", () => {
    const { container } = renderIntoDocument(<CommandReference currentCommand={{name: "name", target: {name: "target"}, value: {name: "value"}}}/>);
    const commandName = container.querySelector(".name");
    expect(commandName).toHaveTextContent("name target, value");
  });
  it("should render a description", () => {
    const { container } = renderIntoDocument(<CommandReference currentCommand={{description: "description"}}/>);
    const commandDescription = container.querySelector(".description");
    expect(commandDescription).toHaveTextContent("description");
  });
  it("should render an argument", () => {
    const { container } = renderIntoDocument(<CommandReference currentCommand={{name: "name", target: {name: "target name", value: "target value"}}}/>);
    const commandArgument = container.querySelector(".argument");
    expect(commandArgument).toHaveTextContent("target name - target value");
  });
});
