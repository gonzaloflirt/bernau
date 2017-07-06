import 'source-map-support/register'; // enable sourcemaps in node
import path from 'path';
import * as soundworks from 'soundworks/server';
import PlayerExperience from './PlayerExperience';
import ControllerExperience from './ControllerExperience';

const configName = process.env.ENV || 'default';
const configPath = path.join(__dirname, 'config', configName);
let config = null;

try {
  config = require(configPath).default;
} catch(err) {
  console.error(`Invalid ENV "${configName}", file "${configPath}.js" not found`);
  process.exit(1);
}

process.env.NODE_ENV = config.env;
soundworks.server.init(config);

const sharedParams = soundworks.server.require('shared-params');
sharedParams.addBoolean('playing', 'playing', false);
sharedParams.addTrigger('next', '>>');
sharedParams.addTrigger('prev', '<<');
sharedParams.addText('state', 'state', 'false 0 0');
sharedParams.addText('numPlayers', 'num players', '0');
sharedParams.addText('maxPlayers', 'max num players', '0');

soundworks.server.setClientConfigDefinition((clientType, config, httpRequest) => {
  return {
    clientType: clientType,
    env: config.env,
    appName: config.appName,
    websockets: config.websockets,
    version: config.version,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain,
  };
});

const player = new PlayerExperience('player');

const controller = new ControllerExperience('controller');

soundworks.server.start();
