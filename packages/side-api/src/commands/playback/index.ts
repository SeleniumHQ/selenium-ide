import type { Shape as OnAfter } from './onAfter'
import type { Shape as OnAfterAll } from './onAfterAll'
import type { Shape as OnBefore } from './onBefore'
import type { Shape as OnBeforeAll } from './onBeforeAll'
import type { Shape as OnPlayUpdate } from './onPlayUpdate'
import type { Shape as OnStepUpdate } from './onStepUpdate'
import type { Shape as Pause } from './pause'
import type { Shape as Play } from './play'
import type { Shape as PlaySuite } from './playSuite'
import type { Shape as Resume } from './resume'
import type { Shape as Stop } from './stop'

import * as onAfter from './onAfter'
import * as onAfterAll from './onAfterAll'
import * as onBefore from './onBefore'
import * as onBeforeAll from './onBeforeAll'
import * as onPlayUpdate from './onPlayUpdate'
import * as onStepUpdate from './onStepUpdate'
import * as pause from './pause'
import * as play from './play'
import * as playSuite from './playSuite'
import * as resume from './resume'
import * as stop from './stop'

export const commands = {
  onAfter,
  onAfterAll,
  onBefore,
  onBeforeAll,
  onPlayUpdate,
  onStepUpdate,
  pause,
  play,
  playSuite,
  resume,
  stop,
}

/**
 * The API and hooks governing playback on our webdriver instance
 */
export type Shape = {
  onAfter: OnAfter
  onAfterAll: OnAfterAll
  onBefore: OnBefore
  onBeforeAll: OnBeforeAll
  onPlayUpdate: OnPlayUpdate
  onStepUpdate: OnStepUpdate
  pause: Pause
  play: Play
  playSuite: PlaySuite
  resume: Resume
  stop: Stop
}
