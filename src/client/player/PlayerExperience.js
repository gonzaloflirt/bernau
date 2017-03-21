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

    this.receive('play', (index, time) => {

      var fileBuffer = this.loader.buffers[index];
      var samples = fileBuffer.getChannelData(channelIndex % fileBuffer.numberOfChannels);

      var buffer =
        audioContext.createBuffer(1, fileBuffer.length, audioContext.sampleRate);

      var channel = buffer.getChannelData(0);
      for (var j = 0; j < fileBuffer.length; j++) {
        channel[j] = samples[j];
      }

      const src = audioContext.createBufferSource();
      src.buffer = buffer;
      src.connect(audioContext.destination);
      src.start(this.sync.getAudioTime(time));
    });

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

  iterateChannelIndex() {
    channelIndex = (channelIndex + 1) % 2;
    document.getElementById("channel").innerHTML = channelIndex == 0 ? "left" : "right";
  }

}
