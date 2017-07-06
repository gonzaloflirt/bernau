import * as soundworks from 'soundworks/client';
import score from '../shared/score'
import util from '../shared/util';

export default class ControllerExperience extends soundworks.ControllerExperience {

  constructor(assetsDomain) {
    super();
    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: assetsDomain, files: score.files() });
    this.sync = this.require('sync');
    this.params = this.require('shared-params');
    this.auth = this.require('auth');
  }

  start() {
    super.start();
    this.firstCallback = true;
    this.stateDurations = util.stateDurations(this.audioBufferManager.data);
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

    var index = state.index;
    if (!value) {
      var current = util.currentIndex(currentTime, index, state.time, this.stateDurations);
      index = current.index;
    }

    this.params.params['state'].update(util.encodeState(value, index, currentTime));
  }

  nextTriggered() {
    const currentTime = this.sync.getSyncTime() + 1;
    var state = util.decodeState(this.params.getValue('state'));
    var current =
    util.currentIndex(currentTime, state.index, state.time, this.stateDurations);
    var index = util.increaseStateIndex(current.index);
    this.params.update('state',
      util.encodeState(state.playing, index, currentTime));
  }

  prevTriggered() {
    const currentTime = this.sync.getSyncTime() + 1;
    var state = util.decodeState(this.params.getValue('state'));
    var current =
    util.currentIndex(currentTime, state.index, state.time, this.stateDurations);
    var index = util.decreaseStateIndex(current.index);
    this.params.update('state',
      util.encodeState(state.playing, index, currentTime));
  }

}
