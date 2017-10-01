import * as soundworks from 'soundworks/client';

export default class ControllerExperience extends soundworks.ControllerExperience {

  constructor(assetsDomain) {
    super();
    this.params = this.require('shared-params');
    this.auth = this.require('auth');
  }

}
