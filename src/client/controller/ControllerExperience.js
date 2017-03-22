import * as soundworks from 'soundworks/client';
import audioFileNames from '../shared/audioFileNames';

const View = soundworks.View;

const viewTemplate = `
  <canvas class="background"></canvas>
  <div class="background fit-container"></div>
  <div class="foreground fit-container" id="foreground">
    <ol id="list"></ol>
  </div>
`;

export default class ControllerExperience extends soundworks.Experience {

  constructor() {
    super();
  }

  init() {
    this.viewTemplate = viewTemplate;
    this.viewCtor = View;
    this.view = this.createView();
  }

  start() {
    super.start();

    if (!this.hasStarted)
      this.init();

    this.show();

    audioFileNames.forEach(function(name, index) {
      var btn = document.createElement('btn')
      btn.appendChild(document.createTextNode(name))
      btn.style.width = '200px'
      btn.style.padding = '20px 20px 20px 20px'
      btn.style.display='inline-block'
      btn.style.fontSize = 'large'
      btn.addEventListener("click", function(){
        this.send('play', index)
      }.bind(this))
      document.getElementById('list').append(btn)
    }.bind(this))

    var btn = document.createElement('btn')
    btn.appendChild(document.createTextNode("stop"))
    btn.style.width = '200px'
    btn.style.padding = '20px 20px 20px 20px'
    btn.style.display='inline-block'
    btn.style.fontSize = 'large'
    btn.style.color = 'red'
    btn.addEventListener("click", function(){
      this.send('stop')
    }.bind(this))
    document.getElementById('list').append(btn)
  }

}


