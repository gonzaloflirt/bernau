import { Experience } from 'soundworks/server';
import score from '../client/shared/score'
import util from '../client/shared/util';

export default class ControllerExperience extends Experience {

  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.sync = this.require('sync');
    this.params = this.require('shared-params');
    this.auth = this.require('auth');
  }

  start() {
    super.start();
    this.firstCallback = true;
    this.params.addParamListener('playing', (value) => this.playingChanged(value));
    this.params.addParamListener('next', () => this.nextTriggered());
    this.params.addParamListener('prev', () => this.prevTriggered());
  }

  state() {
    return util.decodeState(this.params.params.state.data.value);
  }

  playingChanged(value) {
    if (this.firstCallback)
    {
      this.firstCallback = false;
      return;
    }

    const currentTime = this.sync.getSyncTime() + 1;
    this.params.update('state', util.encodeState(value, this.state().index, currentTime));
  }

  nextTriggered() {
    const currentTime = this.sync.getSyncTime() + 1;
    var state = this.state();
    var index = util.increaseStateIndex(state.index);
    this.params.update('state', util.encodeState(state.playing, index, currentTime));
  }

  prevTriggered() {
    const currentTime = this.sync.getSyncTime() + 1;
    var state = this.state();
    var index = util.decreaseStateIndex(state.index);
    this.params.update('state', util.encodeState(state.playing, index, currentTime));
  }

  enter(client) {
    super.enter(client);
  }

  exit(client) {
    super.exit(client);
  }

}
