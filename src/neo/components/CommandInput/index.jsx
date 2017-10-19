import React from "react";
import PropTypes from "prop-types";
import Autocomplete from "react-autocomplete";
import Input from "../FormInput";
import CommandName from "../CommandName";
import { Commands, CommandsArray } from "../../models/Command";

export default class CommandInput extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired
  };
  render() {
    return (
      <Input name={this.props.name} label={this.props.label}>
        <Autocomplete
          getItemValue={(item) => (
            Commands[item]
          )}
          items={CommandsArray}
          shouldItemRender={(item, value) => (Commands[item].indexOf(value) !== -1)}
          renderItem={(item, isHighlighted) =>
            <div key={item} style={{
              background: isHighlighted ? "#f3f3f3" : "white",
              padding: "8px"
            }}>
              <CommandName>{item}</CommandName>
            </div>
          }
          menuStyle={{
            zIndex: 1,
            borderRadius: "3px",
            border: "1px solid #DEDEDE",
            boxShadow: "0 0 3px 0 rgba(0,0,0,0.3)",
            background: "rgba(255, 255, 255, 0.9)",
            padding: "2px 0",
            fontSize: "90%",
            position: "fixed",
            overflow: "auto",
            maxHeight: "30%"
          }}
          value={this.props.value}
          onChange={(e) => { this.props.onChange(e.target.value); }}
          onSelect={(value) => { this.props.onChange(value); }}
        />
      </Input>
    );
  }
}
