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

var EXPORTED_SYMBOLS = ['LocalConnectionService'];

Components.utils.import('resource://gre/modules/NetUtil.jsm');
Components.utils.import('resource://gre/modules/Services.jsm');

const localConnectionsRegistry = Object.create(null);

function _getLocalConnection(connectionName) {
  // Treat invalid connection names as non-existent.
  if (typeof connectionName !== 'string' ||
      connectionName[0] !== '_' && connectionName.split(':').length !== 2) {
    return null;
  }
  var connection = localConnectionsRegistry[connectionName];
  if (connection && Components.utils.isDeadWrapper(connection.callback)) {
    delete localConnectionsRegistry[connectionName];
    return null;
  }
  return localConnectionsRegistry[connectionName];
}

function LocalConnectionService() {
}
LocalConnectionService.prototype = {
  createLocalConnection: function(swfUrl, connectionName, callback) {
    if (connectionName[0] !== '_' && connectionName.split(':').length !== 2) {
      return -1; // LocalConnectionConnectResult.InvalidName
    }
    if (this.hasLocalConnection(connectionName)) {
      return -2; // LocalConnectionConnectResult.AlreadyTaken
    }

    var parsedURL = NetUtil.newURI(swfUrl);

    var connection = {
      callback,
      domain: parsedURL.host,
      allowedSecureDomains: Object.create(null),
      allowedInsecureDomains: Object.create(null)
    };
    localConnectionsRegistry[connectionName] = connection;
    return 0; // LocalConnectionConnectResult.Success
  },
  hasLocalConnection: function(connectionName) {
    return !!_getLocalConnection(connectionName);
  },
  closeLocalConnection: function(connectionName) {
    if (!_getLocalConnection(connectionName)) {
      return -1; // LocalConnectionCloseResult.NotConnected
    }
    delete localConnectionsRegistry[connectionName];
    return 0; // LocalConnectionCloseResult.Success
  },
  sendLocalConnectionMessage: function(connectionName, methodName, argsBuffer, senderDomain) {
    var connection = _getLocalConnection(connectionName);
    if (!connection) {
      return;
    }
    try {
      // TODO: change this check to use the domain whitelists set by content.
      // For now, messages are only allowed through if the receiver allows all domains or the
      // message originates in the receiver instance's root SWF's domain.
      //var allowedDomains = parsedURL.schemeIs('https') ?
      //                     connection.allowedSecureDomains :
      //                     connection.allowedInsecureDomains;
      if (!(connectionName[0] === '_' || senderDomain === connection.domain ||
            '*' in allowedDomains)) {
        log(`LocalConnection rejected: domain ${senderDomain} not allowed.`);
        return {
          name: 'SecurityError',
          $Bgmessage: "The current security context does not allow this operation.",
          _errorID: 3315
        };
      }
      var callback = connection.callback;
      var clonedArgs = Components.utils.cloneInto(argsBuffer, callback);
      callback(methodName, clonedArgs);
    } catch (e) {
      log('Warning: Unexpected error encountered while sending LocalConnection message.');
    }
  },
  allowDomainsForLocalConnection: function(connectionName, domains, secure) {
    var connection = _getLocalConnection(connectionName);
    if (!connection) {
      return;
    }
    try {
      domains = Components.utils.cloneInto(domains, connection);
    } catch (e) {
      log('error in allowDomainsForLocalConnection: ' + e);
      return;
    }
    function validateDomain(domain) {
      if (typeof domain !== 'string') {
        return false;
      }
      if (domain === '*') {
        return true;
      }
      try {
        var uri = NetUtil.newURI('http://' + domain);
        return uri.host === domain;
      } catch (e) {
        return false;
      }
    }
    if (!Array.isArray(domains) || !domains.every(validateDomain)) {
      return;
    }
    var allowedDomains = secure ?
                         connection.allowedSecureDomains :
                         connection.allowedInsecureDomains;
    domains.forEach(domain => allowedDomains[domain] = true);
  }
};
