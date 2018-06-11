import React from "react";
import { shallow } from "enzyme";
import CommandReference from "../../../components/CommandReference"

describe("<CommandReference currentCommand={}/>", () => {
  it("should render a `.command-reference`", () => {
    const wrapper = shallow(<CommandReference currentCommand={{name: "blah"}}/>);
    expect(wrapper.find(".command-reference")).toHaveClassName("command-reference");
  });
});
