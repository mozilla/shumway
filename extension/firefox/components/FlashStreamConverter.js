/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var EXPORTED_SYMBOLS = ['FlashStreamConverter1', 'FlashStreamConverter2'];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

// True only if this is the version of pdf.js that is included with firefox.
const SHUMWAY_CONTENT_TYPE = 'application/x-shockwave-flash';
const EXPECTED_PLAYPREVIEW_URI_PREFIX = 'data:application/x-moz-playpreview;,' +
                                        SHUMWAY_CONTENT_TYPE;

const FIREFOX_ID = '{ec8030f7-c20a-464f-9b0e-13a3a9e97384}';
const SEAMONKEY_ID = '{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}';

Cu.import('resource://gre/modules/XPCOMUtils.jsm');
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/NetUtil.jsm');


let appInfo = Cc['@mozilla.org/xre/app-info;1']
                  .getService(Ci.nsIXULAppInfo);
let Svc = {};
XPCOMUtils.defineLazyServiceGetter(Svc, 'mime',
                                   '@mozilla.org/mime;1',
                                   'nsIMIMEService');

function getBoolPref(pref, def) {
  try {
    return Services.prefs.getBoolPref(pref);
  } catch (ex) {
    return def;
  }
}

function log(aMsg) {
  let msg = 'FlashStreamConverter.js: ' + (aMsg.join ? aMsg.join('') : aMsg);
  Services.console.logStringMessage(msg);
  dump(msg + '\n');
}

function getDOMWindow(aChannel) {
  var requestor = aChannel.notificationCallbacks;
  var win = requestor.getInterface(Components.interfaces.nsIDOMWindow);
  return win;
}

// Combines two URLs. The baseUrl shall be absolute URL. If the url is an
// absolute URL, it will be returned as is.
function combineUrl(baseUrl, url) {
  if (url.indexOf(':') >= 0)
    return url;
  if (url.charAt(0) == '/') {
    // absolute path
    var i = baseUrl.indexOf('://');
    i = baseUrl.indexOf('/', i + 3);
    return baseUrl.substring(0, i) + url;
  } else {
    // relative path
    var pathLength = baseUrl.length, i;
    i = baseUrl.lastIndexOf('#');
    pathLength = i >= 0 ? i : pathLength;
    i = baseUrl.lastIndexOf('?', pathLength);
    pathLength = i >= 0 ? i : pathLength;
    var prefixLength = baseUrl.lastIndexOf('/', pathLength);
    return baseUrl.substring(0, prefixLength + 1) + url;
  }
}

function parseQueryString(qs) {
  if (!qs)
    return {};

  if (qs.charAt(0) == '?')
    qs = qs.slice(1);

  var values = qs.split('&');
  var obj = {};
  for (var i = 0; i < values.length; i++) {
    var kv = values[i].split('=');
    var key = kv[0], value = kv[1];
    obj[key] = value;
  }

  return obj;
}

// All the priviledged actions.
function ChromeActions(url, params, baseUrl, window) {
  this.url = url;
  this.params = params;
  this.baseUrl = baseUrl;
  this.isOverlay = false;
  this.isPausedAtStart = false;
  this.window = window;
}

