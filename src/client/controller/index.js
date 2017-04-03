import * as soundworks from 'soundworks/client';
import ControllerExperience from './ControllerExperience';
import viewTemplates from '../shared/viewTemplates';
import viewContent from '../shared/viewContent';
import audioFileNames from '../shared/audioFileNames';

const files = audioFileNames.map(function(name) {
  return 'sounds/' + name + '.mp3'
});

window.addEventListener('load', () => {
  const { appName, clientType, socketIO, assetsDomain }  = window.soundworksConfig;

  soundworks.client.init(clientType, { appName, socketIO });
  soundworks.client.setViewContentDefinitions(viewContent);
  soundworks.client.setViewTemplateDefinitions(viewTemplates);

  const experience = new ControllerExperience(files);

  soundworks.client.start();
});
