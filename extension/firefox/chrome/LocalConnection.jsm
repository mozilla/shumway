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

function LocalConnectionService(content, environment) {
  var api = {
    createLocalConnection: function (connectionName, callback) {
      connectionName = connectionName + '';

      if (connectionName[0] !== '_' && connectionName.split(':').length !== 2) {
        return -1; // LocalConnectionConnectResult.InvalidName
      }
      if (typeof callback !== 'function') {
        return -3; // LocalConnectionConnectResult.InvalidCallback
      }
      if (_getLocalConnection(connectionName)) {
        return -2; // LocalConnectionConnectResult.AlreadyTaken
      }

      var parsedURL = NetUtil.newURI(environment.swfUrl);

      var connection = {
        callback,
        domain: parsedURL.host,
        allowedSecureDomains: Object.create(null),
        allowedInsecureDomains: Object.create(null)
      };
      localConnectionsRegistry[connectionName] = connection;
      return 0; // LocalConnectionConnectResult.Success
    },
    hasLocalConnection: function (connectionName) {
      connectionName = connectionName + '';

      return !!_getLocalConnection(connectionName);
    },
    closeLocalConnection: function (connectionName) {
      connectionName = connectionName + '';

      if (!_getLocalConnection(connectionName)) {
        return -1; // LocalConnectionCloseResult.NotConnected
      }
      delete localConnectionsRegistry[connectionName];
      return 0; // LocalConnectionCloseResult.Success
    },
    sendLocalConnectionMessage: function (connectionName, methodName, argsBuffer, sender,
                                          senderURL) {
      connectionName = connectionName + '';
      methodName = methodName + '';
      senderURL = senderURL + '';
      // TODO: sanitize argsBuffer argument.

      var senderDomain;
      try {
        var parsedURL = NetUtil.newURI(senderURL);
        senderDomain = parsedURL.host;
      } catch (e) {
        // The sender URL should always be valid. If it's not, warn and ignore the message.
        // TODO: add telemetry
        log('Warning: Invalid senderURL encountered while sending LocalConnection message.');
        return;
      }

      var connection = _getLocalConnection(connectionName);
      if (!connection) {
        return;
      }
      try {
        // TODO: change this check to use the domain whitelists set by content.
        // For now, messages are only allowed through if the receiver allows all domains or the
        // message originates in the receiver instance's root SWF's domain.
        // TODO: also check and probably fix how permissions for (in)secure domains are treated.
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
        // TODO: add telemetry
        log('Warning: Unexpected error encountered while sending LocalConnection message.');
      }
    },
    allowDomainsForLocalConnection: function (connectionName, domains, secure) {
      // TODO: activate this and use the whitelisted domains in sendLocalConnectionMessage.
      //var connection = _getLocalConnection(connectionName);
      //if (!connection) {
      //  return;
      //}
      //try {
      //  domains = Components.utils.cloneInto(domains, connection);
      //} catch (e) {
      //  log('error in allowDomainsForLocalConnection: ' + e);
      //  return;
      //}
      //function validateDomain(domain) {
      //  if (typeof domain !== 'string') {
      //    return false;
      //  }
      //  if (domain === '*') {
      //    return true;
      //  }
      //  try {
      //    var uri = NetUtil.newURI('http://' + domain);
      //    return uri.host === domain;
      //  } catch (e) {
      //    return false;
      //  }
      //}
      //if (!Array.isArray(domains) || !domains.every(validateDomain)) {
      //  return;
      //}
      //var allowedDomains = secure ?
      //                     connection.allowedSecureDomains :
      //                     connection.allowedInsecureDomains;
      //domains.forEach(domain => allowedDomains[domain] = true);
    }
  };

  // Don't return `this` even though this object is treated as a ctor. Makes cloning into the
  // content compartment an internal operation the client code doesn't have to worry about.
  return Components.utils.cloneInto(api, content, {cloneFunctions:true});
}
