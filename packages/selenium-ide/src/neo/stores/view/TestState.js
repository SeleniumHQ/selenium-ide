import { reaction, observable } from 'mobx'

export default class SuiteState {
  @observable
  modified = false
  @observable
  selectedCommand = null
  @observable
  scrollY = null

  constructor(test) {
    this.changeDisposer = reaction(
      () =>
        test.commands.map(({ command, target, value }) => ({
          command,
          target,
          value,
        })),
      () => {
        this.modified = true
      }
    )
    this.dispose = this.dispose.bind(this)
  }

  dispose() {
    this.changeDisposer()
  }
}
