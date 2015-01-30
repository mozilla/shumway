/*
 * Copyright 2015 Mozilla Foundation
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

module RtmpJs {
  var MAX_CHUNKED_CHANNEL_BUFFER = 0x80000;
  var RANDOM_DATA_SIZE = 1536;
  var PROTOCOL_VERSION = 3;

  var SET_CHUNK_SIZE_CONTROL_MESSAGE_ID = 1;
  var ABORT_MESSAGE_CONTROL_MESSAGE_ID = 2;
  var ACK_MESSAGE_ID = 3;
  var USER_CONTROL_MESSAGE_ID = 4;
  var ACK_WINDOW_SIZE_MESSAGE_ID = 5;
  var SET_PEER_BANDWIDTH_MESSAGE_ID = 6;

  var CONTROL_CHUNK_STREAM_ID = 2;
  var MIN_CHUNK_STREAM_ID = 3;
  var MAX_CHUNK_STREAM_ID = 65599;
  var MAX_CHUNK_HEADER_SIZE = 18;

  export interface IChunkedStreamMessage {
    timestamp: number;
    streamId: number;
    chunkedStreamId: number;
    typeId: number;
    data: Uint8Array;
    firstChunk: boolean;
    lastChunk: boolean;
  }

  export class ChunkedStream {
    private id: number;
    private buffer: Uint8Array;
    private bufferLength: number;

    lastStreamId: number;
    lastTimestamp: number;
    lastLength: number;
    lastTypeId: number;
    lastMessageComplete: boolean;
    waitingForBytes: number;

    sentStreamId: number;
    sentTimestamp: number;
    sentLength: number;
    sentTypeId: number;

    public onmessage: (message: IChunkedStreamMessage) => void = null;

    public constructor(id: number) {
      this.id = id;
      this.buffer = null;
      this.bufferLength = 0;

      this.lastStreamId = -1;
      this.lastTimestamp = 0;
      this.lastLength = 0;
      this.lastTypeId = 0;
      this.lastMessageComplete = false;
      this.waitingForBytes = 0;

      this.sentStreamId = -1;
      this.sentTimestamp = 0;
      this.sentLength = 0;
      this.sentTypeId = 0;
    }

     setBuffer(enabled: boolean) {
      if (enabled && !this.buffer) {
        this.buffer = new Uint8Array(128);
        this.bufferLength = 0;
      }
      if (!enabled && this.buffer) {
        this.buffer = null;
        this.bufferLength = 0;
      }
    }

    abort() {
      if (this.buffer) {
        this.bufferLength = 0;
      } else if (!this.lastMessageComplete) {
        this.lastMessageComplete = true;
        this.onmessage({
          timestamp: this.lastTimestamp,
          streamId: this.lastStreamId,
          chunkedStreamId: this.id,
          typeId: this.lastTypeId,
          data: null,
          firstChunk: false,
          lastChunk: true
        });
      }
    }

    _push(data: Uint8Array, firstChunk: boolean, lastChunk: boolean) {
      if (!this.onmessage) {
        return;
      }
      if ((firstChunk && lastChunk) || !this.buffer) {
        this.onmessage({
          timestamp: this.lastTimestamp,
          streamId: this.lastStreamId,
          chunkedStreamId: this.id,
          typeId: this.lastTypeId,
          data: data,
          firstChunk: firstChunk,
          lastChunk: lastChunk
        });
        return;
      }

      if (firstChunk) {
        this.bufferLength = 0;
        if (this.lastLength > this.buffer.length) {
          this.buffer = new Uint8Array(this.lastLength);
        }
      }

      this.buffer.set(data, this.bufferLength);
      this.bufferLength += data.length;
      if (lastChunk) {
        this.onmessage({
          timestamp: this.lastTimestamp,
          streamId: this.lastStreamId,
          chunkedStreamId: this.id,
          typeId: this.lastTypeId,
          data: this.buffer.subarray(0, this.bufferLength),
          firstChunk: true,
          lastChunk: true
        });
      }
    }
  }

  export interface IChunkedChannelUserControlMessage {
    type: number;
    data: Uint8Array;
  }

  export interface ISendMessage {
    streamId: number;
    typeId: number;
    data: Uint8Array;
    timestamp?: number;
  }

  export class ChunkedChannel {
    private state: string;
    private buffer: Uint8Array;
    private bufferLength: number;
    private chunkSize: number;
    private chunkStreams: ChunkedStream[];
    private peerChunkSize: number;
    private peerAckWindowSize: number;
    private bandwidthLimitType: number;
    private windowAckSize: number;
    private bytesReceived: number;
    private lastAckSent: number;

    private serverVersion: number;
    private epochStart: number;
    private randomData: Uint8Array;

    public onusercontrolmessage: (message: IChunkedChannelUserControlMessage) => void = null;
    public onack: () => void = null;
    public ondata: (data: Uint8Array) => void = function (data) { /* do nothing */ };
    public onclose: () => void = function () { /* do nothing */ };
    public oncreated: () => void = null;
    public onmessage: (message: IChunkedStreamMessage) => void;

    public constructor() {
      this.state = 'uninitialized';
      this.buffer = new Uint8Array(4092);
      this.bufferLength = 0;
      this.chunkSize = 128;
      this.chunkStreams = [];
      this.peerChunkSize = 128;
      this.peerAckWindowSize = 0;
      this.bandwidthLimitType = 0;
      this.windowAckSize = 0;
      this.bytesReceived = 0;
      this.lastAckSent = 0;
    }

    public push(data: Uint8Array) {
      var newDataLength = data.length + this.bufferLength;
      if (newDataLength > this.buffer.length) {
        var newBufferLength = this.buffer.length * 2;
        while (newDataLength > newBufferLength) {
          newBufferLength *= 2;
        }
        if (newBufferLength > MAX_CHUNKED_CHANNEL_BUFFER) {
          this._fail('Buffer overflow');
        }
        var newBuffer = new Uint8Array(newBufferLength);
        newBuffer.set(this.buffer);
        this.buffer = newBuffer;
      }

      for (var i = 0, j = this.bufferLength; i < data.length; i++, j++) {
        this.buffer[j] = data[i];
      }
      this.bufferLength = newDataLength;

      this.bytesReceived += data.length;
      if (this.peerAckWindowSize &&
        (this.bytesReceived - this.lastAckSent) >= this.peerAckWindowSize) {
        this._sendAck();
      }

      while (this.bufferLength > 0) {
        // release || console.log('current bufferLength: ' + this.bufferLength + ' state:' + this.state);
        var shiftBy = 0;
        switch (this.state) {
          case 'uninitialized':
            if (this.bufferLength < 1) {
              return;
            }
            this.serverVersion = this.buffer[0];
            shiftBy = 1;
            if (this.serverVersion !== PROTOCOL_VERSION) {
              this._fail('Unsupported protocol version: ' + this.serverVersion);
            }
            this.state = 'version_received';
            break;
          case 'version_received':
            if (this.bufferLength < RANDOM_DATA_SIZE) {
              return;
            }
            shiftBy = RANDOM_DATA_SIZE;

            var timestamp = (Date.now() - this.epochStart) | 0;
            this.buffer[4] = (timestamp >>> 24) & 0xFF;
            this.buffer[5] = (timestamp >>> 16) & 0xFF;
            this.buffer[6] = (timestamp >>> 8) & 0xFF;
            this.buffer[7] = timestamp & 0xFF;
            this.ondata(this.buffer.subarray(0, RANDOM_DATA_SIZE));
            this.state = 'ack_sent';
            break;
          case 'ack_sent':
            if (this.bufferLength < RANDOM_DATA_SIZE) {
              return;
            }
            shiftBy = RANDOM_DATA_SIZE;

            for (var i = 8; i < RANDOM_DATA_SIZE; i++) {
              if (this.buffer[i] !== this.randomData[i]) {
                this._fail('Random data do not match @' + i);
              }
            }
            this.state = 'handshake_done';
            this.lastAckSent = this.bytesReceived;
            this._initialize();
            break;
          case 'handshake_done':
            shiftBy = this._parseChunkedData();
            if (!shiftBy) {
              return;
            }
            break;
          default:
            return;
        }
        this.buffer.set(this.buffer.subarray(shiftBy, this.bufferLength), 0);
        this.bufferLength -= shiftBy;
      }
    }

    private _initialize() {
      var controlStream = this._getChunkStream(CONTROL_CHUNK_STREAM_ID);
      controlStream.setBuffer(true);
      controlStream.onmessage = function (e) {
        if (e.streamId !== 0) {
          return;
        }
        release || console.log('Control message: ' + e.typeId);
        switch (e.typeId) {
          case SET_CHUNK_SIZE_CONTROL_MESSAGE_ID:
            var newChunkSize = (e.data[0] << 24) | (e.data[1] << 16) |
              (e.data[2] << 8) | e.data[3];
            if (newChunkSize >= 1 && newChunkSize <= 0x7FFFFFFF) {
              this.peerChunkSize = newChunkSize;
            }
            break;
          case ABORT_MESSAGE_CONTROL_MESSAGE_ID:
            var chunkStreamId = (e.data[0] << 24) | (e.data[1] << 16) |
              (e.data[2] << 8) | e.data[3];
            if (MIN_CHUNK_STREAM_ID <= chunkStreamId &&
              chunkStreamId <= MAX_CHUNK_STREAM_ID) {
              var chunkStream = this._getChunkStream(chunkStreamId);
              chunkStream.abort();
            }
            break;
          case ACK_MESSAGE_ID:
            if (this.onack) {
              this.onack();
            }
            break;
          case USER_CONTROL_MESSAGE_ID:
            if (this.onusercontrolmessage) {
              this.onusercontrolmessage({
                type: (e.data[0] << 8) | e.data[1],
                data: e.data.subarray(2)
              });
            }
            break;
          case ACK_WINDOW_SIZE_MESSAGE_ID:
            var ackWindowSize = (e.data[0] << 24) | (e.data[1] << 16) |
              (e.data[2] << 8) | e.data[3];
            if (ackWindowSize < 0) {
              break;
            }
            this.peerAckWindowSize = ackWindowSize;
            break;
          case SET_PEER_BANDWIDTH_MESSAGE_ID:
            var ackWindowSize = (e.data[0] << 24) | (e.data[1] << 16) |
              (e.data[2] << 8) | e.data[3];
            var limitType = e.data[4];
            if (ackWindowSize < 0 || limitType > 2) {
              break;
            }
            if (limitType === 1 ||
              (limitType === 2 && this.bandwidthLimitType === 1)) {
              ackWindowSize = Math.min(this.windowAckSize, ackWindowSize);
            }

            if (ackWindowSize !== this.ackWindowSize) {
              this.ackWindowSize = ackWindowSize;
              var ackData = new Uint8Array([(ackWindowSize >>> 24) & 0xFF,
                  (ackWindowSize >>> 16) & 0xFF,
                  (ackWindowSize >>> 8) & 0xFF,
                  ackWindowSize & 0xFF]);
              this._sendMessage(CONTROL_CHUNK_STREAM_ID, {
                typeId: ACK_WINDOW_SIZE_MESSAGE_ID,
                streamId: 0,
                data: ackData
              });
              if (limitType !== 2) {
                this.bandwidthLimitType = limitType;
              }
            }
            break;
        }
      }.bind(this);

      if (this.oncreated) {
        this.oncreated();
      }
    }

    public setChunkSize(chunkSize: number) {
      if (chunkSize < 1 || chunkSize > 0x7FFFFFFF) {
        throw new Error('Invalid chunk size');
      }
      this._sendMessage(CONTROL_CHUNK_STREAM_ID, {
        streamId: 0,
        typeId: SET_CHUNK_SIZE_CONTROL_MESSAGE_ID,
        data: new Uint8Array([(chunkSize >>> 24) & 0xFF,
            (chunkSize >>> 16) & 0xFF,
            (chunkSize >>> 8) & 0xFF,
            chunkSize & 0xFF])
      });
      this.chunkSize = chunkSize;
    }

    public send(chunkStreamId: number, message: ISendMessage) {
      if (chunkStreamId < MIN_CHUNK_STREAM_ID ||
        chunkStreamId > MAX_CHUNK_STREAM_ID) {
        throw new Error('Invalid chunkStreamId');
      }
      return this._sendMessage(chunkStreamId, message);
    }

    public sendUserControlMessage(type: number, data: Uint8Array) {
      var eventData = new Uint8Array(2 + data.length);
      eventData[0] = (type >> 8) & 0xFF;
      eventData[1] = type & 0xFF;
      eventData.set(data, 2);

      this._sendMessage(CONTROL_CHUNK_STREAM_ID, {
        typeId: USER_CONTROL_MESSAGE_ID,
        streamId: 0,
        data: eventData
      });
    }

    private _sendAck() {
      var ackData = new Uint8Array([(this.bytesReceived >>> 24) & 0xFF,
          (this.bytesReceived >>> 16) & 0xFF,
          (this.bytesReceived >>> 8) & 0xFF,
          this.bytesReceived & 0xFF]);
      this._sendMessage(CONTROL_CHUNK_STREAM_ID, {
        typeId: ACK_MESSAGE_ID,
        streamId: 0,
        data: ackData
      });
    }

    private _sendMessage(chunkStreamId: number, message: ISendMessage) {
      var data = message.data;
      var messageLength = data.length;
      var chunkStream = this._getChunkStream(chunkStreamId);

      var timestamp = ('timestamp' in message ? message.timestamp : (Date.now() - this.epochStart)) | 0;
      var timestampDelta = (timestamp - chunkStream.sentTimestamp) | 0;

      var buffer = new Uint8Array(this.chunkSize + MAX_CHUNK_HEADER_SIZE);
      var chunkStreamIdSize;
      if (chunkStreamId < 64) {
        chunkStreamIdSize = 1;
        buffer[0] = chunkStreamId;
      } else if (chunkStreamId < 320) {
        chunkStreamIdSize = 2;
        buffer[0] = 0;
        buffer[1] = chunkStreamId - 64;
      } else {
        chunkStreamIdSize = 3;
        buffer[0] = 1;
        buffer[1] = ((chunkStreamId - 64) >> 8) & 0xFF;
        buffer[2] = (chunkStreamId - 64) & 0xFF;
      }

      var position = chunkStreamIdSize;
      var extendTimestamp = 0;
      if (message.streamId !== chunkStream.sentStreamId || timestampDelta < 0) {
        // chunk type 0
        if ((timestamp & 0xFF000000) !== 0) {
          extendTimestamp = timestamp;
          buffer[position] = buffer[position + 1] = buffer[position + 2] = 0xFF;
        } else {
          buffer[position] = (timestamp >> 16) & 0xFF;
          buffer[position + 1] = (timestamp >> 8) & 0xFF;
          buffer[position + 2] = timestamp & 0xFF;
        }
        position += 3;
        buffer[position++] = (messageLength >> 16) & 0xFF;
        buffer[position++] = (messageLength >> 8) & 0xFF;
        buffer[position++] = messageLength & 0xFF;
        buffer[position++] = message.typeId;
        buffer[position++] = message.streamId & 0xFF; // little-endian
        buffer[position++] = (message.streamId >> 8) & 0xFF;
        buffer[position++] = (message.streamId >> 16) & 0xFF;
        buffer[position++] = (message.streamId >> 24) & 0xFF;
      } else if (messageLength !== chunkStream.sentLength ||
        message.typeId !== chunkStream.sentTypeId) {
        // chunk type 1
        buffer[0] |= 0x40;
        if ((timestampDelta & 0xFF000000) !== 0) {
          extendTimestamp = timestampDelta;
          buffer[position] = buffer[position + 1] = buffer[position + 2] = 0xFF;
        } else {
          buffer[position] = (timestampDelta >> 16) & 0xFF;
          buffer[position + 1] = (timestampDelta >> 8) & 0xFF;
          buffer[position + 2] = timestampDelta & 0xFF;
        }
        position += 3;
        buffer[position++] = (messageLength >> 16) & 0xFF;
        buffer[position++] = (messageLength >> 8) & 0xFF;
        buffer[position++] = messageLength & 0xFF;
        buffer[position++] = message.typeId;
      } else if (timestampDelta !== 0) {
        // chunk type 2
        buffer[0] |= 0x80;
        if ((timestampDelta & 0xFF000000) !== 0) {
          extendTimestamp = timestampDelta;
          buffer[position] = buffer[position + 1] = buffer[position + 2] = 0xFF;
        } else {
          buffer[position] = (timestampDelta >> 16) & 0xFF;
          buffer[position + 1] = (timestampDelta >> 8) & 0xFF;
          buffer[position + 2] = timestampDelta & 0xFF;
        }
        position += 3;
      } else {
        // chunk type 3
        buffer[0] |= 0xC0;
      }
      if (extendTimestamp) {
        buffer[position++] = (extendTimestamp >>> 24) & 0xFF;
        buffer[position++] = (extendTimestamp >>> 16) & 0xFF;
        buffer[position++] = (extendTimestamp >>> 8) & 0xFF;
        buffer[position++] = extendTimestamp & 0xFF;
      }

      chunkStream.sentTimestamp = timestamp;
      chunkStream.sentStreamId = message.streamId;
      chunkStream.sentTypeId = message.typeId;
      chunkStream.sentLength = messageLength;

      var sent = 0;
      while (sent < messageLength) {
        var currentChunkLength = Math.min(messageLength - sent, this.chunkSize);
        buffer.set(data.subarray(sent, sent + currentChunkLength), position);
        sent += currentChunkLength;

        this.ondata(buffer.subarray(0, position + currentChunkLength));

        // reset position and chunk type
        buffer[0] |= 0xC0;
        position = chunkStreamIdSize;
      }

      return timestamp;
    }

    private  _getChunkStream(id: number) {
      var chunkStream = this.chunkStreams[id];
      if (!chunkStream) {
        this.chunkStreams[id] = chunkStream = new ChunkedStream(id);
        chunkStream.setBuffer(true);
        chunkStream.onmessage = function (message) {
          if (this.onmessage) {
            this.onmessage(message);
          }
        }.bind(this);
      }
      return chunkStream;
    }

    private _parseChunkedData() {
      if (this.bufferLength < 1) {
        return;
      }
      var chunkType = (this.buffer[0] >> 6) & 3;
      var chunkHeaderPosition = 1;
      var chunkStreamId = this.buffer[0] & 0x3F;
      if (chunkStreamId === 0) {
        if (this.bufferLength < 2) {
          return; }
        chunkStreamId = this.buffer[1] + 64;
        chunkHeaderPosition = 2;
      } else if (chunkStreamId === 1) {
        if (this.bufferLength < 2) {
          return;
        }
        chunkStreamId = (this.buffer[1] << 8) + this.buffer[2] + 64;
        chunkHeaderPosition = 3;
      }
      var chunkHeaderSize = chunkType === 0 ? 11 : chunkType === 1 ? 7 :
          chunkType === 2 ? 3 : 0;
      if (this.bufferLength < chunkHeaderPosition + chunkHeaderSize) {
        return;
      }
      var extendTimestampSize = chunkType !== 3 &&
        this.buffer[chunkHeaderPosition] === 0xFF &&
        this.buffer[chunkHeaderPosition + 1] === 0xFF &&
        this.buffer[chunkHeaderPosition + 2] === 0xFF ? 4 : 0;
      var totalChunkHeaderSize = chunkHeaderPosition + chunkHeaderSize +
        extendTimestampSize;
      if (this.bufferLength < totalChunkHeaderSize) {
        return;
      }
      var chunkStream = this._getChunkStream(chunkStreamId);

      var chunkTimestamp: number;
      if (chunkType === 3) {
        chunkTimestamp = chunkStream.lastTimestamp;
      } else {
        chunkTimestamp = (this.buffer[chunkHeaderPosition] << 16) |
          (this.buffer[chunkHeaderPosition + 1] << 8) |
          this.buffer[chunkHeaderPosition + 2];
      }
      if (extendTimestampSize) {
        var chunkTimestampPosition = chunkHeaderPosition + chunkHeaderSize;
        chunkTimestamp = (this.buffer[chunkTimestampPosition] << 24) |
          (this.buffer[chunkTimestampPosition + 1] << 16) |
          (this.buffer[chunkTimestampPosition + 2] << 8) |
          this.buffer[chunkTimestampPosition + 3];
      }
      if (chunkType === 1 || chunkType === 2) {
        chunkTimestamp = (chunkStream.lastTimestamp + chunkTimestamp) | 0;
      }
      var messageLength: number = chunkStream.lastLength;
      var messageTypeId = chunkStream.lastTypeId;
      var messageStreamId = chunkStream.lastStreamId;
      if (chunkType === 0 || chunkType === 1) {
        messageLength = (this.buffer[chunkHeaderPosition + 3] << 16) |
          (this.buffer[chunkHeaderPosition + 4] << 8) |
          this.buffer[chunkHeaderPosition + 5];
        messageTypeId = this.buffer[chunkHeaderPosition + 6];
      }
      if (chunkType === 0) {
        // little-endian
        messageStreamId = (this.buffer[chunkHeaderPosition + 10] << 24) |
          (this.buffer[chunkHeaderPosition + 9] << 16) |
          (this.buffer[chunkHeaderPosition + 8] << 8) |
          this.buffer[chunkHeaderPosition + 7];
      }

      var read, tailLength, firstChunk;
      if (chunkType === 3 && chunkStream.waitingForBytes) {
        firstChunk = false;
        read = Math.min(chunkStream.waitingForBytes, this.peerChunkSize);
        tailLength = chunkStream.waitingForBytes - read;
      } else {
        firstChunk = true;
        read = Math.min(messageLength, this.peerChunkSize);
        tailLength = messageLength - read;
      }
      if (this.bufferLength < totalChunkHeaderSize + read) {
        return;
      }
      release || (!firstChunk && tailLength) || // limiting trace to first/last chunks
      console.log('Chunk received: cs:' + chunkStreamId + '; ' +
        'f/l:' + firstChunk + '/' + (!tailLength) + ';  len:' + messageLength);
      chunkStream.lastTimestamp = chunkTimestamp;
      chunkStream.lastLength = messageLength;
      chunkStream.lastTypeId = messageTypeId;
      chunkStream.lastStreamId = messageStreamId;
      chunkStream.lastMessageComplete = !tailLength;
      chunkStream.waitingForBytes = tailLength;
      chunkStream._push(
        this.buffer.subarray(totalChunkHeaderSize, totalChunkHeaderSize + read),
        firstChunk, !tailLength);

      return totalChunkHeaderSize + read;
    }

    public start() {
      this.epochStart = Date.now();
      this.ondata(new Uint8Array([PROTOCOL_VERSION])); // c0

      this.randomData = new Uint8Array(RANDOM_DATA_SIZE);
      this.randomData[0] = 0;
      this.randomData[1] = 0;
      this.randomData[2] = 0;
      this.randomData[3] = 0;
      for (var i = 8; i < RANDOM_DATA_SIZE; i++) {
        this.randomData[i] = (Math.random() * 256) | 0;
      }
      this.ondata(this.randomData); // c1
      console.log('## connected');
    }

    public stop(error) {
      if (error) {
        console.error('socket error!!!');
      }
      console.log('## closed');
    }

    private _fail(message) {
      console.error('failed: ' + message);
      this.state = 'failed';
      this.onclose();
      throw new Error(message);
    }
  }
}
