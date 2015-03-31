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
/*jslint node: true */

// Simple HTTP server for synchronous XHR communication.
// See also examples/inspector/debug/pingpong.js.

'use strict';

var http = require('http');

var ALLOW_FROM_DOMAIN = 'http://localhost:8000';
var DEFAULT_BIND_HOST = 'localhost';
var DEFAULT_BIND_PORT = 8010;

var IDLE_TIMEOUT = 500;
var SYNC_TIMEOUT = 120000;
var BROADCAST_TIMEOUT = 3000;

var incomingData = {};
var incomingResponse = {};
var outgoingResponse = {};
var currentReading = [];

var broadcastQueues = {};
var broadcastResponses = {};

var verbose = false;

function WebServer() {
  this.host = DEFAULT_BIND_HOST;
  this.port = DEFAULT_BIND_PORT;
  this.server = null;
}
WebServer.prototype = {
  start: function (callback) {
    this.server = http.createServer(this._handler.bind(this));
    this.server.listen(this.port, this.host, callback);
    console.log(
        'Server running at http://' + this.host + ':' + this.port + '/');
    console.log('Allowing requests from: ' + ALLOW_FROM_DOMAIN);
  },
  stop: function (callback) {
    this.server.close(callback);
    this.server = null;
  },
  _handler: function (request, response) {
    function setStandardHeaders(response) {
      response.setHeader('Access-Control-Allow-Origin', ALLOW_FROM_DOMAIN);
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-PingPong-Timeout');
      response.setHeader('Access-Control-Expose-Headers', 'Content-Type,X-PingPong-Async,X-PingPong-From,X-PingPong-Error');
      response.setHeader('Content-Type', 'text/plain');
      response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.setHeader('Pragma', 'no-cache');
      response.setHeader('Expires', 0);
    }

    function sendData(response, data, isAsync, fromId) {
      setStandardHeaders(response);
      response.setHeader('Content-Type', 'text/plain');
      if (isAsync) {
        response.setHeader('X-PingPong-Async', 1);
      }
      response.setHeader('X-PingPong-From', fromId);
      response.writeHead(200);
      response.end(data);
    }

    function sendNoData(response) {
      setStandardHeaders(response);
      response.writeHead(204);
      response.end();
    }

    function sendTimeout(response) {
      setStandardHeaders(response);
      response.setHeader('X-PingPong-Error', 'timeout');
      response.writeHead(204);
      response.end();
    }

    var method = request.method;
    if (request.method === 'OPTIONS') {
      setStandardHeaders(response);
      response.writeHead(200);
      response.end();
      return;
    }

    var url = request.url;
    var urlParts = /([^?]*)((?:\?(.*))?)/.exec(url);
    var pathParts = urlParts[1].split('/');
    var queryPart = urlParts[3];

    var sessionId = pathParts[1], fromId = pathParts[2], toId = pathParts[3];
    var isBroadcast = !toId;
    var isResponse = queryPart === 'response', isAsync = queryPart === 'async';
    verbose && console.log(sessionId + ': ' + fromId + '->' + toId + ' ' +
                           isResponse + ' ' + isAsync + ' ' + request.method);
    var keyId = sessionId + '_' + fromId + '_' + toId;
    var reverseKeyId = sessionId + '_' + toId + '_' + fromId;

    if (request.method === 'POST') {
      if (isBroadcast && (!isAsync || isResponse)) {
        setStandardHeaders(response);
        response.writeHead(500);
        response.end('Invalid request');
        return;
      }

      response.on('close', function () {
        verbose && console.log('connection closed'); // TODO client closed without response.end
      });

      var body = '';
      request.on('data', function (data) {
        body += data;
      });
      request.on('end', function () {
        verbose && console.log(' ... ' + body.substring(0, 140));
        item.isReady = true;
        while (currentReading.length > 0 && currentReading[0].isReady) {
          currentReading.shift().fn();
        }
      });

      var item = {
        isReady: false,
        fn: function () {
          if (isBroadcast) {
            if (!broadcastQueues[sessionId]) {
              broadcastQueues[sessionId] = [];
            }
            var queue = broadcastQueues[sessionId];
            var message = {data: body, sentTo: { }};
            broadcastQueues[sessionId].push(message);
            var requestTimeout = +request.headers['x-pingpong-timeout'];
            var broadcastTimeout = requestTimeout || BROADCAST_TIMEOUT;
            setTimeout(function () {
              var i = queue.indexOf(message);
              queue.splice(i, 1);
              if (queue.length === 0) {
                delete broadcastQueues[sessionId];
              }
            }, broadcastTimeout);
            if (broadcastResponses[sessionId]) {
              broadcastResponses[sessionId].forEach(function (responseInfo) {
                sendData(responseInfo.response, body, true, responseInfo.fromId);
                message.sentTo[responseInfo.fromId] = true;
              });
              delete broadcastResponses[sessionId];
            }
            sendNoData(response);
          } else if (isResponse) {
            if (outgoingResponse[reverseKeyId]) {
              sendData(outgoingResponse[reverseKeyId].shift().response, body, true, fromId);
              if (outgoingResponse[reverseKeyId].length === 0) {
                delete outgoingResponse[reverseKeyId];
              }
            } else {
              console.error('Out of sequence response for ' + reverseKeyId);
            }
            sendNoData(response);
          } else {
            if (!isAsync) {
              if (!outgoingResponse[keyId]) {
                outgoingResponse[keyId] = [];
              }
              var requestTimeout = +request.headers['x-pingpong-timeout'];
              var syncTimeout = requestTimeout || SYNC_TIMEOUT;
              outgoingResponse[keyId].push({response: response});
              setTimeout(function () {
                var responses = outgoingResponse[keyId];
                if (!responses) {
                  return;
                }
                for (var i = 0; i < responses.length; i++) {
                  if (responses[i].response === response) {
                    if (responses.length === 1) {
                      delete outgoingResponse[keyId];
                    } else {
                      responses.splice(i, 1);
                    }
                    sendTimeout(response);
                    if (!requestTimeout) {
                      console.error('Sync request timeout: ' + keyId);
                    }
                    break;
                  }
                }
              }, syncTimeout);
            } else {
              sendNoData(response);
            }
            if (incomingResponse[reverseKeyId]) {
              sendData(incomingResponse[reverseKeyId].response, body, isAsync, fromId);
              delete incomingResponse[reverseKeyId];
            } else {
              if (!incomingData[reverseKeyId]) {
                incomingData[reverseKeyId] = [];
              }
              incomingData[reverseKeyId].push({data: body, isAsync: isAsync});
            }
          }
        }
      };
      currentReading.push(item);
      return;
    }

    if (request.method == 'GET' && !isResponse) {
      var wasSent = false;
      if (isBroadcast) {
        var queue = broadcastQueues[sessionId];
        if (queue) {
          wasSent = queue.some(function (item) {
            if (item.sentTo[fromId]) {
              return false;
            }
            sendData(response, item.data, true, fromId);
            item.sentTo[fromId] = true;
            return true;
          });
        }
        if (!wasSent) {
          if (!broadcastResponses[sessionId]) {
            broadcastResponses[sessionId] = [];
          }
          broadcastResponses[sessionId].push({response: response, fromId: fromId});
        }
      } else if (incomingData[keyId]) {
        var data = incomingData[keyId].shift();
        sendData(response, data.data, data.isAsync, toId);
        if (incomingData[keyId].length === 0) {
          delete incomingData[keyId];
        }
        wasSent = true;
      } else {
        if (incomingResponse[keyId]) {
          console.error('Double incoming response from ' + keyId);
        }
        incomingResponse[keyId] = {response: response};
      }
      if (wasSent) {
        return;
      }
      setTimeout(function () {
        if (isBroadcast) {
          var responses = broadcastResponses[sessionId];
          if (responses) {
            for (var i = 0; i < responses.length; i++) {
              if (responses[i].response === response) {
                sendTimeout(response);
                responses.splice(i, 1);
                break;
              }
            }
            if (responses.length === 0) {
              delete broadcastResponses[sessionId];
            }
          }
        } else {
          if (incomingResponse[keyId] && incomingResponse[keyId].response === response) {
            delete incomingResponse[keyId];
            sendTimeout(response);
          }
        }
      }, IDLE_TIMEOUT);
      return;
    }

    setStandardHeaders(response);
    response.writeHead(500);
    response.end('Invalid request');
  }
};

var server = new WebServer();
server.start();
