import * as soundworks from 'soundworks/server';
import score from '../client/shared/score'

export default class ControllerExperience extends soundworks.BasicSharedController {

  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.sync = this.require('sync');
    this.params = this.require('shared-params');
  }

  start() {
  }

  enter(client) {
    super.enter(client);
  }

  exit(client) {
    super.exit(client);
    // ...
  }

}
