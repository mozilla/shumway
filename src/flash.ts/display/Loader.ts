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
  import FileLoadingService = Shumway.FileLoadingService;
  import Telemetry = Shumway.Telemetry;

  import AVM2 = Shumway.AVM2.Runtime.AVM2;
  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  import Timeline = Shumway.SWF.Timeline;

  import Rectangle = flash.geom.Rectangle;
  import Matrix = flash.geom.Matrix;
  import ColorTransform = flash.geom.ColorTransform;

  import ActionScriptVersion = flash.display.ActionScriptVersion;
  import BlendMode = flash.display.BlendMode;

  var Event: typeof flash.events.Event;
  var IOErrorEvent: typeof flash.events.IOErrorEvent;
  var ProgressEvent: typeof flash.events.ProgressEvent;
  var LoaderInfo: typeof flash.display.LoaderInfo;
  var MovieClip: typeof flash.display.MovieClip;
  var Scene: typeof flash.display.Scene;
  var FrameLabel: typeof flash.display.FrameLabel;
  var Bitmap: typeof flash.display.Bitmap;
  var BitmapData: typeof flash.display.BitmapData;
  var Graphics: typeof flash.display.Graphics;

  export class Loader extends flash.display.DisplayObjectContainer {

    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      Event = flash.events.Event;
      IOErrorEvent = flash.events.IOErrorEvent;
      ProgressEvent = flash.events.ProgressEvent;
      LoaderInfo = flash.display.LoaderInfo;
      MovieClip = flash.display.MovieClip;
      Scene = flash.display.Scene;
      FrameLabel = flash.display.FrameLabel;
      Bitmap = flash.display.Bitmap;
      BitmapData = flash.display.BitmapData;
      Graphics = flash.display.Graphics;
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
      this._contentLoaderInfo = new LoaderInfo();

      this._dictionary = [];
      this._worker = null;
      this._startPromise = Promise.resolve();
      this._lastPromise = this._startPromise;

      this._dictionary[0] = new Timeline.SpriteSymbol(0, true);
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

    _dictionary: Timeline.Symbol [];
    _worker: Worker;
    _startPromise: any;
    _lastPromise: any;

    private _commitData(data: any): void {
      var loaderInfo = this._contentLoaderInfo;
      var command = data.command;
      switch (command) {
        case 'init':
          var info = data.result;

          loaderInfo._swfVersion = info.swfVersion;
          if (!info.fileAttributes || !info.fileAttributes.doAbc) {
            loaderInfo._actionScriptVersion = ActionScriptVersion.ACTIONSCRIPT2;
          }
          loaderInfo._frameRate = info.frameRate;
          var bbox = info.bbox;
          loaderInfo._width = bbox.xMax - bbox.xMin;
          loaderInfo._height = bbox.yMax - bbox.yMin;

          var rootSymbol = <Timeline.SpriteSymbol>this._dictionary[0];
          rootSymbol.numFrames = info.frameCount;
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
            this._commitAsset(data);
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

    private _commitAsset(data: any): void {
      var symbol;
      var symbolId = data.id;
      switch (data.type) {
        case 'shape':
          symbol = new Timeline.ShapeSymbol(symbolId);
          symbol.graphics = new Graphics();
          if (data.strokeBbox) {
            symbol.strokeBounds = new Rectangle();
            symbol.strokeBounds.copyFromBbox(data.strokeBbox);
          }
          break;
        case 'image':
          symbol = new Timeline.BitmapSymbol(symbolId);
          symbol.width = data.width;
          symbol.height = data.height;
          break;
        case 'label':
        case 'text':
          symbol = new Timeline.TextSymbol(symbolId);
          symbol.tag = data.tag || { };
          break;
        case 'button':
          symbol = new Timeline.ButtonSymbol(symbolId);
          var states = data.states;
          var character, matrix, colorTransform;
          for (var stateName in states) {
            var commands = states[stateName];
            var state;
            if (commands.length === 1) {
              var cmd = commands[0];
              character = this._dictionary[cmd.symbolId];
              matrix = Matrix.fromAny(cmd.matrix);
              if (cmd.cxform) {
                colorTransform = ColorTransform.fromCXForm(cmd.cxform);
              }
            } else {
              character = new Timeline.SpriteSymbol(-1);
              character.frames.push(this._buildFrame(commands));
            }
            symbol[stateName + 'State'] =
              new Timeline.AnimationState(character, 0, matrix, colorTransform);
          }
          break;
        case 'sprite':
          symbol = new Timeline.SpriteSymbol(symbolId);
          symbol.numFrames = data.frameCount;
          var frames = data.frames;
          for (var i = 0; i < frames.length; i++) {
            var frameInfo = frames[i];
            var frame = this._buildFrame(frameInfo.commands);
            var repeat = frameInfo.repeat;
            while (repeat--) {
              symbol.frames.push(frame);
            }
            if (frameInfo.labelName) {
              var frameNum = i + 1;
              symbol.labels.push(new FrameLabel(frameInfo.labelName, frameNum));
            }

            //if (frame.startSounds) {
            //  startSoundRegistrations[frameNum] = frame.startSounds;
            //}

            //var frameScripts = { };
            //if (!this._isAvm2Enabled) {
            //  if (symbol.frameScripts) {
            //    var data = symbol.frameScripts;
            //    for (var i = 0; i < data.length; i += 2) {
            //      var frameNum = data[i] + 1;
            //      var actionsData = new AS2ActionsData(data[i + 1],
            //        's' + symbol.id + 'f' + frameNum + 'i' +
            //          (frameScripts[frameNum] ? frameScripts[frameNum].length : 0));
            //      var script = (function(actionsData, loader) {
            //        return function () {
            //          var avm1Context = loader._avm1Context;
            //          return executeActions(actionsData, avm1Context, this._getAS2Object());
            //        };
            //      })(actionsData, this);
            //      if (!frameScripts[frameNum])
            //        frameScripts[frameNum] = [script];
            //      else
            //        frameScripts[frameNum].push(script);
            //    }
            //  }
            //}
          }
          break;
        case 'font':
          var font = flash.text.Font.createEmbeddedFont(
            data.name, data.bold, data.italic
          );
          //flash.text.Font.registerFont(font);
          return;
        case 'sound':
          // TODO
          return;
        case 'binary':
          // TODO
          return;
      }
      if (data.bbox) {
        symbol.bounds.copyFromBbox(data.bbox);
      }
      this._dictionary[symbolId] = symbol;
    }

    private _commitFrame(data: any): void {
      var loaderInfo = this._contentLoaderInfo;

      if (data.symbolClasses) {
        var symbolClasses = data.symbolClasses;
        var appDomain = AVM2.instance.applicationDomain;
        for (var i = 0; i < symbolClasses.length; i++) {
          var asset = symbolClasses[i];
          var tag = asset.symbolId;
          var symbolClass = appDomain.getClass(asset.className);
          var symbol = this._dictionary[asset.symbolId];
          assert (symbol);
          symbolClass.defaultInitializerArgument = symbol;
          symbol.symbolClass = symbolClass;
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

      var rootSymbol = <Timeline.SpriteSymbol>this._dictionary[0];
      var documentClass = rootSymbol.symbolClass;
      var frames = rootSymbol.frames;
      var frameIndex = frames.length;

      var frame = this._buildFrame(data.commands);
      var repeat = data.repeat;
      while (repeat--) {
        frames.push(frame);
      }

      var root = this._content;
      if (!root) {
        root = documentClass.initializeFrom(rootSymbol);

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

        root._loaderInfo = this._contentLoaderInfo;

        this._content = root;
        this._children[0] = root;
        //this.addChild(root);
      }

      if (flash.display.MovieClip.isType(root)) {
        var mc = <MovieClip>root;
        mc._framesLoaded = frames.length;

        if (data.sceneData) {
          var scenes = data.sceneData.scenes;
          var allLabels = data.sceneData.labels;
          for (var i = 0, n = scenes.length; i < n; i++) {
            var sceneInfo = scenes[i];
            var startFrame = sceneInfo.offset;
            var endFrame = i < n - 1 ? scenes[i + 1].offset : mc._totalFrames;
            var labels = [];
            for (var j = 0; j < allLabels.length; j++) {
              var labelInfo = allLabels[j];
              var frameIndex = labelInfo.frame - startFrame;
              if (frameIndex >= 0 && frameIndex < endFrame) {
                labels.push(new FrameLabel(labelInfo.name, frameIndex + 1));
              }
            }
            mc.addScene(sceneInfo.name, labels, endFrame - startFrame);
          }
        } else {
          mc.addScene('Scene 1', [], rootSymbol.numFrames);
        }

        if (data.labelName) {
          mc.addFrameLabel(frameIndex, data.labelName);
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

      if (frameIndex === 0) {
        documentClass.instanceConstructorNoInitialize.call(root);
        loaderInfo.dispatchEvent(new Event(Event.INIT));
      }
    }

    private _buildFrame(commands: any []): Timeline.Frame {
      var frame = new Timeline.Frame();
      for (var i = 0; i < commands.length; i++) {
        var cmd = commands[i];
        var depth = cmd.depth;
        switch (cmd.code) {
          case 5: // SWF_TAG_CODE_REMOVE_OBJECT
          case 28: // SWF_TAG_CODE_REMOVE_OBJECT2
            frame.remove(depth);
            break;
          default:
            var symbol = this._dictionary[cmd.symbolId];
            assert (symbol);
            var matrix = null;
            var colorTransform = null;
            if (cmd.hasMatrix) {
              matrix = Matrix.fromAny(cmd.matrix);
            }
            if (cmd.hasCxform) {
              colorTransform = ColorTransform.fromCXForm(cmd.cxform);
            }
            var state = new Timeline.AnimationState(
              symbol,
              depth,
              matrix,
              colorTransform,
              cmd.ratio,
              cmd.name,
              cmd.clipDepth,
              [], // TODO filters
              BlendMode.fromNumber(cmd.blendMode),
              cmd.cache,
              [] // TODO actions
            );
            frame.place(depth, state);
            break;
        }
      }
      return frame;
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
      worker.onmessage = function (e) {
        if (e.data.type === 'exception') {
          AVM2.exceptions.push({
            source: 'parser',
            message: e.data.message,
            stack: e.data.stack
          });
        } else {
          loader._commitData(e.data);
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
