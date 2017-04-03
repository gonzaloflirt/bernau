import * as soundworks from 'soundworks/client';
import ControllerExperience from './ControllerExperience';
import viewTemplates from '../shared/viewTemplates';
import viewContent from '../shared/viewContent';

window.addEventListener('load', () => {
  const { appName, clientType, socketIO, assetsDomain }  = window.soundworksConfig;

  soundworks.client.init(clientType, { appName, socketIO });
  soundworks.client.setViewContentDefinitions(viewContent);
  soundworks.client.setViewTemplateDefinitions(viewTemplates);

  const experience = new ControllerExperience();

  soundworks.client.start();
});
