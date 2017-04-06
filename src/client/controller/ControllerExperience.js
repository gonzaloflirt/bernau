import * as soundworks from 'soundworks/client';
import score from '../shared/score'
import util from '../shared/util';

export default class ControllerExperience extends soundworks.BasicSharedController {

  constructor(options) {
    super(options);

    this.params = this.require('shared-params');
    this.sync = this.require('sync');
    this.loader = this.require('loader', {
      files: score.files(),
    });
  }

  start() {
    super.start();
    this.firstCallback = true;
    this.stateDurations = util.stateDurations(this.loader.buffers);
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
