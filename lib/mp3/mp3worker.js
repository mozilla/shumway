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

importScripts('./mp3.js');

self.addEventListener('message', function (e) {
  var data = e.data;
  var sessionId = data.sessionId;
  try {
    switch (data.action) {
    case 'create':
      var session = new Session(sessionId);
      sessions[sessionId] = session;
      break;
    case 'close':
      var session = sessions[sessionId];
      if (session) {
        session.close();
        sessions[sessionId] = null;
      }
      break;
    case 'decode':
      var session = sessions[sessionId];
      if (!session) {
        throw new Error('mp3 decoding session is unavailable');
      }
      session.decode(data.data);
      break;
    }
  } catch (ex) {
    self.postMessage({
      sessionId: sessionId,
      action: 'error',
      message: ex.message
    });
  }
}, false);

var sessions = {};

function Session(id) {
  this.id = id;
  if (typeof MP3Decoder === 'undefined') {
    throw new Error('mp3 decoder is not available');
  }
  var decoder = new MP3Decoder();
  decoder.onframedata = function (frameData, channels, sampleRate, bitRate) {
    self.postMessage({
      sessionId: this.id,
      action: 'frame',
      frameData: frameData,
      channels: channels,
      sampleRate: sampleRate,
      bitRate: bitRate
    });
  }.bind(this);
  decoder.onid3tag = function (data) {
    self.postMessage({
      sessionId: this.id,
      action: 'id3',
      id3Data: data
    });
  }.bind(this);
  this.decoder = decoder;
}
Session.prototype = {
  decode: function (data) {
    this.decoder.push(data);
  },
  close: function () {
    // flush?
    self.postMessage({
      sessionId: this.id,
      action: 'closed'
    });
  }
};

if (!self.console) {
  self.console = {
    log: function (s) {
      self.postMessage({ action: 'console', method: 'log', message: s });
    },
    error: function (s) {
      self.postMessage({ action: 'console', method: 'error', message: s });
    },
  };
}