ChromeActions.prototype = {
  getBoolPref: function (data) {
    if (!/^shumway\./.test(data.pref)) {
      return null;
    }
    return getBoolPref(data.pref, data.def);
  },
  getPluginParams: function getPluginParams() {
    return JSON.stringify({
      url: this.url,
      baseUrl : this.baseUrl,
      params: this.params,
      isOverlay: this.isOverlay,
      isPausedAtStart: this.isPausedAtStart
     });
  },
  _canDownloadFile: function canDownloadFile(url, checkPolicyFile) {
    // TODO flash cross-origin request
    if (url === this.url)
      return true; // allow downloading for the original file

    // let's allow downloading from http(s) and same origin
    var basePrefix = /^(https?:\/\/[A-Za-z0-9\-_\.:\[\]]+\/)/i.exec(this.url);
    if (basePrefix) {
      var urlPrefix = /^(https?:\/\/[A-Za-z0-9\-_\.:\[\]]+\/)/i.exec(url);
      if (urlPrefix && basePrefix[1] === urlPrefix[1])
        return true;
    }

    return false;
  },
  loadFile: function loadFile(data) {
    var url = data.url;
    var checkPolicyFile = data.checkPolicyFile;
    var sessionId = data.sessionId;
    var limit = data.limit || 0;
    var method = data.method || "GET";
    var postData = data.postData || null;

    if (!this._canDownloadFile(url, checkPolicyFile)) {
      log("bad url " + url + " " + this.url);
      win.postMessage({callback:"loadFile", sessionId: sessionId, topic: "error",
        error: "only original swf file or file from the same origin loading supported"}, "*");
      return;
    }

    var win = this.window;

    var xhr = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                         .createInstance(Ci.nsIXMLHttpRequest);
    xhr.open(method, url, true);
    // arraybuffer is not provide onprogress, fetching as regular chars
    if ('overrideMimeType' in xhr)
      xhr.overrideMimeType('text/plain; charset=x-user-defined');

    if (this.baseUrl) {
      // Setting the referer uri, some site doing checks if swf is embedded
      // on the original page.
      xhr.setRequestHeader("Referer", this.baseUrl);
    }

    // TODO apply range request headers if limit is specified

    var lastPosition = 0;
    xhr.onprogress = function (e) {
      var position = e.loaded;
      var chunk = xhr.responseText.substring(lastPosition, position);
      var data = new Uint8Array(chunk.length);
      for (var i = 0; i < data.length; i++)
        data[i] = chunk.charCodeAt(i) & 0xFF;
      win.postMessage({callback:"loadFile", sessionId: sessionId, topic: "progress",
                       array: data, loaded: e.loaded, total: e.total}, "*");
      lastPosition = position;
      if (limit && e.total >= limit) {
        xhr.abort();
      }
    };
    xhr.onreadystatechange = function(event) {
      if (xhr.readyState === 4) {
        if (xhr.status !== 200 && xhr.status !== 0) {
          win.postMessage({callback:"loadFile", sessionId: sessionId, topic: "error",
                           error: xhr.statusText}, "*");
        }
        win.postMessage({callback:"loadFile", sessionId: sessionId, topic: "close"}, "*");
      }
    }
    xhr.send(postData);
    win.postMessage({callback:"loadFile", sessionId: sessionId, topic: "open"}, "*");
  },
  fallback: function() {
    var obj = this.window.frameElement;
    var doc = obj.ownerDocument;
    var e = doc.createEvent("CustomEvent");
    e.initCustomEvent("MozPlayPlugin", true, true, null);
    obj.dispatchEvent(e);
  }
};

// Event listener to trigger chrome privedged code.
function RequestListener(actions) {
  this.actions = actions;
}
// Receive an event and synchronously or asynchronously responds.
RequestListener.prototype.receive = function(event) {
  var message = event.target;
  var doc = message.ownerDocument;
  var action = event.detail.action;
  var data = event.detail.data;
  var sync = event.detail.sync;
  var actions = this.actions;
  if (!(action in actions)) {
    log('Unknown action: ' + action);
    return;
  }
  if (sync) {
    var response = actions[action].call(this.actions, data);
    var detail = event.detail;
    detail.__exposedProps__ = {response: 'r'};
    detail.response = response;
  } else {
    var response;
    if (!event.detail.callback) {
      doc.documentElement.removeChild(message);
      response = null;
    } else {
      response = function sendResponse(response) {
        try {
          var listener = doc.createEvent('CustomEvent');
          listener.initCustomEvent('shumway.response', true, false,
                                   {response: response,
                                    __exposedProps__: {response: 'r'}});

          return message.dispatchEvent(listener);
        } catch (e) {
          // doc is no longer accessible because the requestor is already
          // gone. unloaded content cannot receive the response anyway.
        }
      };
    }
    actions[action].call(this.actions, data, response);
  }
};

function FlashStreamConverterBase() {
}

