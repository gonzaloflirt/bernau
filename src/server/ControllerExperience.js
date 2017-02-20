import { Experience } from 'soundworks/server';

export default class ControllerExperience extends Experience {

  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.sync = this.require('sync');
  }

  start() {
    // ...
  }

  enter(client) {
    super.enter(client);
    this.receive(client, 'play', (index) => {
      var syncTime = this.sync.getSyncTime() + 2;
      this.broadcast(null, null, 'play', index, syncTime);
    });
  }

  exit(client) {
    super.exit(client);
    // ...
  }
}
