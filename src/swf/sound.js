/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

var WaveHeader = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00,
  0x57, 0x41, 0x56, 0x45, 0x66, 0x6D, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00,
  0x01, 0x00, 0x02, 0x00, 0x44, 0xAC, 0x00, 0x00, 0x10, 0xB1, 0x02, 0x00,
  0x04, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00]);

function packageWave(data, sampleRate, channels, size, swapBytes) {
  var sizeInBytes = size >> 3;
  var sizePerSecond = channels * sampleRate * sizeInBytes;
  var sizePerSample = channels * sizeInBytes;
  var dataLength = data.length + (data.length & 1);
  var buffer = new ArrayBuffer(WaveHeader.length + dataLength);
  var bytes = new Uint8Array(buffer);
  bytes.set(WaveHeader);
  if (swapBytes) {
    for (var i = 0, j = WaveHeader.length; i < data.length; i += 2, j += 2) {
      bytes[j] = data[i + 1];
      bytes[j + 1] = data[i];
    }
  } else {
    bytes.set(data, WaveHeader.length);
  }
  var view = new DataView(buffer);
  view.setUint32(4, dataLength + 36, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sizePerSecond, true);
  view.setUint16(32, sizePerSample, true);
  view.setUint16(34, size, true);
  view.setUint32(40, dataLength, true);
  return {
    data: bytes,
    mimeType: 'audio/wav'
  };
}

