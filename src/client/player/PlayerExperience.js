import * as soundworks from 'soundworks/client';
import score from '../shared/score';
import util from '../shared/util';
import NoSleep from 'nosleep.js';

const audioContext = soundworks.audioContext;

const viewTemplate = `
  <canvas class="background" id="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle"></div>
    <div class="section-center flex-center"></div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

const model = { title: `B E R N A U` };
const maxNumChannels = 9;
var channelIndex = Math.floor((Math.random() * maxNumChannels)) % maxNumChannels;
var nodes = [];
var noSleep = new NoSleep();

export default class PlayerExperience extends soundworks.Experience {

  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: assetsDomain, files: score.files() });
    this.sync = this.require('sync');
    this.params = this.require('shared-params');
    this.scheduler = this.require('sync-scheduler');
  }

  start() {
    super.start();

    this.view = new soundworks.CanvasView(viewTemplate, model, {}, {
      id: this.id,
      preservePixelRatio: true,
    });

    this.show().then(() => {
      this.drawInitScreen();
    });

    this.stateDurations = util.stateDurations(this.audioBufferManager.data);

    this.listener = this.run.bind(this);
    document.documentElement.addEventListener('touchend', this.listener);
    document.documentElement.addEventListener('click', this.listener);

    window.addEventListener('resize', function(){ this.drawScreen(); }.bind(this))
  }

  run() {
    document.documentElement.removeEventListener('touchend', this.listener );
    document.documentElement.removeEventListener('click', this.listener );
    this.params.addParamListener('state', (value) => this.stateChanged(value));
    this.drawScreen();
    noSleep.enable();
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
    var buffer = this.audioBufferManager.data[bufferIndex];

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

  drawBackground(midText, bottomText) {
    const canvas = document.getElementById('background');
    const width = canvas.width;
    const height = canvas.height;
    var ctx = canvas.getContext('2d');
    var grd = ctx.createLinearGradient(0, 0, width, height);
    grd.addColorStop(0, 'purple');
    grd.addColorStop(1, 'green');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText(midText, width / 2, height / 2);
  }

  drawInitScreen() {
    this.drawBackground('Tap screen');
  }

  drawScreen() {
    this.drawBackground('group ' + (channelIndex + 1));
  }

}
