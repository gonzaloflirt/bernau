import { Experience } from 'soundworks/server';

export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
  }

  start() {}

  enter(client) {
    super.enter(client);
    // ...
  }

  exit(client) {
    super.exit(client);
    // ...
  }
}
