import * as soundworks from 'soundworks/client';
import score from '../shared/score'

var scene = -1;

export default class ControllerExperience extends soundworks.BasicSharedController {

  constructor(options) {
    super(options);

    this.params = this.require('shared-params');
    this.scheduler = this.require('scheduler');
    this.sync = this.require('sync');
    this.loader = this.require('loader', {
      files: score.files(),
    });
  }

  start() {
    super.start();
    this.params.addParamListener('playing', (value) => this.playingChanged(value));
  }

  playingChanged(value) {
    if (value) {
      scene = -1;
      this.iterateScene();
    }
  }

  iterateScene() {
    if (this.sharedParams.params['playing'].value)
    {
      scene = (scene + 1) % score.length();
      var syncTime = this.sync.getSyncTime() + 1;
      this.params.params['scene'].update(scene.toString() + ' ' + syncTime.toString());
      var sceneDuration = this.loader.buffers[score.index(scene, 0)].duration;
      this.scheduler.defer(function(){
        this.iterateScene() }.bind(this),
        this.sync.getSyncTime() + sceneDuration);
    }
  }
}
