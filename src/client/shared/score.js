// Score /////////////////////////////////////////////////////////////////////////////////
// [fileName, numChannels]

const data = [
  ['saw', 1],
  ['sine', 1],
  ['klang', 2]
];

//////////////////////////////////////////////////////////////////////////////////////////

var score = {};

score.length = function() {
  return data.length;
}

score.numGroups = function() {
  return Math.max.apply(null, data.map(function(val) { return val[1]; }));
}

score.names = function() {
  return data.map(function(val) { return val[0]; });
}

score.channels = function() {
  return data.map(function(val) { return val[1]; });
}

score.files = function() {
  var files = [];
  for (const i in data) {
    for(var j = 0; j < data[i][1]; ++j)
    {
      files.push('sounds/' + data[i][0] + '-' + (j + 1) + '.mp3');
    }
  }
  return files;
}

score.index = function(file, channel) {
  var index = 0;
  for (var i = 0; i < file; ++i)
  {
    index += data[i][1];
  }
  return index += (channel % data[file][1]);
}

export default score;
