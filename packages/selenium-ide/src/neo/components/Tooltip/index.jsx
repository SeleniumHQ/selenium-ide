import React from 'react'
import ReactTooltip from 'react-tooltip'
import { reaction } from 'mobx'
import PlaybackState from '../../stores/view/PlaybackState'
import './style.css'

export default class Tooltip extends React.Component {
  constructor() {
    super()
    this.reactTooltipRef = React.createRef()
    this.hideToolbarWithKeyboard = this.hideToolbarWithKeyboard.bind(this)
    this.state = {
      show: false,
    }
  }
  componentDidMount() {
    this.disposeObserveToolbar = reaction(
      () => PlaybackState.isPlaying | PlaybackState.paused,
      () => {
        setTimeout(ReactTooltip.rebuild, 0)
      }
    )
    window.addEventListener('keydown', this.hideToolbarWithKeyboard)
  }
  componentWillUnmount() {
    this.disposeObserveToolbar()
    window.removeEventListener('keydown', this.hideToolbarWithKeyboard)
  }
  render() {
    return (
      <ReactTooltip
        className="se-tooltip"
        place="bottom"
        effect="solid"
        html={true}
        ref={this.reactTooltipRef}
        afterShow={() => this.setState({ show: true })}
        afterHide={() => this.setState({ show: false })}
        delayHide={500}
        {...this.props}
      />
    )
  }
  hideToolbarWithKeyboard(event) {
    // IME enabled, we ignore it to avoid problems
    if (event.isComposing || event.keyCode === 229) {
      return
    }
    switch (event.key) {
      case 'Esc': // IE/Edge specific value
      case 'Escape':
        // Since we are capturing the ESC, we should only do this if there is a tooltip opened
        if (this.reactTooltipRef.current && this.state.show) {
          // We hide every tooltip, even if we are not in focus following the major browsers behavior
          ReactTooltip.hide()
          // Acessibility behavior consumes the ESC when the tooltip is opened
          event.stopPropagation()
        }
        return
      default:
        return
    }
  }
}
