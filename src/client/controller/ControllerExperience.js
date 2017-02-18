import * as soundworks from 'soundworks/client';
const View = soundworks.View;

const viewTemplate = `
  <canvas class="background"></canvas>
  <div class="background fit-container"></div>
  <div class="foreground fit-container">
    <div class="section-center flex-center">
      <button class="btn" id="saw">saw</button>
      <button class="btn" id="sine">sine</button>
    </div>
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

    document.getElementById("saw").addEventListener("click", function(){
      this.send('play', 0);
    }.bind(this))


    document.getElementById("sine").addEventListener("click", function(){
      this.send('play', 1);
    }.bind(this))
  }

}


