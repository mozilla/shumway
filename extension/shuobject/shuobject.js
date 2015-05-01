/**
 * Copyright 2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Implements most of APIs from https://code.google.com/p/swfobject/wiki/api
var shuobject = (function () {
  // Using last loaded script director as a base for Shumway resources
  var lastScriptElement = (document.body || document.getElementsByTagName('head')[0]).lastChild;
  var shumwayHome = combineUrl(lastScriptElement.src, '.');
  // Checking if viewer is hosted remotely
  var shumwayRemote = getOrigin(document.location.href) !== getOrigin(shumwayHome);

  var originalCreateElement = document.createElement;
  var cachedQueryParams;

  function combineUrl(baseUrl, url) {
    return new URL(url, baseUrl).href;
  }

  function getOrigin(url) {
    return new URL(url).origin;
  }

  function onDOMReady(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', function loaded(e) {
      document.removeEventListener('DOMContentLoaded', loaded);
      callback();
    });
  }

  function getDocumentBase() {
    var baseElement = document.getElementsByTagName('base')[0];
    return baseElement ? baseElement.href : document.location.href;
  }

  function parseQueryString(qs) {
    if (!qs) {
      return {};
    }
    if (qs.charAt(0) == '?') {
      qs = qs.slice(1);
    }
    var values = qs.split('&');
    var obj = {};
    for (var i = 0; i < values.length; i++) {
      var kv = values[i].split('=');
      var key = kv[0], value = kv[1];
      obj[decodeURIComponent(key)] = decodeURIComponent(value);
    }
    return obj;
  }

  function createEmptySWFBlob(swfVersion, width, height, framerate, avm2, background) {
    var headerBytes = [0x46, 0x57, 0x53, swfVersion]; // 'FWS'
    var swfBody = [];

    // Encoding SWF dimensions
    var bitsPerSizeComponent = 15;
    var buffer = bitsPerSizeComponent, bufferSize = 5;
    buffer = (buffer << bitsPerSizeComponent); bufferSize += bitsPerSizeComponent;
    while (bufferSize > 8) {
      swfBody.push((buffer >> (bufferSize -= 8)) & 255);
    }
    buffer = (buffer << bitsPerSizeComponent) | (width * 20); bufferSize += bitsPerSizeComponent;
    while (bufferSize > 8) {
      swfBody.push((buffer >> (bufferSize -= 8)) & 255);
    }
    buffer = (buffer << bitsPerSizeComponent); bufferSize += bitsPerSizeComponent;
    while (bufferSize > 8) {
      swfBody.push((buffer >> (bufferSize -= 8)) & 255);
    }
    buffer = (buffer << bitsPerSizeComponent) | (height * 20); bufferSize += bitsPerSizeComponent;
    while (bufferSize > 8) {
      swfBody.push((buffer >> (bufferSize -= 8)) & 255);
    }
    if (bufferSize > 0) {
      swfBody.push((buffer << (8 - bufferSize)) & 255);
    }

    swfBody.push(((framerate - (framerate | 0)) * 255)|0, framerate|0);
    swfBody.push(1, 0); // frame count
    var attributesTagCode = (69 << 6) | 4;
    swfBody.push(attributesTagCode & 255, attributesTagCode >> 8, (avm2 ? 8 : 0), 0, 0, 0);
    if (background !== undefined) {
      var backgroundTagCode = (9 << 6) | 3;
      swfBody.push(backgroundTagCode & 255, backgroundTagCode >> 8,
          (background >> 16) & 255, (background >> 8) & 255, background & 255);
    }
    var frameTagCode = (1 << 6) | 0;
    swfBody.push(frameTagCode & 255, frameTagCode >> 8);
    swfBody.push(0, 0); // end
    var swfSize = swfBody.length + 8;
    var sizeBytes = [swfSize & 255, (swfSize >> 8) & 255, (swfSize >> 16) & 255, (swfSize >> 24) & 255];
    var blob = new Blob([new Uint8Array(headerBytes.concat(sizeBytes, swfBody))], {type: 'application/x-shockwave-flash'});
    return blob;
  }

  var enabledRemoteOrigins = null;

  function fetchRemoteFile(data, target, origin) {
    function sendResponse(args) {
      args.type = 'shumwayFileLoadingResponse';
      args.sessionId = sessionId;
      target.postMessage(args, origin);
    }

    var sessionId = data.sessionId;
    var xhr = new XMLHttpRequest();
    xhr.open(data.method || 'GET', data.url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      if (xhr.status !== 200) {
        sendResponse({topic: 'error', error: 'XHR status: ' + xhr.status});
        return;
      }
      var data = new Uint8Array(xhr.response);
      sendResponse({topic: 'progress', array: data, loaded: data.length, total: data.length});
      sendResponse({topic: 'close'});
    };
    xhr.onerror = function () {
      sendResponse({topic: 'error', error: 'XHR error'});
    };
    xhr.send(data.postData || null);
    sendResponse({topic: 'open'});
  }

  function setupRemote(origin) {
    if (!enabledRemoteOrigins) {
      window.addEventListener('message', function (e) {
        var data = e.data;
        if (typeof data !== 'object' || data === null || data.type !== 'shumwayFileLoading') {
          return;
        }
        if (!enabledRemoteOrigins[e.origin]) {
          return;
        }
        fetchRemoteFile(data, e.source, e.origin);
      });
      enabledRemoteOrigins = Object.create(null);
    }
    enabledRemoteOrigins[origin] = true;
  }

  // Initializes and performs external interface communication.
  function processExternalCommand(iframe, command) {
    switch (command.action) {
      case 'init':
        var externalInterfaceService = this;
        iframe.__flash__registerCallback = function (functionName) {
          console.log('__flash__registerCallback: ' + functionName);
          this[functionName] = function () {
            var args = Array.prototype.slice.call(arguments, 0);
            console.log('__flash__callIn: ' + functionName);
            var result = externalInterfaceService.onExternalCallback(functionName, args);
            return window.eval(result);
          };
        };
        iframe.__flash__unregisterCallback = function (functionName) {
          console.log('__flash__unregisterCallback: ' + functionName);
          delete this[functionName];
        };
        if (window.__flash__toXML) {
          break;
        }
        window.__flash__toXML = function __flash__toXML(obj) {
          switch (typeof obj) {
            case 'boolean':
              return obj ? '<true/>' : '<false/>';
            case 'number':
              return '<number>' + obj + '</number>';
            case 'object':
              if (obj === null) {
                return '<null/>';
              }
              if ('hasOwnProperty' in obj && obj.hasOwnProperty('length')) {
                // array
                var xml = '<array>';
                for (var i = 0; i < obj.length; i++) {
                  xml += '<property id="' + i + '">' + __flash__toXML(obj[i]) + '</property>';
                }
                return xml + '</array>';
              }
              var xml = '<object>';
              for (var i in obj) {
                xml += '<property id="' + i + '">' + __flash__toXML(obj[i]) + '</property>';
              }
              return xml + '</object>';
            case 'string':
              return '<string>' + obj.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</string>';
            case 'undefined':
              return '<undefined/>';
          }
        };
        window.__flash__eval = function (expr) {
          console.log('__flash__eval: ' + expr);
          // allowScriptAccess protects page from unwanted swf scripts,
          // we can execute script in the page context without restrictions.
          return window.eval(expr);
        };
        window.__flash__call = function (expr) {
          console.log('__flash__call (ignored): ' + expr);
        };
        break;
      case 'getId':
        command.result = iframe.id;
        break;
      case 'eval':
        command.result = window.__flash__eval(command.expression);
        break;
      case 'call':
        command.result = window.__flash__call(command.request);
        break;
      case 'register':
        iframe.__flash__registerCallback(command.functionName);
        break;
      case 'unregister':
        iframe.__flash__unregisterCallback(command.functionName);
        break;
    }
  }

  // Exposed as the 'shumway' property in the Shumway iframe, contains:
  // stage, flash namespace, and other Shumway utils.
  function ShumwayBindings(iframeElement) {
    var easelHost = iframeElement.contentWindow.easelHost;
    easelHost.processFrame = this._processFrame.bind(this, iframeElement);
    easelHost.processFSCommand = this._processFSCommand.bind(this, iframeElement);

    var playerWindowIframe = iframeElement.contentWindow.playerWindowIframe.contentWindow;
    var externalInterfaceService = playerWindowIframe.iframeExternalInterface;
    externalInterfaceService.processExternalCommand =
      processExternalCommand.bind(externalInterfaceService, iframeElement);

    this.sec = playerWindowIframe.player.sec;
    this.stage = playerWindowIframe.player.stage;
    this.Shumway = playerWindowIframe.Shumway;
    this.flash = playerWindowIframe.player.sec.flash;
    this.easelHost = easelHost;

    this.onFrame = null;
    this.onFSCommand = null;
  }
  ShumwayBindings.prototype = {
    takeScreenshot: function (options) {
      options = options || {};
      var bounds = options.bounds || null;
      var stageContent = !!options.stageContent;
      var disableHidpi = !!options.disableHidpi;

      var easel = this.easelHost.easel;
      easel.render();
      return easel.screenShot(bounds, stageContent, disableHidpi);
    },
    _processFrame: function (iframeElement) {
      var onFrame = iframeElement.shumway.onFrame;
      if (onFrame) {
        onFrame();
      }
    },
    _processFSCommand: function (iframeElement, command, args) {
      var onFSCommand = iframeElement.shumway.onFSCommand;
      if (onFSCommand) {
        return onFSCommand(command, args);
      }
    }
  };

  // Creates Shumway iframe
  function createSWF(swfUrl, id, width, height, flashvars, params, attributes) {
    var cssStyle;
    if (attributes) {
      swfUrl = swfUrl || attributes['data'];
      id = attributes['id'] || id;
      width = width || attributes['width'];
      height = height || attributes['height'];
      cssStyle = attributes['style'];
    }

    var viewerUrl = combineUrl(shumwayHome, 'iframe/viewer.html');
    var absoluteSwfUrl = combineUrl(getDocumentBase(), swfUrl);

    var iframeElement = document.createElement('iframe');
    if (width) {
      iframeElement.width = width;
    }
    if (height) {
      iframeElement.height = height;
    }
    iframeElement.setAttribute('id', id);
    if (attributes) {
      Object.keys(attributes).forEach(function (name) {
        switch (name.toLowerCase()) {
          case 'styleclass':
            iframeElement.setAttribute('class', attributes[name]);
            break;
          case 'class':
          case 'name':
          case 'align':
            iframeElement.setAttribute(name, attributes[name]);
            break;
        }
      });
    }

    var objectParams = {};
    if (params) {
      Object.keys(params).forEach(function (name) {
        name = name.toLowerCase();
        if (name === 'flashvars') {
          if (!flashvars) {
            flashvars = parseQueryString(params[name]);
          }
        }
        objectParams[name] = params[name];
      });
    }
    var movieParams = {};
    if (flashvars) {
      var flashvarsParts = [];
      Object.keys(flashvars).forEach(function (name) {
        movieParams[name] = flashvars[name];
        flashvarsParts.push(encodeURIComponent(name) + '=' + encodeURIComponent(flashvars[name]));
      });
      if (flashvarsParts.length > 0) {
        objectParams['flashvars'] = flashvarsParts.join('&');
      }
    }

    var pluginParams = {
      baseUrl: getDocumentBase(),
      url: absoluteSwfUrl,
      movieParams: movieParams,
      objectParams: objectParams,
      isRemote: shumwayRemote
    };
    if (shumwayRemote) {
      setupRemote(getOrigin(viewerUrl));
    }
    iframeElement.src = viewerUrl;
    iframeElement.setAttribute('frameborder', '0');
    if (cssStyle) {
      iframeElement.setAttribute('style', cssStyle);
    }
    iframeElement.addEventListener('load', function load(e) {
      iframeElement.removeEventListener('load', load);
      iframeElement.contentWindow.postMessage({type: 'pluginParams', flashParams: pluginParams}, '*');
    });
    return iframeElement;
  }

  // Replaces initial DOM element with Shumway iframe.
  function embedSWF(element, swfUrl, id, width, height, flashvars, params, attributes, callbackFn) {
    var iframeElement = createSWF(swfUrl, id, width, height, flashvars, params, attributes);
    iframeElement.addEventListener('load', function load(e) {
      iframeElement.removeEventListener('load', load);
      if (shumwayRemote) {
        // It's not possible expose the external interface or internals of
        // the Shumway, because iframeElement.contentDocument is not available.
        if (callbackFn) {
          callbackFn({success: true, id: iframeElement.id, ref: iframeElement});
        }
        return;
      }
      var contentDocument = iframeElement.contentDocument;
      contentDocument.addEventListener('shumwaystarted', function started(e) {
        contentDocument.removeEventListener('shumwaystarted', started, true);
        iframeElement.shumway = new ShumwayBindings(iframeElement);
        if (callbackFn) {
          callbackFn({success: true, id: iframeElement.id, ref: iframeElement});
        }
      }, true);
    });
    element.parentNode.replaceChild(iframeElement, element);
  }

  // Copies parameters/attributes from the DOM element and replaces it.
  function replaceBySWF(element, id, callbackFn) {
    // import parameters
    var width = element.getAttribute('width');
    var height = element.getAttribute('height');
    var swfUrl = element.getAttribute('data');
    var attributes = {
      id: element.getAttribute('id'),
      name: element.getAttribute('name'),
      "class": element.getAttribute('class'),
      align: element.getAttribute('align'),
      style: element.getAttribute('style')
    };
    var paramNodes = element.getElementsByTagName('param');
    var params = {};
    for (var i = 0; i < paramNodes.length; i++) {
      var paramName = paramNodes[i].getAttribute('name');
      var paramValue = paramNodes[i].getAttribute('value');
      if (!paramName) {
        continue;
      }
      params[paramName.toLowerCase()] = paramValue;
    }
    if (!swfUrl) {
      swfUrl = params['src'] || params['movie'];
    }
    embedSWF(element, swfUrl, id, width, height, undefined, params, attributes, callbackFn);
  }

  function createAndMonitorShadowObject() {
    var xObject = originalCreateElement.call(document, 'x-shu-object');
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function(mutation) {
        var addedNodes = mutation.addedNodes;
        if (!addedNodes || addedNodes.length === 0) {
          return;
        }
        for (var i = 0; i < addedNodes.length; i++) {
          if (addedNodes[i] === xObject) {
            replaceBySWF(xObject);
            observer.disconnect();
            break;
          }
        }
      });
    });
    observer.observe(document, {childList: true, subtree: true});
    return xObject;
  }

  return {
    /**
     * Specifies the location of the Shumway base folder.
     */
    get shumwayHome() {
      return shumwayHome;
    },

    set shumwayHome(value) {
      shumwayHome = combineUrl(document.location.href, value);
    },

    /**
     * Specifies if Shumway shall take in account cross-domain policies.
     *
     * When true is set, SWF files will be requested by the main page, external
     * interface is disable and Shumway internal objects are not available.
     */
    get shumwayRemote() {
      return shumwayRemote;
    },

    set shumwayRemote(value) {
      shumwayRemote = !!value;
    },

    registerObject: function (id, version, expressInstallSwfurl, callbackFn) {
      onDOMReady(function () {
        var element = document.getElementById(id);
        if (!element) {
          throw new Error('element ' + id + ' was not found');
        }
        replaceBySWF(element, id, callbackFn);
      });
    },
    embedSWF: function (swfUrl, id, width, height, version, expressInstallSwfurl, flashvars, params, attributes, callbackFn) {

      onDOMReady(function () {
        var element = document.getElementById(id);
        if (!element) {
          throw new Error('element ' + id + ' was not found');
        }
        embedSWF(element, swfUrl, id, width, height, flashvars, params, attributes, callbackFn);
      });
    },
    getObjectById: function (id) {
      return document.getElementById(id);
    },
    getFlashPlayerVersion: function () {
      return {major: 10, minor: 0, release: 0};
    },
    hasFlashPlayerVersion: function (version) {
      return true;
    },
    addLoadEvent: function (fn) {
      onDOMReady(fn);
    },
    addDomLoadEvent: function (fn) {
      onDOMReady(fn);
    },
    createSWF: function (attributes, params, id) {
      var element = document.getElementById(id);
      if (!element) {
        throw new Error('element ' + id + ' was not found');
      }
      var iframeElement = createSWF(undefined, id, undefined, undefined, undefined, params, attributes);
      element.parentNode.replaceChild(iframeElement, element);
      return iframeElement;
    },
    removeSWF: function (id) {
      var element = document.getElementById(id);
      element.parentNode.removeChild(element);
    },
    buildEmptySWF: function (swfVersion, width, height, framerate, avm2, background) {
      return URL.createObjectURL(createEmptySWFBlob(swfVersion, width, height, framerate, avm2, background));
    },
    createElement: function (name) {
      if (typeof name !== 'string' || name.toLowerCase() !== 'object') {
        return originalCreateElement.apply(document, arguments);
      }
      return createAndMonitorShadowObject();
    },
    getShumwayObject: function (idOrElement) {
      var element = typeof idOrElement === 'string' ? document.getElementById(idOrElement) : idOrElement;
      if (!element) {
        throw new Error('element ' + idOrElement + ' was not found');
      }
      return element.shumway;
    },
    getQueryParamValue: function (paramName) {
      if (!cachedQueryParams) {
        cachedQueryParams = parseQueryString(document.location.search);
      }
      return cachedQueryParams[paramName];
    },
    hack: function (scope, setNavigatorPlugins) {
      scope = scope || 'all';
      document.createElement = function (name) {
        if (typeof name !== 'string' || name.toLowerCase() !== 'object') {
          return originalCreateElement.apply(document, arguments);
        }
        var fakeIt = false;
        switch (scope) {
          case 'all':
            fakeIt = true;
            break;
          case 'jwplayer':
            var stack = (new Error()).stack;
            fakeIt = stack.indexOf('jwplayer.js') >= 0 &&
                     stack.indexOf('embed') >= 0 &&
                     stack.indexOf('sendEvent') >= 0;
            break;
        }
        if (fakeIt) {
          return createAndMonitorShadowObject();
        } else {
          return originalCreateElement.apply(document, arguments);
        }
      };
      var pluginName = 'Shockwave Flash';
      var mimeTypeName = 'application/x-shockwave-flash';
      if (setNavigatorPlugins && !window.navigator.plugins[pluginName]) {
        var mimeType = {
          description: "Shockwave Flash",
          suffixes: 'swf',
          type: mimeTypeName
        };
        window.navigator.mimeTypes[mimeTypeName] = mimeType;
        var plugin = {
          description: 'Shockwave Flash 10.0 r0 compatible',
          filename: 'shumway.js',
          length: 1,
          name: pluginName,
          '0': mimeType
        };
        mimeType.enabledPlugin = plugin;
        window.navigator.plugins[pluginName] = plugin;
      }
    },
    ua: {
      w3: true,
      pv: [10, 0, 0]
    }
  };
})();
