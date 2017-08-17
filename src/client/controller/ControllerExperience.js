import * as soundworks from 'soundworks/client';
import score from '../shared/score'
import util from '../shared/util';

export default class ControllerExperience extends soundworks.ControllerExperience {

  constructor(assetsDomain) {
    super();
    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin', { showDialog: false });
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

  playingChanged(value) {
    if (this.firstCallback)
    {
      this.firstCallback = false;
      return;
    }

    const currentTime = this.sync.getSyncTime() + 1;
    var state = util.decodeState(this.params.getValue('state'));
    this.params.update('state', util.encodeState(value, state.index, currentTime));
  }

  nextTriggered() {
    const currentTime = this.sync.getSyncTime() + 1;
    var state = util.decodeState(this.params.getValue('state'));
    var index = util.increaseStateIndex(state.index);
    this.params.update('state', util.encodeState(state.playing, index, currentTime));
  }

  prevTriggered() {
    const currentTime = this.sync.getSyncTime() + 1;
    var state = util.decodeState(this.params.getValue('state'));
    var index = util.decreaseStateIndex(state.index);
    this.params.update('state',
      util.encodeState(state.playing, index, currentTime));
  }

}
