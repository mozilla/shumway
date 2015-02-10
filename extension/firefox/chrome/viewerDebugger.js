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

Components.utils.import('resource://gre/modules/Services.jsm');

var DebugUtils = (function () {
  var baseUrl = null;

  function getBaseUrl() {
    if (baseUrl === null) {
      try {
        baseUrl = Services.prefs.getCharPref('shumway.debug.url');
      } catch (e) {
        baseUrl = 'http://localhost:8010';
      }
    }
    return baseUrl;
  }

  function getEnabledDebuggerId(swfUrl) {
    var id = 0;
    var url = getBaseUrl() + '/debugController/2/1';
    var connection = new PingPongConnection(url, true);
    try {
      id = connection.send({action: 'getDebugger', swfUrl: swfUrl},
        false, 500);
    } catch (e) {
      // ignoring failed send request
    }
    connection.close();
    return id;
  }

  function enableDebug(swfUrl) {
    var url = getBaseUrl() + '/debugController/2/1';
    var connection = new PingPongConnection(url, true);
    try {
      connection.send({action: 'enableDebugging', swfUrl: swfUrl}, true);
    } catch (e) {
      // ignoring failed send request
    }
    connection.close();
  }

  function createDebuggerConnection(swfUrl) {
    var debuggerId = getEnabledDebuggerId(swfUrl);
    if (!debuggerId) {
      return null;
    }

    var url = getBaseUrl() + '/debug/1/' + debuggerId;
    console.log('Starting remote debugger with ' + url);
    return new PingPongConnection(url);
  }

  return {
    get isEnabled() {
      try {
        return Services.prefs.getBoolPref('shumway.debug.enabled');
      } catch (e) {
        return false;
      }
    },
    enableDebug: enableDebug,
    createDebuggerConnection: createDebuggerConnection
  };
})();
