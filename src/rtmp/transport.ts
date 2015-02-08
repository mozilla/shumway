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
  import flash = Shumway.AVM2.AS.flash;

  var TRANSPORT_ENCODING = 0;

  var MAIN_CHUNKED_STREAM_ID = 3;
  var CONNECT_TRANSACTION_ID = 1;
  var DEFAULT_STREAM_ID = 0;

  var COMMAND_MESSAGE_AMF0_ID = 20;
  var COMMAND_MESSAGE_AMF3_ID = 17;

  var SET_BUFFER_CONTROL_MESSAGE_ID = 3;
  var PING_REQUEST_CONTROL_MESSAGE_ID = 6;
  var PING_RESPONSE_CONTROL_MESSAGE_ID = 7;

  export interface ITransportConnectedParameters {
    properties;
    information;
    isError: boolean;
  }

  export interface ITransportStreamCreatedParameters {
    transactionId: number;
    commandObject;
    streamId: number;
    stream: INetStream;
    isError: boolean
  }

  export interface ITransportResponse {
    commandName: string;
    transactionId: number;
    commandObject;
    response;
  }

  export interface ITransportEvent {
    type: number;
    data: Uint8Array;
  }

  export class BaseTransport {
    channel: ChunkedChannel;

    onconnected: (props: ITransportConnectedParameters) => void;
    onstreamcreated: (props: ITransportStreamCreatedParameters) => void;
    onresponse: (response: ITransportResponse) => void;
    onevent: (event: ITransportEvent) => void;

    private _streams: NetStream[];

    constructor() {
      this._streams = [];
    }

    connect(properties: any, args?: any) {
      throw new Error('Abstract BaseTransport.connect method');
    }

    _initChannel(properties: any, args?: any) {
      var channel = new ChunkedChannel();
      var transport = this;
      channel.oncreated = function () {
        var ba = new flash.utils.ByteArray();
        ba.objectEncoding = TRANSPORT_ENCODING;
        ba.writeObject('connect');
        ba.writeObject(CONNECT_TRANSACTION_ID);
        ba.writeObject(properties);
        ba.writeObject(args || null);
        release || console.log('.. Connect sent');
        channel.send(MAIN_CHUNKED_STREAM_ID, {
          streamId: DEFAULT_STREAM_ID,
          typeId: TRANSPORT_ENCODING ? COMMAND_MESSAGE_AMF3_ID : COMMAND_MESSAGE_AMF0_ID,
          data: new Uint8Array((<any> ba)._buffer, 0, (<any> ba).length)
        });
      };
      channel.onmessage = function (message: IChunkedStreamMessage) {
        release || console.log('.. Data received: typeId:' + message.typeId +
          ', streamId:' + message.streamId +
          ', cs: ' + message.chunkedStreamId);

        if (message.streamId !== 0) {
          transport._streams[message.streamId]._push(message);
          return;
        }

        if (message.typeId === COMMAND_MESSAGE_AMF0_ID ||
          message.typeId === COMMAND_MESSAGE_AMF3_ID) {
          var ba = new flash.utils.ByteArray();
          ba.writeRawBytes(message.data);
          ba.position = 0;
          ba.objectEncoding = message.typeId === COMMAND_MESSAGE_AMF0_ID ? 0 : 3;
          var commandName = ba.readObject();
          if (commandName === undefined) { // ??? not sure what specification says and what real stuff are
            ba.objectEncoding = 0;
            commandName = ba.readObject();
          }
          var transactionId = ba.readObject();
          if (commandName === '_result' || commandName === '_error') {
            var isError = commandName === '_error';
            if (transactionId === CONNECT_TRANSACTION_ID) {
              var properties = ba.readObject();
              var information = ba.readObject();
              if (transport.onconnected) {
                transport.onconnected({properties: properties, information: information, isError: isError});
              }
            } else {
              var commandObject = ba.readObject();
              var streamId = ba.readObject();
              if (transport.onstreamcreated) {
                var stream = new NetStream(transport, streamId);
                transport._streams[streamId] = stream;
                transport.onstreamcreated({transactionId: transactionId, commandObject: commandObject, streamId: streamId, stream: stream, isError: isError});
              }
            }
          } else if (commandName === 'onBWCheck' || commandName === 'onBWDone') {
            // TODO skipping those for now
            transport.sendCommandOrResponse('_error', transactionId, null,
              { code: 'NetConnection.Call.Failed', level: 'error' });
          } else {
            var commandObject = ba.readObject();
            var response = ba.position < ba.length ? ba.readObject() : undefined;
            if (transport.onresponse) {
              transport.onresponse({commandName: commandName, transactionId: transactionId, commandObject: commandObject, response: response});
            }
          }
          return;
        }
        // TODO misc messages
      };
      channel.onusercontrolmessage = function (e: IChunkedChannelUserControlMessage) {
        release || console.log('.. Event ' + e.type + ' +' + e.data.length + ' bytes');
        if (e.type === PING_REQUEST_CONTROL_MESSAGE_ID) {
          channel.sendUserControlMessage(PING_RESPONSE_CONTROL_MESSAGE_ID, e.data);
        }
        if (transport.onevent) {
          transport.onevent({type: e.type, data: e.data});
        }
      };

      return (this.channel = channel);
    }

    call(procedureName: string, transactionId: number, commandObject, args) {
      var channel = this.channel;

      var ba = new flash.utils.ByteArray();
      ba.objectEncoding = TRANSPORT_ENCODING;
      ba.writeObject(procedureName);
      ba.writeObject(transactionId);
      ba.writeObject(commandObject);
      ba.writeObject(args);
      channel.send(MAIN_CHUNKED_STREAM_ID, {
        streamId: DEFAULT_STREAM_ID,
        typeId: TRANSPORT_ENCODING ? COMMAND_MESSAGE_AMF3_ID : COMMAND_MESSAGE_AMF0_ID,
        data: new Uint8Array((<any> ba)._buffer, 0, (<any> ba).length)
      });
    }

    createStream(transactionId: number, commandObject) {
      this.sendCommandOrResponse('createStream', transactionId, commandObject);
    }

    sendCommandOrResponse(commandName: string, transactionId: number, commandObject, response?) {
      var channel = this.channel;

      var ba = new flash.utils.ByteArray();
      ba.writeByte(0); // ???
      ba.objectEncoding = 0; // TRANSPORT_ENCODING;
      ba.writeObject(commandName);
      ba.writeObject(transactionId);
      ba.writeObject(commandObject || null);
      if (arguments.length > 3) {
        ba.writeObject(response);
      }
      channel.send(MAIN_CHUNKED_STREAM_ID, {
        streamId: DEFAULT_STREAM_ID,
        typeId: COMMAND_MESSAGE_AMF3_ID,
        data: new Uint8Array((<any> ba)._buffer, 0, (<any> ba).length)
      });

      /*     // really weird that this does not work
       var ba = new flash.utils.ByteArray();
       ba.objectEncoding = TRANSPORT_ENCODING;
       ba.writeObject('createStream');
       ba.writeObject(transactionId);
       ba.writeObject(commandObject || null);
       channel.send(MAIN_CHUNKED_STREAM_ID, {
       streamId: DEFAULT_STREAM_ID,
       typeId: TRANSPORT_ENCODING ? COMMAND_MESSAGE_AMF3_ID : COMMAND_MESSAGE_AMF0_ID,
       data: new Uint8Array((<any> ba)._buffer, 0, (<any> ba).length)
       });
       */
    }

    _setBuffer(streamId: number, ms: number) {
      this.channel.sendUserControlMessage(SET_BUFFER_CONTROL_MESSAGE_ID, new Uint8Array([
          (streamId >> 24) & 0xFF,
          (streamId >> 16) & 0xFF,
          (streamId >> 8) & 0xFF,
          streamId & 0xFF,
          (ms >> 24) & 0xFF,
          (ms >> 16) & 0xFF,
          (ms >> 8) & 0xFF,
          ms & 0xFF
      ]));
    }

    _sendCommand(streamId: number, data: Uint8Array) {
      this.channel.send(8, {
        streamId: streamId,
        typeId: TRANSPORT_ENCODING ? COMMAND_MESSAGE_AMF3_ID : COMMAND_MESSAGE_AMF0_ID,
        data: data
      });
    }
  }

  var DEFAULT_BUFFER_LENGTH = 100; // ms

  export interface INetStreamData {
    typeId: number;
    data: Uint8Array;
    timestamp: number;
  }

  export interface INetStream {
    ondata: (data: INetStreamData) => void;
    onscriptdata: (type: string, ...data: any[]) => void;
    oncallback: (...args: any[]) => void;

    play(name: string, start?: number, duration?: number, reset?: boolean);
  }

  class NetStream implements INetStream {
    transport: BaseTransport;
    streamId: number;

    ondata: (message: INetStreamData) => void;
    onscriptdata: (type: string, ...data: any[]) => void;
    oncallback: (...args: any[]) => void;

    constructor(transport, streamId) {
      this.transport = transport;
      this.streamId = streamId;
    }

    public play(name: string, start?: number, duration?: number, reset?: boolean) {
      var ba = new flash.utils.ByteArray();
      ba.objectEncoding = TRANSPORT_ENCODING;
      ba.writeObject('play');
      ba.writeObject(0);
      ba.writeObject(null);
      ba.writeObject(name);
      if (arguments.length > 1) {
        ba.writeObject(start);
      }
      if (arguments.length > 2) {
        ba.writeObject(duration);
      }
      if (arguments.length > 3) {
        ba.writeObject(reset);
      }
      this.transport._sendCommand(this.streamId, new Uint8Array((<any> ba)._buffer, 0, (<any> ba).length));
      // set the buffer, otherwise it will stop in ~15 sec
      this.transport._setBuffer(this.streamId, DEFAULT_BUFFER_LENGTH);
    }

    _push(message: IChunkedStreamMessage) {
      switch (message.typeId) {
        case 8:
        case 9:
          if (this.ondata) {
            this.ondata(message);
          }
          break;
        case 18:
        case 20:
          var args = [];
          var ba = new flash.utils.ByteArray();
          ba.writeRawBytes(message.data);
          ba.position = 0;
          ba.objectEncoding = 0;
          while (ba.position < ba.length) {
            args.push(ba.readObject());
          }
          if (message.typeId === 18 && this.onscriptdata) {
            this.onscriptdata.apply(this, args);
          }
          if (message.typeId === 20 && this.oncallback) {
            this.oncallback.apply(this, args);
          }
          break;
      }
    }
  }

  export interface RtmpConnectionString {
    protocol: string;
    host: string;
    port: number;
    app: string;
  }

  export function parseConnectionString(s: string): RtmpConnectionString {
    // The s has to have the following format:
    //   protocol:[//host][:port]/appname[/instanceName]
    var protocolSeparatorIndex = s.indexOf(':');
    if (protocolSeparatorIndex < 0) {
      return null; // no protocol
    }
    if (s[protocolSeparatorIndex + 1] !== '/') {
      return null; // shall have '/' after protocol
    }
    var protocol = s.substring(0, protocolSeparatorIndex).toLocaleLowerCase();
    if (protocol !== 'rtmp' && protocol !== 'rtmpt' && protocol !== 'rtmps' &&
        protocol !== 'rtmpe' && protocol !== 'rtmpte' && protocol !== 'rtmfp') {
      return null;
    }
    var host, port;
    var appnameSeparator = protocolSeparatorIndex + 1;
    if (s[protocolSeparatorIndex + 2] === '/') {
      // has host
      appnameSeparator = s.indexOf('/', protocolSeparatorIndex + 3);
      if (appnameSeparator < 0) {
        return undefined; // has host but no appname
      }
      var portSeparator = s.indexOf(':', protocolSeparatorIndex + 1);
      if (portSeparator >= 0 && portSeparator < appnameSeparator) {
        host = s.substring(protocolSeparatorIndex + 3, portSeparator);
        port = +s.substring(portSeparator + 1, appnameSeparator);
      } else {
        host = s.substring(protocolSeparatorIndex + 3, appnameSeparator);
      }
    }
    var app = s.substring(appnameSeparator + 1);
    return {
      protocol: protocol,
      host: host,
      port: port,
      app: app
    };
  }

}
