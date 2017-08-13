import score from './score';

function stateDurations(buffers) {
  var durations = [];
  for (const i in score.names())
  {
    durations.push(buffers[i].duration);
  }
  return durations;
}

function decodeState(value) {
  var items = value.split(' ');
  return {playing: items[0] == 'true', index: Number(items[1]), time: Number(items[2])};
}

function encodeState(playing, index, time) {
  return playing.toString() + ' ' + index.toString() + ' ' + time.toString();
}

function increaseStateIndex(index) {
  return (index + 1) % score.length();
}

function decreaseStateIndex(index) {
  return (index + score.length() - 1) % score.length();
}

function currentIndex(currentTime, stateIndex, stateTime, durations) {
  while (stateTime + durations[stateIndex] < currentTime) {
    stateTime += durations[stateIndex];
    stateIndex = increaseStateIndex(stateIndex);
  }
  return {time: stateTime, index: stateIndex};
}

export default {
  stateDurations, decodeState, encodeState, increaseStateIndex, decreaseStateIndex,
  currentIndex
}
