import { Shape as onAfter } from './onAfter'
import { Shape as onAfterAll } from './onAfterAll'
import { Shape as onBefore } from './onBefore'
import { Shape as onBeforeAll } from './onBeforeAll'
import { Shape as onPlayUpdate } from './onPlayUpdate'
import { Shape as onStepUpdate } from './onStepUpdate'
import { Shape as pause } from './pause'
import { Shape as play } from './play'
import { Shape as playSuite } from './playSuite'
import { Shape as resume } from './resume'
import { Shape as stop } from './stop'

export * as onAfter from './onAfter'
export * as onAfterAll from './onAfterAll'
export * as onBefore from './onBefore'
export * as onBeforeAll from './onBeforeAll'
export * as onPlayUpdate from './onPlayUpdate'
export * as onStepUpdate from './onStepUpdate'
export * as pause from './pause'
export * as play from './play'
export * as playSuite from './playSuite'
export * as resume from './resume'
export * as stop from './stop'

/**
 * The API and hooks governing playback on our webdriver instance
 */
export type Shape = {
  onAfter: onAfter
  onAfterAll: onAfterAll
  onBefore: onBefore
  onBeforeAll: onBeforeAll
  onPlayUpdate: onPlayUpdate
  onStepUpdate: onStepUpdate
  pause: pause
  play: play
  playSuite: playSuite
  resume: resume
  stop: stop
}
