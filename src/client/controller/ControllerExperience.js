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

}
