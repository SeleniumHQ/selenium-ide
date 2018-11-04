import React from 'react'
import ReactTooltip from 'react-tooltip'
import { reaction } from 'mobx'
import PlaybackState from '../../stores/view/PlaybackState'
import './style.css'

export default class Tooltip extends React.Component {
  componentDidMount() {
    this.disposeObserveToolbar = reaction(
      () => PlaybackState.isPlaying | PlaybackState.paused,
      () => {
        setTimeout(ReactTooltip.rebuild, 0)
      }
    )
  }
  componentWillUnmount() {
    this.disposeObserveToolbar()
  }
  render() {
    return (
      <ReactTooltip
        className="se-tooltip"
        place="bottom"
        effect="solid"
        html={true}
        {...this.props}
      />
    )
  }
}
