import { Experience } from 'soundworks/server';

export default class ControllerExperience extends Experience {

  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.sync = this.require('sync');
    this.params = this.require('shared-params');
    this.auth = this.require('auth');
  }

  start() { }

  enter(client) {
    super.enter(client);
  }

  exit(client) {
    super.exit(client);
  }

}
