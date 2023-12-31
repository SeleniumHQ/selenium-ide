import BaseController from '../Base'

/**
 * This holds on to all commands currently in the command map.
 * It's primarily instrumented by loading plugins
 */
export default class ChannelsController extends BaseController {
  async send(channel: string, ...args: any[]) {
    await this.session.api.channels.onSend.dispatchEvent(channel, ...args)
  }
  // This needs to build after plugins
  priority = 5
}