FlashStreamConverterBase.prototype = {
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
   *    the request so pdf.js can do the request
   * Since the request is cancelled onDataAvailable should not be called. The
   * onStopRequest does nothing. The convert function just returns the stream,
   * it's just the synchronous version of asyncConvertData.
   */

  // nsIStreamConverter::convert
  convert: function(aFromStream, aFromType, aToType, aCtxt) {
    throw Cr.NS_ERROR_NOT_IMPLEMENTED;
  },

  isValidRequest: function() {
    return true;
  },

  createChromeActions: function(window, urlHint) {
    var url;
    var element = window.frameElement;
    var isOverlay = false;
    var params = {};
    if (element) {
      var tagName = element.nodeName;
      while (tagName != 'EMBED' && tagName != 'OBJECT') {
        // plugin overlay skipping until the target plugin is found
        isOverlay = true;
        element = element.parentNode;
        if (!element)
          throw 'Plugin element is not found';
        tagName = element.nodeName;
      }
      if (tagName == 'EMBED') {
        params = parseQueryString(element.getAttribute('flashvars'));
        url = element.getAttribute('src');
      } else {
        for (var i = 0; i < element.childNodes.length; ++i) {
          var paramElement = element.childNodes[i];
          if (paramElement.nodeType != 1 ||
              paramElement.nodeName != 'PARAM') continue;

          params[paramElement.getAttribute('name')] = paramElement.getAttribute('value');
        }
        var dataAttribute = element.getAttribute('data');
        url = dataAttribute || params.movie || params.src;
      }
    }
    var element = window.frameElement;
    var baseUrl = element ? element.ownerDocument.location.href : null; // XXX base url?

    url = url ? combineUrl(baseUrl, url) : urlHint;

    var actions = new ChromeActions(url, params, baseUrl, window);
    actions.isOverlay = isOverlay;
    actions.isPausedAtStart = /\bpaused=true$/.test(urlHint);
    return actions;
  },

  // nsIStreamConverter::asyncConvertData
  asyncConvertData: function(aFromType, aToType, aListener, aCtxt) {
    if(!this.isValidRequest(aCtxt))
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

    var originalURI = aRequest.URI;

    // checking if the plug-in shall be run in simple mode
    var isSimpleMode = originalURI.spec === EXPECTED_PLAYPREVIEW_URI_PREFIX &&
      getBoolPref('shumway.simpleMode', false);

    // Create a new channel that is viewer loaded as a resource.
    var ioService = Services.io;
    var channel = ioService.newChannel(isSimpleMode ?
                    'resource://shumway/web/simple.html' :
                    'resource://shumway/web/viewer.html', null, null);

    var converter = this;
    var listener = this.listener;
    // Proxy all the request observer calls, when it gets to onStopRequest
    // we can get the dom window.
    var proxy = {
      onStartRequest: function() {
        listener.onStartRequest.apply(listener, arguments);
      },
      onDataAvailable: function() {
        listener.onDataAvailable.apply(listener, arguments);
      },
      onStopRequest: function() {
        var domWindow = getDOMWindow(channel);
        // Double check the url is still the correct one.
        if (domWindow.document.documentURIObject.equals(channel.originalURI)) {
          let actions = converter.createChromeActions(domWindow,
                                                      originalURI.spec);
          let requestListener = new RequestListener(actions);
          domWindow.addEventListener('shumway.message', function(event) {
            requestListener.receive(event);
          }, false, true);
        }
        listener.onStopRequest.apply(listener, arguments);
      }
    };

    // XXX? Keep the URL the same so the browser sees it as the same.
    // channel.originalURI = aRequest.URI;
    channel.asyncOpen(proxy, aContext);
  },

  // nsIRequestObserver::onStopRequest
  onStopRequest: function(aRequest, aContext, aStatusCode) {
    // Do nothing.
  }
};

// properties required for XPCOM registration:
function copyProperties(obj, template) {
  for (var prop in template) {
    obj[prop] = template[prop];
  }
}

function FlashStreamConverter1() {}
FlashStreamConverter1.prototype = new FlashStreamConverterBase();
copyProperties(FlashStreamConverter1.prototype, {
  classID: Components.ID('{4c6030f7-e20a-264f-5b0e-ada3a9e97384}'),
  classDescription: 'Shumway Content Converter Component',
  contractID: '@mozilla.org/streamconv;1?from=application/x-shockwave-flash&to=*/*'
});

function FlashStreamConverter2() {}
FlashStreamConverter2.prototype = new FlashStreamConverterBase();
copyProperties(FlashStreamConverter2.prototype, {
  classID: Components.ID('{4c6030f7-e20a-264f-5f9b-ada3a9e97384}'),
  classDescription: 'Shumway PlayPreview Component',
  contractID: '@mozilla.org/streamconv;1?from=application/x-moz-playpreview&to=*/*'
});
FlashStreamConverter2.prototype.isValidRequest =
  (function(aCtxt) {
    try {
      var request = aCtxt;
      request.QueryInterface(Ci.nsIChannel);
      var spec = request.URI.spec;
      return spec.indexOf(EXPECTED_PLAYPREVIEW_URI_PREFIX) === 0;
    } catch (e) {
      return false;
    }
  });

var NSGetFactory1 = XPCOMUtils.generateNSGetFactory([FlashStreamConverter1]);
var NSGetFactory2 = XPCOMUtils.generateNSGetFactory([FlashStreamConverter2]);
