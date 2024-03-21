import React, { ChangeEvent, FocusEvent } from 'react';

type Props = React.HTMLAttributes<HTMLInputElement> & {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onFocus: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement>) => void;
}

type State = {
  isFocused: boolean;
  currentValue: string;
}

class Input extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {}
  };

  state: State = {
    isFocused: false,
    currentValue: this.props.value
  };

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    // This lifecycle method does not have access to 'this',
    // so you cannot directly compare with 'this.state'.
    // Instead, it receives the next props and previous state:
    if (!prevState.isFocused) {
      return { currentValue: nextProps.value };
    }
    return null; // Return null to indicate no change to state.
  }

  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ currentValue: e.target.value });
    this.props.onChange(e);
  };

  handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    this.setState({ isFocused: true });
    this.props.onFocus(e);
  };

  handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    this.setState({ isFocused: false });
    this.props.onBlur(e);
  };

  render() {
    // Destructuring to avoid passing internal methods or state as props to the input element
    const { value, onChange, onFocus, onBlur, ...rest } = this.props;
    return (
      <input
        {...rest}
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        value={this.state.currentValue}
      />
    );
  }
}

export default Input;
