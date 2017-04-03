import * as soundworks from 'soundworks/server';
import audioFileNames from '../client/shared/audioFileNames';

export default class ControllerExperience extends soundworks.BasicSharedController {

  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedConfig = this.require('shared-config');
    this.sync = this.require('sync');
    this.osc = this.require('osc');
    this.params = this.require('shared-params');
  }

  start() {
    this.osc.receive('/play', (index) => {
      this.startScene(index);
    });

    this.osc.receive('/stop', () => {
      this.setPlaying(false);
    });

    for(const i in audioFileNames) {
      this.params.addParamListener(audioFileNames[i], () => this.startScene(i));
    }
  }

  enter(client) {
    super.enter(client);
  }

  exit(client) {
    super.exit(client);
    // ...
  }

  setPlaying(value) {
    this.params.params['playing'].update(value);
  }

  startScene(index) {
    var syncTime = this.sync.getSyncTime() + 1;
    this.params.params['scene'].update(index.toString() + ' ' + syncTime.toString());
  }

}
