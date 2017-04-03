import * as soundworks from 'soundworks/client';

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

  constructor(assetsDomain, audioFiles) {
    super();

    this.platform = this.require('platform', { features: ['web-audio', 'wake-lock'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.loader = this.require('loader', {
      assetsDomain: assetsDomain,
      files: audioFiles,
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

    this.params.addParamListener('playing', (value) => this.playingChanged(value));
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

  playingChanged(value) {
    if (!value) {
      this.stop();
    }
  }

  sceneChanged(value) {
    var items = value.split(' ');
    this.startScene(Number(items[0]), Number(items[1]));
  }

  startScene(index, time) {
    var fileBuffer = this.loader.buffers[index];

    var currentTime = this.sync.getSyncTime() + 0.1;

    var startTime = time;
    var position = 0;

    if (currentTime > time) {
      startTime = currentTime;
      position = startTime - time;
    }

    if (position > fileBuffer.duration) {
      return;
    }

    var samples = fileBuffer.getChannelData(channelIndex % fileBuffer.numberOfChannels);

    var buffer =
      audioContext.createBuffer(1, fileBuffer.length, audioContext.sampleRate);

    var channel = buffer.getChannelData(0);
    for (var j = 0; j < fileBuffer.length; j++) {
      channel[j] = samples[j];
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
