import React from "react";
import PropTypes from "prop-types";
import Autocomplete from "react-autocomplete";
import Input from "../FormInput";
import { CommandsDictionary } from "../CommandName";

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
            CommandsDictionary[item]
          )}
          items={Object.keys(CommandsDictionary)}
          shouldItemRender={(item, value) => (CommandsDictionary[item].indexOf(value) !== -1)}
          renderItem={(item, isHighlighted) =>
            <div key={item} style={{
              background: isHighlighted ? "#f4f4f4" : "white",
              padding: "8px"
            }}>
              {CommandsDictionary[item]}
            </div>
          }
          menuStyle={{
            zIndex: 1,
            borderRadius: "3px",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
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
