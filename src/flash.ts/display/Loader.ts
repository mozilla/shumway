/**
 * Copyright 2013 Mozilla Foundation
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
// Class: Loader
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import FileLoadingService = Shumway.FileLoadingService;
  import Telemetry = Shumway.Telemetry;

  import Event = flash.events.Event;
  import IOErrorEvent = flash.events.IOErrorEvent;
  import ProgressEvent = flash.events.ProgressEvent;
  import Bitmap = flash.display.Bitmap;
  import BitmapData = flash.display.BitmapData;

  export class Loader extends flash.display.DisplayObjectContainer {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = ["load"]; // ["uncaughtErrorEvents", "addChild", "addChildAt", "removeChild", "removeChildAt", "setChildIndex", "load", "sanitizeContext", "loadBytes", "close", "unload", "unloadAndStop", "cloneObject"];

    static RELEASE = false;
    static WORKERS_ENABLED = true;
    static SHUMWAY_ROOT = '../../src/';
    static LOADER_PATH = Loader.RELEASE ? 'shumway-worker.js' : 'swf/resourceloader.js';

    constructor () {
      false && super();
      DisplayObjectContainer.instanceConstructorNoInitialize.call(this);
      this._content = null;
      this._contentLoaderInfo = new flash.display.LoaderInfo();

      this._dictionary = Object.create(null);
      this._worker = null;
      this._startPromise = Promise.resolve();
      this._lastPromise = this._startPromise;
    }

    // JS -> AS Bindings

    //uncaughtErrorEvents: flash.events.UncaughtErrorEvents;
    //addChild: (child: flash.display.DisplayObject) => flash.display.DisplayObject;
    //addChildAt: (child: flash.display.DisplayObject, index: number /*int*/) => flash.display.DisplayObject;
    //removeChild: (child: flash.display.DisplayObject) => flash.display.DisplayObject;
    //removeChildAt: (index: number /*int*/) => flash.display.DisplayObject;
    //setChildIndex: (child: flash.display.DisplayObject, index: number /*int*/) => void;
    //load: (request: flash.net.URLRequest, context: flash.system.LoaderContext = null) => void;
    //sanitizeContext: (context: flash.system.LoaderContext) => flash.system.LoaderContext;
    //loadBytes: (bytes: flash.utils.ByteArray, context: flash.system.LoaderContext = null) => void;
    //close: () => void;
    //unload: () => void;
    //unloadAndStop: (gc: boolean = true) => void;
    //cloneObject: (obj: ASObject) => ASObject;

    // AS -> JS Bindings

    _content: flash.display.DisplayObject;
    _contentLoaderInfo: flash.display.LoaderInfo;
    // _uncaughtErrorEvents: flash.events.UncaughtErrorEvents;

    _dictionary: any;
    _worker: Worker;
    _startPromise: any;
    _lastPromise: any;

    private _commitData(data: any): void {
      var loaderInfo = this._contentLoaderInfo;
      var command = data.command;
      var result = data.result;
      switch (command) {
        case 'init':
          loaderInfo._swfVersion = result.swfVersion;
          loaderInfo._frameRate = result.frameRate;
          var bbox = result.bbox;
          loaderInfo._width = bbox.xMax - bbox.xMin;
          loaderInfo._height = bbox.yMax - bbox.yMin;
          break;
        case 'progress':
          loaderInfo._bytesLoaded = result.bytesLoaded || 0;
          loaderInfo._bytesTotal = result.bytesTotal || 0;
          var event = new ProgressEvent(
            ProgressEvent.PROGRESS,
            false,
            false,
            loaderInfo._bytesLoaded,
            loaderInfo._bytesTotal
          );
          loaderInfo.dispatchEvent(event);
          break;
        case 'complete':
          this._lastPromise.then(function () {
            loaderInfo.dispatchEvent(new Event(Event.COMPLETE));
          });

          if (data.stats) {
            Telemetry.instance.reportTelemetry(result.stats);
          }

          this._worker && this._worker.terminate();
          break;
        case 'empty':
          //this._lastPromise = Promise.resolve();
          break;
        case 'error':
          this._contentLoaderInfo.dispatchEvent(new IOErrorEvent(IOErrorEvent.IO_ERROR));
          break;
        default:
          //TODO: fix special-casing. Might have to move document class out of dictionary[0]
          if (result.id === 0) {
            break;
          }
          if (result.isSymbol) {
            this._commitSymbol(result);
          } else if (data.type === 'frame') {
            this._commitFrame(result);
          } else if (data.type === 'image') {
            this._commitImage(result);
          }
          break;
      }
    }

    private _commitSymbol(data: any): void {
      var symbol = new flash.display.DisplayObject();
      // TODO
      this._dictionary[data.id] = symbol;
    }

    private _commitFrame(data: any): void {
      var root = this._content;
      if (!root) {
        root = new flash.display.MovieClip();
        root._root = root;
        root._name = 'root1';

        this._content = root;
        this._children[0] = root;

        this._contentLoaderInfo.dispatchEvent(new Event(Event.INIT));
      }
      // TODO
    }

    private _commitImage(data: any): void {
      var bd = new BitmapData(data.width, data.height);
      var b = new Bitmap(bd);
      this._content = b;
      this._children[0] = b;

      var loaderInfo = this._contentLoaderInfo;
      loaderInfo._width = data.width;
      loaderInfo._height = data.height;

      loaderInfo.dispatchEvent(new Event(Event.INIT));
    }

    get content(): flash.display.DisplayObject {
      return this._content;
    }

    get contentLoaderInfo(): flash.display.LoaderInfo {
      return this._contentLoaderInfo;
    }

    load: (request: flash.net.URLRequest, context: flash.system.LoaderContext = null) => void;

    _close(): void {
      notImplemented("public flash.display.Loader::_close"); return;
    }
    _unload(stopExecution: boolean, gc: boolean): void {
      stopExecution = !!stopExecution; gc = !!gc;
      notImplemented("public flash.display.Loader::_unload"); return;
    }

    _getJPEGLoaderContextdeblockingfilter(context: flash.system.LoaderContext): number {
      if (flash.system.JPEGLoaderContext.isType(context)) {
        return context.deblockingFilter;
      }
      return 0.0;
    }

    _getUncaughtErrorEvents(): flash.events.UncaughtErrorEvents {
      notImplemented("public flash.display.Loader::_getUncaughtErrorEvents"); return;
    }
    _setUncaughtErrorEvents(value: flash.events.UncaughtErrorEvents): void {
      value = value;
      notImplemented("public flash.display.Loader::_setUncaughtErrorEvents"); return;
    }

    _load(request: flash.net.URLRequest, checkPolicyFile: boolean, applicationDomain: flash.system.ApplicationDomain, securityDomain: flash.system.SecurityDomain, requestedContentParent: flash.display.DisplayObjectContainer, parameters: ASObject, deblockingFilter: number, allowCodeExecution: boolean, imageDecodingPolicy: string): void {
      //request = request; checkPolicyFile = !!checkPolicyFile; applicationDomain = applicationDomain; securityDomain = securityDomain; requestedContentParent = requestedContentParent; parameters = parameters; deblockingFilter = +deblockingFilter; allowCodeExecution = !!allowCodeExecution; imageDecodingPolicy = asCoerceString(imageDecodingPolicy);
      //if (flash.net.URLRequest.isType(request)) {
        this._contentLoaderInfo._url = request.url;
      //}
      var worker;
      if (Loader.WORKERS_ENABLED) {
        worker = new Worker(Loader.SHUMWAY_ROOT + Loader.LOADER_PATH);
      } else {
        worker = new ResourceLoader(window);
      }
      var loader = this;
      //loader._worker = worker;
      worker.onmessage = function (evt) {
        if (evt.data.type === 'exception') {
          //avm2.exceptions.push({source: 'parser', message: evt.data.message,
          //  stack: evt.data.stack});
        } else {
          loader._commitData(evt.data);
        }
      };
      //if (flash.net.URLRequest.class.isInstanceOf(request)) {
        var session = FileLoadingService.instance.createSession();
        session.onprogress = function (data, progress) {
          worker.postMessage({ data: data, progress: progress });
        };
        session.onerror = function (error) {
          loader._commitData({ command: 'error', error: error });
        };
        session.onopen = function () {
          worker.postMessage('pipe:');
        };
        session.onclose = function () {
          worker.postMessage({ data: null });
        };
        session.open(request._toFileRequest());
      //} else {
      //  worker.postMessage(request);
      //}
    }

    _loadBytes(bytes: flash.utils.ByteArray, checkPolicyFile: boolean, applicationDomain: flash.system.ApplicationDomain, securityDomain: flash.system.SecurityDomain, requestedContentParent: flash.display.DisplayObjectContainer, parameters: ASObject, deblockingFilter: number, allowCodeExecution: boolean, imageDecodingPolicy: string): void {
      bytes = bytes; checkPolicyFile = !!checkPolicyFile; applicationDomain = applicationDomain; securityDomain = securityDomain; requestedContentParent = requestedContentParent; parameters = parameters; deblockingFilter = +deblockingFilter; allowCodeExecution = !!allowCodeExecution; imageDecodingPolicy = asCoerceString(imageDecodingPolicy);
      notImplemented("public flash.display.Loader::_loadBytes"); return;
    }
  }
}
