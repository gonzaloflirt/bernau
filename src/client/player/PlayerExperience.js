import * as soundworks from 'soundworks/client';
import score from '../shared/score';
import util from '../shared/util';

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
var nodes = [];

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
    this.scheduler = this.require('scheduler');
  }

  init() {
    this.viewTemplate = viewTemplate;
    this.viewContent = { title: `B E R N A U` };
    this.viewCtor = soundworks.CanvasView;
    this.viewOptions = { preservePixelRatio: true };
    this.view = this.createView();
    this.stateDurations = util.stateDurations(this.loader.buffers);

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

    this.params.addParamListener('state', (value) => this.stateChanged(value));

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

  currentTime() {
    return this.sync.getSyncTime() + 0.1; // some buffer time...
  }

  stateChanged(value) {
    var state = util.decodeState(value);
    this.stop();
    if (state.playing)
    {
      this.startPlayback(state.index, state.time);
    }
  }

  startPlayback(index, time) {
    var current = util.currentIndex(this.currentTime(), index, time, this.stateDurations);
    this.startScene(current.index, current.time);
  }

  startScene(index, time) {
    var bufferIndex = score.index(index, channelIndex);
    var buffer = this.loader.buffers[bufferIndex];

    var currentTime = this.currentTime();

    var startTime = time;
    var position = 0;

    if (currentTime > time) {
      startTime = currentTime;
      position = startTime - time;
    }

    if (position > buffer.duration) {
      return;
    }

    nodes[index] = {
      gain: audioContext.createGain(),
      bufferSource: audioContext.createBufferSource()
    };
    nodes[index].gain.gain.value = 1e-35;
    nodes[index].bufferSource.buffer = buffer;
    nodes[index].bufferSource.connect(nodes[index].gain);
    nodes[index].gain.connect(audioContext.destination);
    nodes[index].bufferSource.start(this.sync.getAudioTime(startTime), position);
    nodes[index].gain.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + 0.2);

    const nextIndex = util.increaseStateIndex(index);
    const nextTime = startTime + buffer.duration - position;

    this.scheduler.defer(
      function() { this.startScene(nextIndex, nextTime) }.bind(this, nextIndex, nextTime),
      nextTime - 0.2);
  }

  stop() {
    this.scheduler.clear();
    const time = audioContext.currentTime + 0.2;
    for (const i in nodes) {
      try {
        nodes[i].gain.gain.exponentialRampToValueAtTime(1e-35, time);
        nodes[i].bufferSource.stop(time);
        nodes[i].gain.stop(time);
      }
      catch(err) {}
    }
  }

  iterateChannelIndex() {
    this.stop();
    channelIndex = (channelIndex + 1) % 2;
    document.getElementById('channel').innerHTML = channelIndex == 0 ? 'left' : 'right';
    this.stateChanged(this.params.getValue('state'));
  }

}
