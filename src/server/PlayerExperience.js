import { Experience } from 'soundworks/server';

export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.sync = this.require('sync');
    this.params = this.require('shared-params');
  }

  start() {}

  enter(client) {
    super.enter(client);

    const numPlayers = this.clients.length
    const maxPlayers = Number(this.params.params.maxPlayers.data.value); // getValue()???
    this.params.update('numPlayers', numPlayers);
    this.params.update('maxPlayers', Math.max(numPlayers, maxPlayers));
  }

  exit(client) {
    super.exit(client);
    this.params.update('numPlayers', this.clients.length);
  }
}
