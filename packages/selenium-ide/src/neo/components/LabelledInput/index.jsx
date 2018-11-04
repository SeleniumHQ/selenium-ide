import React from 'react'
import PropTypes from 'prop-types'
import './style.css'

export default class LabelledInput extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    children: PropTypes.element,
    onChange: PropTypes.func,
  }
  static defaultProps = {
    type: 'text',
  }
  render() {
    const props = Object.assign({}, this.props, {
      onChange: e => {
        if (this.props.onChange) this.props.onChange(e.target.value)
      },
    })
    return (
      <div className="labelled-input">
        <label htmlFor={this.props.name}>{this.props.label}</label>
        {this.props.children ? this.props.children : <input {...props} />}
      </div>
    )
  }
}
