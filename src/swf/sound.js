/* -*- mode: javascript; tab-width: 4; indent-tabs-mode: nil -*- */

var SOUND_SIZE_8_BIT  = 0;
var SOUND_SIZE_16_BIT = 1;
var SOUND_TYPE_MONO   = 0;
var SOUND_TYPE_STEREO = 1;

var SOUND_FORMAT_PCM_BE        = 0;
var SOUND_FORMAT_ADPCM         = 1;
var SOUND_FORMAT_MP3           = 2;
var SOUND_FORMAT_PCM_LE        = 3;
var SOUND_FORMAT_NELLYMOSER_16 = 4;
var SOUND_FORMAT_NELLYMOSER_8  = 5;
var SOUND_FORMAT_NELLYMOSER    = 6;
var SOUND_FORMAT_SPEEX         = 11;

var SOUND_RATES = [5512, 11250, 22500, 44100];

function defineSound(tag, dictionary) {
  var channels = tag.soundType == SOUND_TYPE_STEREO ? 2 : 1;
  var samplesCount = tag.samplesCount;
  var sampleRate = SOUND_RATES[tag.soundRate];

  var pcm = new Float32Array(samplesCount * channels);
  var data = tag.soundData;
  var packaged;
  switch (tag.soundFormat) {
  case SOUND_FORMAT_PCM_BE:
    if (tag.soundSize == SOUND_SIZE_16_BIT) {
      for (var i = 0, j = 0; i < pcm.length; i++, j += 2)
        pcm[i] = ((data[j] << 8) | data[j + 1]) / 32768;
    } else {
      for (var i = 0; i < pcm.length; i++)
        pcm[i] = (data[i] - 128) / 128;
    }
    break;
  case SOUND_FORMAT_PCM_LE:
    if (tag.soundSize == SOUND_SIZE_16_BIT) {
      for (var i = 0, j = 0; i < pcm.length; i++, j += 2)
        pcm[i] = ((data[j + 1] << 8) | data[j]) / 32768;
    } else {
      for (var i = 0; i < pcm.length; i++)
        pcm[i] = (data[i] - 128) / 128;
    }
    break;
  case SOUND_FORMAT_MP3:
    if (typeof MP3Decoder !== 'undefined') {
      var decoder = new MP3Decoder();
      var i = 0;
      decoder.onframedata = function (frameData) {
        for (var j = 0; j < frameData.length; j++)
          pcm[i++] = frameData[j];
      };
      decoder.push(data);
      break;
    } else {
      packaged = {
        data: data.subarray(2),
        mimeType: 'audio/mpeg'
      };
      break;
    }
  default:
    error('Unsupported audio format: ' + tag.soundFormat);
    //for (var i = 0; i < pcm.length; i++)
    //  pcm[i] = Math.sin(i / sampleRate * 220);
    break;
  }

  var sound = {
    type: 'sound',
    id: tag.id,
    sampleRate: sampleRate,
    channels: channels,
    pcm: pcm
  };
  if (packaged)
    sound.packaged = packaged;
  return sound;
}

var nextSoundStreamId = 0;

function SwfSoundStream(samplesCount, sampleRate, channels) {
  this.streamId = (nextSoundStreamId++);
  this.samplesCount = samplesCount;
  this.sampleRate = sampleRate;
  this.channels = channels;
  this.currentSample = 0;
}
SwfSoundStream.prototype = {
  get info() {
    return {
      samplesCount: this.samplesCount,
      sampleRate: this.sampleRate,
      channels: this.channels,
      streamId: this.streamId
    };
  },
  decode: function (data) {
    throw 'SwfSoundStream.decode: not implemented';
  }
};

function SwfSoundStream_decode_PCM(data) {
  var pcm = new Float32Array(data.length);
  for (var i = 0; i < pcm.length; i++)
    pcm[i] = (data[i] - 128) / 128;
  this.currentSample += pcm.length / this.channels;
  return {
    pcm: pcm,
    streamId: this.streamId
  };
}

function SwfSoundStream_decode_PCM_be(data) {
  var pcm = new Float32Array(data.length / 2);
  for (var i = 0, j = 0; i < pcm.length; i++, j += 2)
    pcm[i] = ((data[i] << 8) | data[i + 1]) / 128;
  this.currentSample += pcm.length / this.channels;
  return {
    pcm: pcm,
    streamId: this.streamId
  };
}

function SwfSoundStream_decode_PCM_le(data) {
  var pcm = new Float32Array(data.length / 2);
  for (var i = 0, j = 0; i < pcm.length; i++, j += 2)
    pcm[i] = ((data[j + 1] << 8) | data[j]) / 128;
  this.currentSample += pcm.length / this.channels;
  return {
    pcm: pcm,
    streamId: this.streamId
  };
}

function SwfSoundStream_decode_MP3(data) {
  var samplesCount = (data[1] << 8) | data[0];
  var seek = (data[3] << 8) | data[2];
  var pcm = new Float32Array(samplesCount * this.channels);
  var i = 0;
  var decoder = this.mp3Decoder;
  decoder.onframedata = function (frameData) {
    for (var j = 0; j < frameData.length; j++)
      pcm[i++] = frameData[j];
  };
  decoder.push(data.substring(4));
  this.currentSample += samplesCount;
  return {
    pcm: pcm,
    streamId: this.streamId,
    seek: seek
  };
}

function SwfSoundStream_decode_MP3_fake(data) {
  var samplesCount = (data[1] << 8) | data[0];
  var seek = (data[3] << 8) | data[2];
  var pcm = new Float32Array(samplesCount * this.channels);
  var sampleRate = this.sampleRate;
  for (var i = 0; i < pcm.length; i++)
    pcm[i] = Math.sin(i / sampleRate * 220);
  this.currentSample += samplesCount;
  return {
    pcm: pcm,
    streamId: this.streamId,
    seek: seek
  };
}

function createSoundStream(tag) {
  var channels = tag.streamType == SOUND_TYPE_STEREO ? 2 : 1;
  var samplesCount = tag.samplesCount;
  var sampleRate = SOUND_RATES[tag.streamRate];
  debugger;
  var stream = new SwfSoundStream(samplesCount, sampleRate, channels);

  switch (tag.streamCompression) {
  case SOUND_FORMAT_PCM_BE:
    if (tag.soundSize == SOUND_SIZE_16_BIT) {
      stream.decode = SwfSoundStream_decode_PCM_be;
    } else {
      stream.decode = SwfSoundStream_decode_PCM;
    }
    break;
  case SOUND_FORMAT_PCM_LE:
    if (tag.soundSize == SOUND_SIZE_16_BIT) {
      stream.decode = SwfSoundStream_decode_PCM_le;
    } else {
      stream.decode = SwfSoundStream_decode_PCM;
    }
    break;
  case SOUND_FORMAT_MP3:
    if (typeof MP3Decoder !== 'undefined') {
      stream.decode = SwfSoundStream_decode_MP3;
      stream.mp3Decoder = new MP3Decoder();
      break;
    } else {
      stream.decode = SwfSoundStream_decode_MP3_fake;
      break;
    }
  default:
    error('Unsupported audio format: ' + tag.soundFormat);
    break;
  }

  return stream;
}