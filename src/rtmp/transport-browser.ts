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

module RtmpJs.Browser {
  var DEFAULT_RTMP_PORT = 1935;
  var COMBINE_RTMPT_DATA = true;

  var TCPSocket = (<any>navigator).mozTCPSocket;

  export class RtmpTransport extends BaseTransport {
    host: string;
    port: number;
    ssl: boolean;

    constructor(connectionSettings) {
      super();

      if (typeof connectionSettings === 'string') {
        connectionSettings = {host: connectionSettings};
      }

      this.host = connectionSettings.host || 'localhost';
      this.port = connectionSettings.port || DEFAULT_RTMP_PORT;
      this.ssl = !!connectionSettings.ssl || false;
    }

    connect(properties, args?) {
      if (!TCPSocket) {
        throw new Error('Your browser does not support socket communication.\n' +
          'Currenly only Firefox with enabled mozTCPSocket is allowed (see README.md).');
      }

      var channel = this._initChannel(properties, args);

      var writeQueue = [], socketError = false;
      var createRtmpSocket = (<any>window).createRtmpSocket;
      var socket = createRtmpSocket ?
        createRtmpSocket({host: this.host, port: this.port, ssl: this.ssl}) :
        TCPSocket.open(this.host, this.port, { useSecureTransport: this.ssl, binaryType: 'arraybuffer' });


      var sendData = function (data) {
        return socket.send(data.buffer, data.byteOffset, data.byteLength);
      };

      socket.onopen = function (e) {
        channel.ondata = function (data) {
          var buf = new Uint8Array(data);
          writeQueue.push(buf);
          if (writeQueue.length > 1) {
            return;
          }
          release || console.log('Bytes written: ' + buf.length);
          if (sendData(buf)) {
            writeQueue.shift();
          }
        };
        channel.onclose = function () {
          socket.close();
        };
        channel.start();
      };
      socket.ondrain = function (e) {
        writeQueue.shift();
        release || console.log('Write completed');
        while (writeQueue.length > 0) {
          release || console.log('Bytes written: ' + writeQueue[0].length);
          if (!sendData(writeQueue[0])) {
            break;
          }
          writeQueue.shift();
        }
      };
      socket.onclose = function (e) {
        channel.stop(socketError);
      };
      socket.onerror = function (e) {
        socketError = true;
        console.error('socket error: ' + e.data);
      };
      socket.ondata = function (e) {
        release || console.log('Bytes read: ' + e.data.byteLength);
        channel.push(new Uint8Array(e.data));
      };
    }
  }


  /*
   * RtmptTransport uses systemXHR to send HTTP requests.
   * See https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#XMLHttpRequest%28%29 and
   * https://github.com/mozilla-b2g/gaia/blob/master/apps/email/README.md#running-in-firefox
   *
   * Spec at http://red5.electroteque.org/dev/doc/html/rtmpt.html
   */
  export class RtmptTransport extends BaseTransport {
    baseUrl: string;
    stopped: boolean;
    sessionId: string;
    requestId: number;
    data: Uint8Array[];

    constructor(connectionSettings) {
      super();

      var host = connectionSettings.host || 'localhost';
      var url = (connectionSettings.ssl ? 'https' : 'http') + '://' + host;
      if (connectionSettings.port) {
        url += ':' + connectionSettings.port;
      }
      this.baseUrl = url;

      this.stopped = false;
      this.sessionId = null;
      this.requestId = 0;
      this.data = [];
    }

    connect(properties, args?) {
      var channel = this._initChannel(properties, args);
      channel.ondata = function (data) {
        release || console.log('Bytes written: ' + data.length);
        this.data.push(new Uint8Array(data));
      }.bind(this);
      channel.onclose = function () {
        this.stopped = true;
      }.bind(this);


      post(this.baseUrl + '/fcs/ident2', null, function (data, status) {
        if (status !== 404) {
          throw new Error('Unexpected response: ' + status);
        }

        post(this.baseUrl + '/open/1', null, function (data, status) {
          this.sessionId = String.fromCharCode.apply(null, data).slice(0, -1); // - '\n'
          console.log('session id: ' + this.sessionId);

          this.tick();
          channel.start();
        }.bind(this));
      }.bind(this));
    }

    tick() {
      var continueSend = function (data, status) {
        if (status !== 200) {
          throw new Error('Invalid HTTP status');
        }

        var idle = data[0];
        if (data.length > 1) {
          this.channel.push(data.subarray(1));
        }
        setTimeout(this.tick.bind(this), idle * 16);
      }.bind(this);

      if (this.stopped) {
        post(this.baseUrl + '/close/2', null, function () {
          // do nothing
        });
        return;
      }

      if (this.data.length > 0) {
        var data;
        if (COMBINE_RTMPT_DATA) {
          var length = 0;
          this.data.forEach(function (i) {
            length += i.length;
          });
          var pos = 0;
          data = new Uint8Array(length);
          this.data.forEach(function (i) {
            data.set(i, pos);
            pos += i.length;
          });
          this.data.length = 0;
        } else {
          data = this.data.shift();
        }
        post(this.baseUrl + '/send/' + this.sessionId + '/' + (this.requestId++),
          data, continueSend);
      } else {
        post(this.baseUrl + '/idle/' + this.sessionId + '/' + (this.requestId++),
          null, continueSend);
      }
    }
  }

  var emptyPostData = new Uint8Array([0]);

  function post(path, data, onload) {
    data || (data = emptyPostData);

    var createRtmpXHR = (<any>window).createRtmpXHR;
    var xhr = createRtmpXHR ? createRtmpXHR() : new (<any>XMLHttpRequest)({mozSystem: true});
    xhr.open('POST', path, true);
    xhr.responseType = 'arraybuffer';
    xhr.setRequestHeader('Content-Type', 'application/x-fcs');
    xhr.onload = function (e) {
      onload(new Uint8Array(xhr.response), xhr.status);
    };
    xhr.onerror = function (e) {
      console.log('error');
      throw new Error('HTTP error');
    };
    xhr.send(data);
  }
}
