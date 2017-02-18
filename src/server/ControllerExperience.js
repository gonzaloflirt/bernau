import { Experience } from 'soundworks/server';

export default class ControllerExperience extends Experience {

  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
  }

  start() {
    // ...
  }

  enter(client) {
    super.enter(client);
    this.receive(client, 'play', (index) => {
      this.broadcast(null, null, 'play', index);
    });
  }

  exit(client) {
    super.exit(client);
    // ...
  }
}
