import * as soundworks from 'soundworks/client';
import score from '../shared/score';
import util from '../shared/util';
import NoSleep from 'nosleep.js';

const audioContext = soundworks.audioContext;

const viewTemplate = `
  <canvas class="background" id="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle" id="top"></div>
    <div class="section-center flex-center" id="center"></div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

const model = { title: `B E R N A U` };
var nodes = {};
var noSleep = new NoSleep();

export default class PlayerExperience extends soundworks.Experience {

  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.audioBufferManager = this.require('audio-buffer-manager');
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
      this.drawBackground();
      this.drawGroupSelectScreen();
    });

    window.addEventListener('resize', function(){ this.drawScreen(); }.bind(this))
  }

  run() {
    document.documentElement.removeEventListener('touchend', this.listener );
    document.documentElement.removeEventListener('click', this.listener );
    this.drawBackground('Loading sound files...');
    this.removeGroupSelectScreen();
    noSleep.enable();
    this.audioBufferManager.loadFiles(score.files(this.group)).then(()=> {
      this.drawScreen();
      this.params.addParamListener('state', (value) => this.stateChanged(value));
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
      this.startScene(state.index, state.time);
    }
  }

  startScene(index, time) {
    var buffer = this.audioBufferManager.data[index];

    var currentTime = this.currentTime();

    var startTime = time > currentTime ? time : currentTime;
    var position = time > currentTime ? 0 : currentTime - time;

    while (position > buffer.duration)
    {
      position -= buffer.duration;
    }

    nodes = {
      gain: audioContext.createGain(),
      bufferSource: audioContext.createBufferSource()
    };
    nodes.gain.gain.value = 1e-35;
    nodes.bufferSource.buffer = buffer;
    nodes.bufferSource.connect(nodes.gain);
    nodes.gain.connect(audioContext.destination);
    nodes.bufferSource.loop = true;
    nodes.bufferSource.start(this.sync.getAudioTime(startTime), position);
    nodes.gain.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + 0.2);
  }

  stop() {
    this.scheduler.clear();
    const time = audioContext.currentTime + 0.2;
    try {
      nodes.gain.gain.exponentialRampToValueAtTime(1e-35, time);
      nodes.bufferSource.stop(time);
      nodes.gain.stop(time);
    }
    catch(err) {}
  }

  drawBackground(text = '') {
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
    ctx.font = '18px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText(text, width / 2, height / 2);
  }

  drawScreen() {
    if (this.group == null)
    {
      this.drawBackground('');
    }
    else
    {
      this.drawBackground('group ' + (this.group + 1));
    }
  }

  drawGroupSelectScreen() {
    var top = document.getElementById('top');
    var txt = document.createElement('div');
    txt.innerHTML += 'Please select a group';
    txt.id = 'groupText';
    top.appendChild(txt);

    var table = document.createElement('table');
    table.id = 'groupTable';

    for (var i = 0; i < score.numGroups(); ++i) {
      var row = table.insertRow(i);
      var btn = document.createElement('button');
      btn.innerHTML = ' group ' + (i + 1) + ' ';
      btn.style.backgroundColor = 'transparent';
      btn.style.color = 'white';
      btn.style.border = '1px solid white';
      btn.style.margin = '2px 2px 2px 2px';
      btn.style.height = '20px';
      btn.style.width = '100px';
      const group = i;
      btn.addEventListener('click', function() {
        this.group = group;
        this.run();
      }.bind(this));
      row.appendChild(btn);
    }
    document.getElementById('center').appendChild(table);
  }

  removeGroupSelectScreen() {
    var txt = document.getElementById('groupText');
    groupText.parentElement.removeChild(txt);

    var table = document.getElementById('groupTable');
    groupTable.parentElement.removeChild(table);
  }

}
