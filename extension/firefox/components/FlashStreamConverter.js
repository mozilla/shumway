/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var EXPORTED_SYMBOLS = ['FlashStreamConverter'];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;
const FALSH_CONTENT_TYPE = 'application/x-shockwave-flash';
const EXT_PREFIX = 'shumway@labs.mozilla.org';

Cu.import('resource://gre/modules/XPCOMUtils.jsm');
Cu.import('resource://gre/modules/Services.jsm');

function log(aMsg) {
  let msg = 'FlashStreamConverter.js: ' + (aMsg.join ? aMsg.join('') : aMsg);

  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage(msg);
}
function getWindow(top, id) {
  return top.QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIDOMWindowUtils)
            .getOuterWindowWithId(id);
}
function windowID(win) {
  return win.QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIDOMWindowUtils)
            .outerWindowID;
}
function topWindow(win) {
  return win.QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIWebNavigation)
            .QueryInterface(Ci.nsIDocShellTreeItem)
            .rootTreeItem
            .QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIDOMWindow);
}
let application = Cc['@mozilla.org/fuel/application;1']
                    .getService(Ci.fuelIApplication);
let privateBrowsing = Cc['@mozilla.org/privatebrowsing;1']
                        .getService(Ci.nsIPrivateBrowsingService);
let inPrivateBrowswing = privateBrowsing.privateBrowsingEnabled;

function ChromeActions() {
}

ChromeActions.prototype = {
  getUrl: function getUrl(data) {
    return this.url;
  },
  getParams: function getParams() {
    var element = this.window.frameElement;
    var params = {};
    if (element) {
      var tagName = element.nodeName;
      if (tagName == 'EMBED') {
        for (var i = 0; i < element.attributes.length; ++i) {
          params[element.attributes[i].localName] = element.attributes[i].nodeValue;
        }
      } else {
        for (var i = 0; i < element.childNodes.length; ++i) {
          var paramElement = element.childNodes[i];
          if (paramElement.nodeType != 1 ||
              paramElement.nodeName != 'PARAM') continue;

          params[paramElement.getAttribute('name')] = paramElement.getAttribute('value');
        }
      }
    }
    return JSON.stringify(params);
  },
  loadFile: function loadFile(data) {
    var url = data;
    if (url != this.url) {
      // TODO flash cross-origin request
      log("bad url " + url + " " + this.url);
      win.postMessage({callback:"loadFile", url: url,
        error: "only original swf file loading supported"}, "*");
      return;
    }

    var win = this.window;

    var oXHR = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                         .createInstance(Ci.nsIXMLHttpRequest);
    oXHR.open("GET", data, true);
    oXHR.responseType = "arraybuffer";

    var element = this.window.frameElement;
    if (element) {
      // Setting the referer uri, some site doing checks if swf is embedded
      // on the original page.
      var documentURI = element.ownerDocument.location.href;
      oXHR.setRequestHeader("Referer", documentURI);
    }

    oXHR.onreadystatechange = function (oEvent) {
      if (oXHR.readyState === 4) {
        if (oXHR.status === 200) {
          var arrayBuffer = oXHR.response;
          if (arrayBuffer) {
            win.postMessage({callback:"loadFile", url: url, array: arrayBuffer}, "*");
          }
        } else {
          win.postMessage({callback:"loadFile", url: url, error: oXHR.statusText}, "*");
        }
      }
    };

    oXHR.send(null);
  }
};

function FlashStreamConverter() {
}

FlashStreamConverter.prototype = {

  // properties required for XPCOM registration:
  classID: Components.ID('{af1397b9-381f-4008-ba2f-67770e1c7d5d}'),
  classDescription: 'shumway streamconv component',
  contractID: '@mozilla.org/streamconv;1?from=application/x-shockwave-flash&to=*/*',

  QueryInterface: XPCOMUtils.generateQI([
      Ci.nsISupports,
      Ci.nsIStreamConverter,
      Ci.nsIStreamListener,
      Ci.nsIRequestObserver
  ]),

  /*
   * This component works as such:
   * 1. asyncConvertData stores the listener
   * 2. onStartRequest creates a new channel, streams the viewer and cancels
   *    the request so shumway can do the request
   * Since the request is cancelled onDataAvailable should not be called. The
   * onStopRequest does nothing. The convert function just returns the stream,
   * it's just the synchronous version of asyncConvertData.
   */

  // nsIStreamConverter::convert
  convert: function(aFromStream, aFromType, aToType, aCtxt) {
    throw Cr.NS_ERROR_NOT_IMPLEMENTED;
  },

  // nsIStreamConverter::asyncConvertData
  asyncConvertData: function(aFromType, aToType, aListener, aCtxt) {
    if (!Services.prefs.getBoolPref('extensions.shumway.active'))
      throw Cr.NS_ERROR_NOT_IMPLEMENTED;
    // Store the listener passed to us
    this.listener = aListener;
  },

  // nsIStreamListener::onDataAvailable
  onDataAvailable: function(aRequest, aContext, aInputStream, aOffset, aCount) {
    // Do nothing since all the data loading is handled by the viewer.
    log('SANITY CHECK: onDataAvailable SHOULD NOT BE CALLED!');
  },

  // nsIRequestObserver::onStartRequest
  onStartRequest: function(aRequest, aContext) {

    // Setup the request so we can use it below.
    aRequest.QueryInterface(Ci.nsIChannel);
    // Cancel the request so the viewer can handle it.
    aRequest.cancel(Cr.NS_BINDING_ABORTED);

    // Create a new channel that is viewer loaded as a resource.
    var originalURI = aRequest.URI;
    var ioService = Services.io;
    var channel = ioService.newChannel(
                    'resource://shumway/web/viewer.html', null, null);

    // Keep the URL the same so the browser sees it as the same.
    // channel.originalURI = originalURI;
    channel.asyncOpen(this.listener, aContext);

    let actions = Object.create(ChromeActions.prototype);
    actions.url = originalURI.spec;

    // Setup a global listener waiting for the next DOM to be created and verfiy
    // that its the one we want by its URL. When the correct DOM is found create
    // an event listener on that window for the shumway events that require
    // chrome priviledges. Code snippet from John Galt.
    let window = aRequest.loadGroup.groupObserver
                         .QueryInterface(Ci.nsIWebProgress)
                         .DOMWindow;
    let top = topWindow(window);
    let id = windowID(window);
    window = null;

    top.addEventListener('DOMWindowCreated', function onDOMWinCreated(event) {
      let doc = event.originalTarget;
      let win = doc.defaultView;

      if (id == windowID(win)) {
        top.removeEventListener('DOMWindowCreated', onDOMWinCreated, true);
        if (!doc.documentURIObject.equals(channel.originalURI))
          return;

        actions.window = win;

        win.addEventListener("shumway.message", function(event) {
            var message = event.target;
            var action = message.getUserData('action');
            var data = message.getUserData('data');

            if (typeof actions[action] === 'function') {
              var response = actions[action](data);
              message.setUserData('response', response, null);
            }
        }, false, true);

      } else if (!getWindow(top, id)) {
        top.removeEventListener('DOMWindowCreated', onDOMWinCreated, true);
      }
    }, true);
  },

  // nsIRequestObserver::onStopRequest
  onStopRequest: function(aRequest, aContext, aStatusCode) {
    // Do nothing.
  }
};

var NSGetFactory = XPCOMUtils.generateNSGetFactory([FlashStreamConverter]);
