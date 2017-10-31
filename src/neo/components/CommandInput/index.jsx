import React from "react";
import PropTypes from "prop-types";
import AutoComplete from "../AutoComplete";
import Input from "../FormInput";
import CommandName from "../CommandName";
import { Commands, CommandsArray } from "../../models/Command";

export default class CommandInput extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func
  };
  render() {
    return (
      <Input name={this.props.name} label={this.props.label}>
        <AutoComplete
          getItemValue={(item) => (
            Commands[item]
          )}
          items={CommandsArray}
          shouldItemRender={(item, value) => (Commands[item].indexOf(value) !== -1)}
          renderDefaultStyledItem={(item) =>
            <CommandName>{item}</CommandName>
          }
          value={this.props.value}
          inputProps={{disabled: this.props.disabled}}
          onChange={(e) => { if (this.props.onChange) this.props.onChange(e.target.value); }}
          onSelect={(value) => { if (this.props.onChange) this.props.onChange(value); }}
        />
      </Input>
    );
  }
}