function defineSound(tag, dictionary) {
  var channels = tag.soundType == SOUND_TYPE_STEREO ? 2 : 1;
  var samplesCount = tag.samplesCount;
  var sampleRate = SOUND_RATES[tag.soundRate];

  var data = tag.soundData;
  var pcm, packaged;
  switch (tag.soundFormat) {
  case SOUND_FORMAT_PCM_BE:
    pcm = new Float32Array(samplesCount * channels);
    if (tag.soundSize == SOUND_SIZE_16_BIT) {
      for (var i = 0, j = 0; i < pcm.length; i++, j += 2)
        pcm[i] = ((data[j] << 24) | (data[j + 1] << 16)) / 2147483648;
      packaged = packageWave(data, sampleRate, channels, 16, true);
    } else {
      for (var i = 0; i < pcm.length; i++)
        pcm[i] = (data[i] - 128) / 128;
      packaged = packageWave(data, sampleRate, channels, 8, false);
    }
    break;
  case SOUND_FORMAT_PCM_LE:
    pcm = new Float32Array(samplesCount * channels);
    if (tag.soundSize == SOUND_SIZE_16_BIT) {
      for (var i = 0, j = 0; i < pcm.length; i++, j += 2)
        pcm[i] = ((data[j + 1] << 24) | (data[j] << 16)) / 2147483648;
      packaged = packageWave(data, sampleRate, channels, 16, false);
    } else {
      for (var i = 0; i < pcm.length; i++)
        pcm[i] = (data[i] - 128) / 128;
      packaged = packageWave(data, sampleRate, channels, 8, false);
    }
    break;
  case SOUND_FORMAT_MP3:
    packaged = {
      data: new Uint8Array(data.subarray(2)),
      mimeType: 'audio/mpeg'
    };
    break;
  case SOUND_FORMAT_ADPCM:
    var pcm16 = new Int16Array(samplesCount * channels);
    decodeACPCMSoundData(data, pcm16, channels);
    pcm = new Float32Array(samplesCount * channels);
    for (var i = 0; i < pcm.length; i++)
      pcm[i] = pcm16[i] / 32768;
    packaged = packageWave(new Uint8Array(pcm16.buffer), sampleRate, channels,
      16, !(new Uint8Array(new Uint16Array([1]).buffer))[0]);
    break;
  default:
    throw new Error('Unsupported audio format: ' + tag.soundFormat);
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

var ACPCMIndexTables = [
  [-1, 2],
  [-1, -1, 2, 4],
  [-1, -1, -1, -1, 2, 4, 6, 8],
  [-1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 4, 6, 8, 10, 13, 16]
];

var ACPCMStepSizeTable = [
  7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45,
  50, 55, 60, 66, 73, 80, 88, 97, 107, 118, 130, 143, 157, 173, 190, 209, 230,
  253, 279, 307, 337, 371, 408, 449, 494, 544, 598, 658, 724, 796, 876, 963,
  1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024, 3327,
  3660, 4026, 4428, 4871, 5358, 5894, 6484, 7132, 7845, 8630, 9493, 10442, 11487,
  12635, 13899, 15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794, 32767
];

function decodeACPCMSoundData(data, pcm16, channels) {
  function readBits(n, signed) {
    while (dataBufferLength < n) {
      dataBuffer = (dataBuffer << 8) | data[dataPosition++];
      dataBufferLength += 8;
    }
    dataBufferLength -= n;
    return (dataBuffer >>> dataBufferLength) & ((1 << n) - 1);
  }
  var dataPosition = 0;
  var dataBuffer = 0;
  var dataBufferLength = 0;

  var pcmPosition = 0;
  var codeSize = readBits(2);
  var indexTable = ACPCMIndexTables[codeSize];
  while (pcmPosition < pcm16.length) {
    var x = pcm16[pcmPosition++] = (readBits(16) << 16) >> 16, x2;
    var stepIndex = readBits(6), stepIndex2;
    if (channels > 1) {
      x2 = pcm16[pcmPosition++] = (readBits(16) << 16) >> 16;
      stepIndex2 = readBits(6);
    }
    var signMask = 1 << (codeSize + 1);
    for (var i = 0; i < 4095; i++) {
      var nibble = readBits(codeSize + 2);
      var step = ACPCMStepSizeTable[stepIndex];
      var sum = 0;
      for (var currentBit = signMask >> 1; currentBit; currentBit >>= 1, step >>= 1) {
        if (nibble & currentBit) sum += step;
      }
      x += (nibble & signMask ? -1 : 1) * (sum + step);
      pcm16[pcmPosition++] = (x = (x < -32768 ? -32768 : x > 32767 ? 32767 : x));
      stepIndex += indexTable[nibble & ~signMask];
      stepIndex = stepIndex < 0 ? 0 : stepIndex > 88 ? 88 : stepIndex;
      if (channels > 1) {
        nibble = readBits(codeSize + 2);
        step = ACPCMStepSizeTable[stepIndex2];
        sum = 0;
        for (var currentBit = signMask >> 1; currentBit; currentBit >>= 1, step >>= 1) {
          if (nibble & currentBit) sum += step;
        }
        x2 += (nibble & signMask ? -1 : 1) * (sum + step);
        pcm16[pcmPosition++] = (x2 = (x2 < -32768 ? -32768 : x2 > 32767 ? 32767 : x2));
        stepIndex2 += indexTable[nibble & ~signMask];
        stepIndex2 = stepIndex2 < 0 ? 0 : stepIndex2 > 88 ? 88 : stepIndex2;
      }

    }
  }
}

var nextSoundStreamId = 0;

function SwfSoundStream(samplesCount, sampleRate, channels) {
  this.streamId = (nextSoundStreamId++);
  this.samplesCount = samplesCount;
  this.sampleRate = sampleRate;
  this.channels = channels;
  this.format = null;
  this.currentSample = 0;
}
SwfSoundStream.prototype = {
  get info() {
    return {
      samplesCount: this.samplesCount,
      sampleRate: this.sampleRate,
      channels: this.channels,
      format: this.format,
      streamId: this.streamId
    };
  },
  decode: function (data) {
    throw new Error('SwfSoundStream.decode: not implemented');
  }
};

function SwfSoundStream_decode_PCM(data) {
  var pcm = new Float32Array(data.length);
  for (var i = 0; i < pcm.length; i++)
    pcm[i] = (data[i] - 128) / 128;
  this.currentSample += pcm.length / this.channels;
  return {
    streamId: this.streamId,
    samplesCount: pcm.length / this.channels,
    pcm: pcm
  };
}

function SwfSoundStream_decode_PCM_be(data) {
  var pcm = new Float32Array(data.length / 2);
  for (var i = 0, j = 0; i < pcm.length; i++, j += 2)
    pcm[i] = ((data[j] << 24) | (data[j + 1] << 16)) / 2147483648;
  this.currentSample += pcm.length / this.channels;
  return {
    streamId: this.streamId,
    samplesCount: pcm.length / this.channels,
    pcm: pcm
  };
}

function SwfSoundStream_decode_PCM_le(data) {
  var pcm = new Float32Array(data.length / 2);
  for (var i = 0, j = 0; i < pcm.length; i++, j += 2)
    pcm[i] = ((data[j + 1] << 24) | (data[j] << 16)) / 2147483648;
  this.currentSample += pcm.length / this.channels;
  return {
    streamId: this.streamId,
    samplesCount: pcm.length / this.channels,
    pcm: pcm
  };
}

function SwfSoundStream_decode_MP3(data) {
  var samplesCount = (data[1] << 8) | data[0];
  var seek = (data[3] << 8) | data[2];
  this.currentSample += samplesCount;
  return {
    streamId: this.streamId,
    samplesCount: samplesCount,
    data: data.subarray(4),
    seek: seek
  };
}

function createSoundStream(tag) {
  var channels = tag.streamType == SOUND_TYPE_STEREO ? 2 : 1;
  var samplesCount = tag.samplesCount;
  var sampleRate = SOUND_RATES[tag.streamRate];
  var stream = new SwfSoundStream(samplesCount, sampleRate, channels);

  switch (tag.streamCompression) {
  case SOUND_FORMAT_PCM_BE:
    stream.format = 'wave';
    if (tag.soundSize == SOUND_SIZE_16_BIT) {
      stream.decode = SwfSoundStream_decode_PCM_be;
    } else {
      stream.decode = SwfSoundStream_decode_PCM;
    }
    break;
  case SOUND_FORMAT_PCM_LE:
    stream.format = 'wave';
    if (tag.soundSize == SOUND_SIZE_16_BIT) {
      stream.decode = SwfSoundStream_decode_PCM_le;
    } else {
      stream.decode = SwfSoundStream_decode_PCM;
    }
    break;
  case SOUND_FORMAT_MP3:
    stream.format = 'mp3';
    stream.decode = SwfSoundStream_decode_MP3;
    break;
  default:
    throw new Error('Unsupported audio format: ' + tag.soundFormat);
  }

  return stream;
}
