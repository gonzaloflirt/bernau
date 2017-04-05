import * as soundworks from 'soundworks/client';
import score from '../shared/score';

const audioContext = soundworks.audioContext;

const viewTemplate = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle"></div>
    <div class="section-center flex-center"></div>
    <div class="section-bottom flex-middle">
      <p class="small" id="channel">left</p>
    </div>
  </div>
`;

var channelIndex = 0;
var bufferSources = [];

export default class PlayerExperience extends soundworks.Experience {

  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio', 'wake-lock'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.loader = this.require('loader', {
      assetsDomain: assetsDomain,
      files: score.files(),
    });
    this.sync = this.require('sync');
    this.params = this.require('shared-params');
  }

  init() {
    this.viewTemplate = viewTemplate;
    this.viewContent = { title: `B E R N A U` };
    this.viewCtor = soundworks.CanvasView;
    this.viewOptions = { preservePixelRatio: true };
    this.view = this.createView();

    document.documentElement.addEventListener("touchend", function(){
      this.iterateChannelIndex();
    }.bind(this))

    document.documentElement.addEventListener("click", function(){
      this.iterateChannelIndex();
    }.bind(this))
  }

  start() {
    super.start();

    if (!this.hasStarted)
      this.init();

    this.show();

    this.params.addParamListener('scene', (value) => this.sceneChanged(value));

    this.renderer = new soundworks.Renderer(100, 100);
    this.view.addRenderer(this.renderer);

    this.view.setPreRender(function(ctx, dt) {
      ctx.save();
      var grd = ctx.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
      grd.addColorStop(0, "purple");
      grd.addColorStop(1, "green");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      ctx.restore();
    });
  }

  decodeScene(value) {
    var items = value.split(' ');
    return {playing: items[0] == 'true', index: Number(items[1]), time: Number(items[2])};
  }

  sceneChanged(value) {
    var state = this.decodeScene(value);
    if (state.playing)
    {
      this.startScene(state.index, state.time);
    }
    else {
      this.stop()
    }
  }

  startScene(index, time) {
    var bufferIndex = score.index(index, channelIndex);
    var buffer = this.loader.buffers[bufferIndex];

    var currentTime = this.sync.getSyncTime() + 0.1;

    var startTime = time;
    var position = 0;

    if (currentTime > time) {
      startTime = currentTime;
      position = startTime - time;
    }

    if (position > buffer.duration) {
      return;
    }

    bufferSources[index] = audioContext.createBufferSource();
    bufferSources[index].buffer = buffer;
    bufferSources[index].connect(audioContext.destination);
    bufferSources[index].start(this.sync.getAudioTime(startTime), position);
  }

  stop() {
    for (var i in bufferSources) {
      try {
        bufferSources[i].stop();
      }
      catch(err) {}
    }
  }

  iterateChannelIndex() {
    this.stop();
    channelIndex = (channelIndex + 1) % 2;
    document.getElementById('channel').innerHTML = channelIndex == 0 ? 'left' : 'right';
    this.sceneChanged(this.params.params['scene'].value);
  }

}
