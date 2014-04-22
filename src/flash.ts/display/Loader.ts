/**
 * Copyright 2014 Mozilla Foundation
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

  import AVM2 = Shumway.AVM2.Runtime.AVM2;
  import AbcFile = Shumway.AVM2.ABC.AbcFile;

  import ActionScriptVersion = flash.display.ActionScriptVersion;

  var Event: typeof flash.events.Event;
  var IOErrorEvent: typeof flash.events.IOErrorEvent;
  var ProgressEvent: typeof flash.events.ProgressEvent;
  var MovieClip: typeof MovieClip;
  var Scene: typeof flash.display.Scene;
  var FrameLabel: typeof flash.display.FrameLabel;
  var Bitmap: typeof flash.display.Bitmap;
  var BitmapData: typeof flash.display.BitmapData;

  export class Loader extends flash.display.DisplayObjectContainer {

    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      Event = flash.events.Event;
      IOErrorEvent = flash.events.IOErrorEvent;
      ProgressEvent = flash.events.ProgressEvent;
      MovieClip = flash.display.MovieClip;
      Scene = flash.display.Scene;
      FrameLabel = flash.display.FrameLabel;
      Bitmap = flash.display.Bitmap;
      BitmapData = flash.display.BitmapData;
    };

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
      switch (command) {
        case 'init':
          var result = data.result;
          loaderInfo._swfVersion = result.swfVersion;
          if (!result.fileAttributes || !result.fileAttributes.doAbc) {
            loaderInfo._actionScriptVersion = ActionScriptVersion.ACTIONSCRIPT2;
          }
          loaderInfo._frameRate = result.frameRate;
          var bbox = result.bbox;
          loaderInfo._width = bbox.xMax - bbox.xMin;
          loaderInfo._height = bbox.yMax - bbox.yMin;
          break;
        case 'progress':
          var result = data.result;
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
            Telemetry.instance.reportTelemetry(data.stats);
          }

          this._worker && this._worker.terminate();
          break;
        //case 'empty':
        //  this._lastPromise = Promise.resolve();
        //  break;
        case 'error':
          this._contentLoaderInfo.dispatchEvent(new IOErrorEvent(IOErrorEvent.IO_ERROR));
          break;
        default:
          //TODO: fix special-casing. Might have to move document class out of dictionary[0]
          if (data.id === 0) {
            break;
          }
          if (data.isSymbol) {
            this._commitSymbol(data);
          } else if (data.type === 'frame') {
            this._commitFrame(data);
          } else if (data.type === 'image') {
            this._commitImage(data);
          } else if (data.type === 'abc') {
            var appDomain = AVM2.instance.applicationDomain;
            var abc = new AbcFile(data.data, data.name);
            if (data.flags) {
              // kDoAbcLazyInitializeFlag = 1 Indicates that the ABC block should not be executed
              // immediately.
              appDomain.loadAbc(abc);
            } else {
              appDomain.executeAbc(abc);
            }
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
      var loaderInfo = this._contentLoaderInfo;
      var documentClass: Shumway.AVM2.AS.ASClass;

      if (data.symbolClasses) {
        var symbolClasses = data.symbolClasses;
        var appDomain = AVM2.instance.applicationDomain;
        for (var i = 0; i < symbolClasses.length; i++) {
          var asset = symbolClasses[i];
          //var symbolInfo = dictionary[asset.symbolId];
          //assert (symbolInfo);
          var tag = asset.symbolId;
          if (tag === 0) {
            documentClass = appDomain.getClass(asset.className);
          }
        }
      }

      //if (data.exports && !loaderInfo._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT3) {
      //  var exports = data.exports;
      //  for (var i = 0; i < exports.length; i++) {
      //    var asset = exports[i];
      //    var symbolInfo = dictionary[asset.symbolId];
      //    assert (symbolInfo);
      //    loader._avm1Context.addAsset(asset.className, symbolInfo.props);
      //  }
      //}

      var root = <MovieClip>this._content;
      var frameNum = 1;

      if (!root) {
        if (documentClass) {
          root = new documentClass.instanceConstructor();
        } else {
          root = new MovieClip();
        }

        root._root = root;
        root._name = 'root1';

        //if (!loader._isAvm2Enabled) {
        //  var avm1Context = loader._avm1Context;

        //  // Finding movie top root
        //  var _root = root;
        //  if (parent && parent !== loader._stage) {
        //    var parentLoader = parent.loaderInfo._loader;
        //    while (parentLoader._parent && parentLoader._parent !== loader._stage) {
        //      parentLoader = parentLoader._parent.loaderInfo._loader;
        //    }
        //    if (parentLoader._isAvm2Enabled) {
        //      somewhatImplemented('AVM1Movie');
        //      this._worker && this._worker.terminate();
        //      return;
        //    }
        //    _root = parentLoader._content;
        //  }

        //  var as2Object = _root._getAS2Object();
        //  avm1Context.globals.asSetPublicProperty('_root', as2Object);
        //  avm1Context.globals.asSetPublicProperty('_level0', as2Object);
        //  avm1Context.globals.asSetPublicProperty('_level1', as2Object);

        //  // transfer parameters
        //  var parameters = loader.loaderInfo._parameters;
        //  for (var paramName in parameters) {
        //    if (!(paramName in as2Object)) { // not present yet
        //      as2Object[paramName] = parameters[paramName];
        //    }
        //  }
        //}

        this._content = root;
        //this._children[0] = root;
        this.addChild(root);
      }

      if (data.sceneData) {
        var allScenes = data.sceneData.scenes;
        var allLabels = data.sceneData.labels;
        var i: number = allScenes.length;
        var scenes = root._scenes;
        var scene, labels;
        while (i--) {
          var sceneInfo = allScenes[i];
          var startFrame = sceneInfo.offset;
          var endFrame = root._totalFrames - 1;
          var numFrames = endFrame - startFrame;
          if (!scene) {
            scene = scenes[0];
            scene._name = sceneInfo.name;
            scene._numFrames = numFrames;
            labels = scene.labels;
          } else {
            labels = [];
            scene = new Scene(sceneInfo.name, labels, numFrames);
            scenes.unshift(scene);
          }
          for (var j = 0; j < allLabels.length; j++) {
            var labelInfo = allLabels[j];
            var frame = labelInfo.frame - startFrame;
            if (frame >= 0 && frame < endFrame) {
              labels.push(new FrameLabel(labelInfo.name, frame + 1));
            }
          }
        }
      }

      if (data.labelName) {
        var labelName = data.labelName;
        var scenes = root._scenes;
        var offset = 0;
        findScene: for (var i = 0; i < scenes.length; i++) {
          var scene = scenes[i];
          var labels = scene.labels;
          for (var j = 0; j < labels.length; j++) {
            var label = labels[j];
            if (label.name === labelName) {
              break findScene;
            }
          }
          if (frameNum > offset && frameNum < offset + scene.numFrames) {
            labels.push(new FrameLabel(labelName, frameNum - offset));
          }
          offset += scene.numFrames;
        }
      }

      //if (frame.startSounds) {
      //  root._registerStartSounds(frameNum, frame.startSounds);
      //}
      //if (frame.soundStream) {
      //  root._initSoundStream(frame.soundStream);
      //}
      //if (frame.soundStreamBlock) {
      //  root._addSoundStreamBlock(frameNum, frame.soundStreamBlock);
      //}

      //if (!loader._isAvm2Enabled) {
      //  var avm1Context = loader._avm1Context;

      //  if (initActionBlocks) {
      //    // HACK using symbol init actions as regular action blocks, the spec has a note
      //    // "DoAction tag is not the same as specifying them in a DoInitAction tag"
      //    for (var i = 0; i < initActionBlocks.length; i++) {
      //      var spriteId = initActionBlocks[i].spriteId;
      //      var actionsData = new AS2ActionsData(initActionBlocks[i].actionsData,
      //        'f' + frameNum + 's' + spriteId + 'i' + i);
      //      root.addFrameScript(frameNum - 1, function(actionsData, spriteId, state) {
      //        if (state.executed) return;
      //        state.executed = true;
      //        return executeActions(actionsData, avm1Context, this._getAS2Object());
      //      }.bind(root, actionsData, spriteId, {executed: false}));
      //    }
      //  }

      //  if (actionBlocks) {
      //    for (var i = 0; i < actionBlocks.length; i++) {
      //      var actionsData = new AS2ActionsData(actionBlocks[i],
      //        'f' + frameNum + 'i' + i);
      //      root.addFrameScript(frameNum - 1, (function(actionsData) {
      //        return function () {
      //          return executeActions(actionsData, avm1Context, this._getAS2Object());
      //        };
      //      })(actionsData));
      //    }
      //  }
      //}

      if (frameNum === 1) {
        loaderInfo.dispatchEvent(new Event(Event.INIT));
      }
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
        return (<flash.system.JPEGLoaderContext>context).deblockingFilter;
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
