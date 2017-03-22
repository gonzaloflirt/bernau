import { Experience } from 'soundworks/server';

export default class ControllerExperience extends Experience {

  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.sync = this.require('sync');
    this.osc = this.require('osc');
  }

  start() {
    this.osc.receive('/play', (index) => {
      this.broadcastPlay(index)
    });

    this.osc.receive('/stop', () => {
      this.broadcastStop()
    });
  }

  enter(client) {
    super.enter(client);

    this.receive(client, 'play', (index) => {
      this.broadcastPlay(index)
    });

    this.receive(client, 'stop', () => {
      this.broadcastStop()
    });
  }

  exit(client) {
    super.exit(client);
    // ...
  }

  broadcastPlay(index) {
    var syncTime = this.sync.getSyncTime() + 2;
    this.broadcast(null, null, 'play', index, syncTime);
  }

  broadcastStop() {
    this.broadcast(null, null, 'stop');
  }
}
