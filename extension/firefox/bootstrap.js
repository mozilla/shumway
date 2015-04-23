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

'use strict';

const RESOURCE_NAME = 'shumway';

let Cc = Components.classes;
let Ci = Components.interfaces;
let Cm = Components.manager;
let Cu = Components.utils;

Cu.import('resource://gre/modules/Services.jsm');

// As of Firefox 13 bootstrapped add-ons don't support automatic registering and
// unregistering of resource urls and components/contracts. Until then we do
// it programatically. See ManifestDirective ManifestParser.cpp for support.

let shumwayBootstrapUtilsURL = null;
let isE10sEnabled = true;


let isEnabledListener = {
  receiveMessage: function(message) {
    return true; // always enabled for the extension
  }
};

function startup(aData, aReason) {
  // Setup the resource url.
  var ioService = Services.io;
  var resProt = ioService.getProtocolHandler('resource')
                  .QueryInterface(Ci.nsIResProtocolHandler);
  var aliasURI = ioService.newURI('content/', 'UTF-8', aData.resourceURI);
  resProt.setSubstitution(RESOURCE_NAME, aliasURI);

  if (isE10sEnabled) {
    try {
      Cc["@mozilla.org/parentprocessmessagemanager;1"]
        .getService(Ci.nsIMessageBroadcaster)
        .addMessageListener('Shumway:Chrome:isEnabled', isEnabledListener);
      Cc['@mozilla.org/globalmessagemanager;1']
        .getService(Ci.nsIFrameScriptLoader)
        .loadFrameScript('chrome://shumway/content/bootstrap-content.js', true);
    } catch (ex) {
      // Some issues with registering child bootstrap script.
      isE10sEnabled = false;
    }
  }

  shumwayBootstrapUtilsURL = aliasURI.spec + 'ShumwayBootstrapUtils.jsm';
  Cu.import(shumwayBootstrapUtilsURL);
  ShumwayBootstrapUtils.register();
}

function shutdown(aData, aReason) {
  if (aReason == APP_SHUTDOWN)
    return;

  var ioService = Services.io;
  var resProt = ioService.getProtocolHandler('resource')
                  .QueryInterface(Ci.nsIResProtocolHandler);
  // Remove the resource url.
  resProt.setSubstitution(RESOURCE_NAME, null);

  ShumwayBootstrapUtils.unregister();
  Cu.unload(shumwayBootstrapUtilsURL);
  shumwayBootstrapUtilsURL = null;

  if (isE10sEnabled) {
    Cc["@mozilla.org/parentprocessmessagemanager;1"]
      .getService(Ci.nsIMessageBroadcaster)
      .removeMessageListener('Shumway:Chrome:isEnabled', isEnabledListener);
    Cc['@mozilla.org/globalmessagemanager;1']
      .getService(Ci.nsIFrameMessageManager)
      .broadcastAsyncMessage('Shumway:Child:shutdown');
    Cc['@mozilla.org/globalmessagemanager;1']
      .getService(Ci.nsIFrameScriptLoader)
      .removeDelayedFrameScript('chrome://shumway/content/bootstrap-content.js');

  }
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}

