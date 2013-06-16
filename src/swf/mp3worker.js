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
/*global self, importScripts, Worker, MP3Decoder, SHUMWAY_ROOT */

// TODO: Investigate moving function definitions out of if-blocks
/*jshint -W082 */

var isWorker = typeof window === 'undefined';
if (isWorker) {
  importScripts('../../../lib/mp3/mp3.js');

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
          delete sessions[sessionId];
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

  self.console = {
    log: function (s) {
      self.postMessage({ action: 'console', method: 'log', message: s });
    },
    error: function (s) {
      self.postMessage({ action: 'console', method: 'error', message: s });
    },
  };

} else {
  var mp3Worker;

  function createMP3Worker() {
    var worker = new Worker(SHUMWAY_ROOT + 'swf/mp3worker.js');
    worker.addEventListener('message', function (e) {
      if (e.data.action === 'console') {
        console[e.data.method].call(console, e.data.message);
      }
    });
    return worker;
  }

  var nextSessionId = 0;
  function MP3DecoderSession() {
    mp3Worker = mp3Worker || createMP3Worker();
    var sessionId = (nextSessionId++);
    this.id = sessionId;
    this.onworkermessage = function (e) {
      if (e.data.sessionId !== sessionId)
        return;
      var action = e.data.action;
      switch (action) {
      case 'closed':
        if (this.onclosed)
          this.onclosed();
        mp3Worker.removeEventListener('message', this.onworkermessage, false);
        break;
      case 'frame':
        this.onframedata(e.data.frameData, e.data.channels,
                         e.data.sampleRate, e.data.bitRate);
        break;
      case 'id3':
        if (this.onid3tag)
          this.onid3tag(e.data.id3Data);
        break;
      case 'error':
        if (this.onerror)
          this.onerror(e.data.message);
        break;
      }
    }.bind(this);
    mp3Worker.addEventListener('message', this.onworkermessage, false);
    mp3Worker.postMessage({
      sessionId: sessionId,
      action: 'create'
    });
  }
  MP3DecoderSession.prototype = {
    pushAsync: function (data) {
      mp3Worker.postMessage({
        sessionId: this.id,
        action: 'decode',
        data: data
      });
    },
    close: function () {
      mp3Worker.postMessage({
        sessionId: this.id,
        action: 'close'
      });
    },
  };
  MP3DecoderSession.processAll = function (data, onloaded) {
    var currentBufferSize = 8000;
    var currentBuffer = new Float32Array(currentBufferSize);
    var bufferPosition = 0;
    var id3Tags = [];
    var sessionAborted = false;

    var session = new MP3DecoderSession();
    session.onframedata = function (frameData, channels, sampleRate, bitRate) {
      var needed = frameData.length + bufferPosition;
      if (needed > currentBufferSize) {
        do {
          currentBufferSize *= 2;
        } while (needed > currentBufferSize);
        var newBuffer = new Float32Array(currentBufferSize);
        newBuffer.set(currentBuffer);
        currentBuffer = newBuffer;
      }
      currentBuffer.set(frameData, bufferPosition);
      bufferPosition += frameData.length;
    };
    session.onid3tag = function (tagData) {
      id3Tags.push(tagData);
    };
    session.onclosed = function () {
      if (sessionAborted)
        return;
      onloaded(currentBuffer.subarray(0, bufferPosition), id3Tags);
    };
    session.onerror = function (error) {
      if (sessionAborted)
        return;
      sessionAborted = true;
      onloaded(null, null, error);
    };
    session.pushAsync(data);
    session.close();
  };
}
