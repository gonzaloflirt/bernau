import 'source-map-support/register'; // enable sourcemaps in node
import * as soundworks from 'soundworks/server';
import PlayerExperience from './PlayerExperience';
import ControllerExperience from './ControllerExperience';
import defaultConfig from './config/default';
import audioFileNames from '../client/shared/audioFileNames';

let config = null;

switch(process.env.ENV) {
  default:
    config = defaultConfig;
    break;
}

process.env.NODE_ENV = config.env;
soundworks.server.init(config);

const sharedParams = soundworks.server.require('shared-params');
for(var i in audioFileNames) {
  sharedParams.addTrigger(audioFileNames[i], 'trigger ' + audioFileNames[i]);
}
sharedParams.addBoolean('playing', 'playing', false);
sharedParams.addText('scene', 'scene', '0 0');

soundworks.server.setClientConfigDefinition((clientType, config, httpRequest) => {
  return {
    clientType: clientType,
    env: config.env,
    appName: config.appName,
    socketIO: config.socketIO,
    version: config.version,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain,
  };
});

const player = new PlayerExperience('player');

const controller = new ControllerExperience('controller');

soundworks.server.start();
