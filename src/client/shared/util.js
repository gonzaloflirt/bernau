import score from './score';

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

export default {decodeState, encodeState, increaseStateIndex, decreaseStateIndex}
