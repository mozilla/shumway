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

///<reference path='references.ts' />
module Shumway.AVM2.AS {
  import throwError = Shumway.AVM2.Runtime.throwError;
  import flash = Shumway.AVM2.AS.flash;
  import Multiname = Shumway.AVM2.ABC.Multiname;

  import assert = Shumway.Debug.assert;

  function M(classSimpleName: string, nativeName?: string, cls?: ASClass ) {
    return {
      classSimpleName: classSimpleName, nativeName: nativeName, cls: cls
    };
  }

  /**
   * Creates a self patching getter that lazily constructs the class and memoizes
   * to the class's instance constructor.
   */
  function makeStub(container, classSimpleName, shortName) {
    Object.defineProperty(container, shortName, {
      get: function () {
        release || assert (Shumway.AVM2.Runtime.AVM2.instance, "AVM2 needs to be initialized.");
        var cls = Shumway.AVM2.Runtime.AVM2.instance.systemDomain.getClass(classSimpleName);
        release || assert(cls.instanceConstructor);
        Object.defineProperty(container, shortName, {
          value: cls.instanceConstructor,
          writable: false
        });
        return container[shortName];
      },
      configurable: true
    });
  }

  declare var escape;
  declare var unescape;
  declare var AMFUtils;

  /* tslint:disable */
  jsGlobal["flash"] = Shumway.AVM2.AS.flash;
  /* tslint:enable */

  export function linkNatives(runtime: Shumway.AVM2.Runtime.AVM2) {

    var symbols = [
      M("flash.display.DisplayObject", "DisplayObjectClass", flash.display.DisplayObject),
      M("flash.display.InteractiveObject", "InteractiveObjectClass",
        flash.display.InteractiveObject),
      M("flash.display.DisplayObjectContainer", "ContainerClass",
        flash.display.DisplayObjectContainer),
      M("flash.display.Sprite", "SpriteClass", flash.display.Sprite),
      M("flash.display.MovieClip", "MovieClipClass", flash.display.MovieClip),
      M("flash.display.Shape", "ShapeClass", flash.display.Shape),
      M("flash.display.Bitmap", "BitmapClass", flash.display.Bitmap),
      M("flash.display.BitmapData", "BitmapDataClass", flash.display.BitmapData),
      M("flash.display.Stage", "StageClass", flash.display.Stage),
      M("flash.display.Loader", "LoaderClass", flash.display.Loader),
      M("flash.display.LoaderInfo", "LoaderInfoClass", flash.display.LoaderInfo),
      M("flash.display.Graphics", "GraphicsClass", flash.display.Graphics),
      M("flash.display.SimpleButton", "SimpleButtonClass", flash.display.SimpleButton),
      M("flash.display.MorphShape", "MorphShapeClass", flash.display.MorphShape),
      M("flash.display.NativeMenu", "MenuClass", flash.display.NativeMenu),
      M("flash.display.NativeMenuItem", "MenuItemClass", flash.display.NativeMenuItem),
      M("flash.display.FrameLabel", "FrameLabelClass", flash.display.FrameLabel),
      M("flash.display.Scene", "SceneClass", flash.display.Scene),
//    M("flash.display.Shader", "ShaderClass", flash.display.Shader),
//    M("flash.display.ShaderData", "ShaderDataClass", flash.display.ShaderData),

      M("flash.filters.BevelFilter", "BevelFilterClass", flash.filters.BevelFilter),
      M("flash.filters.BitmapFilter", "BitmapFilterClass", flash.filters.BitmapFilter),
      M("flash.filters.BlurFilter", "BlurFilterClass", flash.filters.BlurFilter),
      M("flash.filters.ColorMatrixFilter", "ColorMatrixFilterClass",
        flash.filters.ColorMatrixFilter),
      M("flash.filters.ConvolutionFilter", "ConvolutionFilterClass",
        flash.filters.ConvolutionFilter),
      M("flash.filters.DisplacementMapFilter", "DisplacementMapFilterClass",
        flash.filters.DisplacementMapFilter),
      M("flash.filters.DropShadowFilter", "DropShadowFilterClass", flash.filters.DropShadowFilter),
      M("flash.filters.GlowFilter", "GlowFilterClass", flash.filters.GlowFilter),
      M("flash.filters.GradientBevelFilter", "GradientBevelFilterClass",
        flash.filters.GradientBevelFilter),
      M("flash.filters.GradientGlowFilter", "GradientGlowFilterClass",
        flash.filters.GradientGlowFilter),
//    M("flash.filters.ShaderFilter", "ShaderFilterClass", flash.filters.ShaderFilter),

      M("flash.geom.Point", "PointClass", flash.geom.Point),
      M("flash.geom.Rectangle", "RectangleClass", flash.geom.Rectangle),
      M("flash.geom.Matrix", "MatrixClass", flash.geom.Matrix),
      M("flash.geom.Matrix3D", "Matrix3DClass", flash.geom.Matrix3D),
      M("flash.geom.Vector3D", "Vector3DClass", flash.geom.Vector3D),
      M("flash.geom.Transform", "TransformClass", flash.geom.Transform),
      M("flash.geom.ColorTransform", "ColorTransformClass", flash.geom.ColorTransform),

      M("flash.events.EventDispatcher", "EventDispatcherClass", flash.events.EventDispatcher),
      M("flash.events.Event", "EventClass", flash.events.Event),
      M("flash.events.IOErrorEvent"),
      M("flash.events.KeyboardEvent", "KeyboardEventClass", flash.events.KeyboardEvent),
      M("flash.events.MouseEvent", "MouseEventClass", flash.events.MouseEvent),
      M("flash.events.GestureEvent", "GestureEventClass", flash.events.GestureEvent),
      M("flash.events.TextEvent", "TextEventClass", flash.events.TextEvent),
      M("flash.events.TimerEvent", "TimerEventClass", flash.events.TimerEvent),
      M("flash.events.ProgressEvent", "ProgressEventClass", flash.events.ProgressEvent),
      M("flash.events.NetStatusEvent"),
      M("flash.events.HTTPStatusEvent"),

      M("flash.external.ExternalInterface", "ExternalInterfaceClass",
        flash.external.ExternalInterface),

      M("flash.ui.ContextMenu", "ContextMenuClass", flash.ui.ContextMenu),
      M("flash.ui.ContextMenuItem", "ContextMenuItemClass", flash.ui.ContextMenuItem),
      M("flash.ui.Keyboard", "KeyboardClass", flash.ui.Keyboard),
      M("flash.ui.Mouse", "MouseClass", flash.ui.Mouse),
      M("flash.ui.MouseCursorData", "MouseCursorDataClass", flash.ui.MouseCursorData),

      M("flash.ui.GameInput", "GameInputClass", flash.ui.GameInput),
      M("flash.events.GameInputEvent", "GameInputEventClass", flash.events.GameInputEvent),
      M("flash.ui.GameInputControl", "GameInputControlClass", flash.ui.GameInputControl),
      M("flash.ui.GameInputControlType", "GameInputControlTypeClass", flash.ui.GameInputControlType),
      M("flash.ui.GameInputDevice", "GameInputDeviceClass", flash.ui.GameInputDevice),
      M("flash.ui.GameInputFinger", "GameInputFingerClass", flash.ui.GameInputFinger),
      M("flash.ui.GameInputHand", "GameInputHandClass", flash.ui.GameInputHand),
      M("flash.ui.Multitouch", "MultitouchClass", flash.ui.Multitouch),
      M("flash.ui.MultitouchInputMode", "MultitouchInputModeClass", flash.ui.MultitouchInputMode),
      M("flash.events.TouchEvent", "TouchEventClass", flash.events.TouchEvent),

      M("flash.text.Font", "FontClass", flash.text.Font),
      M("flash.text.TextField", "TextFieldClass", flash.text.TextField),
      M("flash.text.StaticText", "StaticTextClass", flash.text.StaticText),
      M("flash.text.StyleSheet", "StyleSheetClass", flash.text.StyleSheet),
      M("flash.text.TextFormat", "TextFormatClass", flash.text.TextFormat),
      M("flash.text.TextRun", "TextRunClass", flash.text.TextRun),
      M("flash.text.TextLineMetrics"),
//    M("flash.text.engine.ContentElement", "ContentElementClass", flash.text.engine.ContentElement),
//    M("flash.text.engine.ElementFormat", "ElementFormatClass", flash.text.engine.ElementFormat),
//    M("flash.text.engine.FontDescription", "FontDescriptionClass", flash.text.engine.FontDescription),
//    M("flash.text.engine.GroupElement", "GroupElementClass", flash.text.engine.GroupElement),
//    M("flash.text.engine.SpaceJustifier", "SpaceJustifierClass", flash.text.engine.SpaceJustifier),
//    M("flash.text.engine.TextBlock", "TextBlockClass", flash.text.engine.TextBlock),
//    M("flash.text.engine.TextElement", "TextElementClass", flash.text.engine.TextElement),
//    M("flash.text.engine.TextJustifier", "TextJustifierClass", flash.text.engine.TextJustifier),
//    M("flash.text.engine.TextLine", "TextLineClass", flash.text.engine.TextLine),

      M("flash.media.Sound", "SoundClass", flash.media.Sound),
      M("flash.media.SoundChannel", "SoundChannelClass", flash.media.SoundChannel),
      M("flash.media.SoundMixer", "SoundMixerClass", flash.media.SoundMixer),
      M("flash.media.SoundTransform", "SoundTransformClass", flash.media.SoundTransform),
      M("flash.media.Video", "VideoClass", flash.media.Video),
      M("flash.media.ID3Info", "ID3InfoClass", flash.media.ID3Info),
      M("flash.media.Microphone", "MicrophoneClass", flash.media.Microphone),

      M("flash.net.FileFilter", "FileFilterClass", flash.net.FileFilter),
      M("flash.net.NetConnection", "NetConnectionClass", flash.net.NetConnection),
      M("flash.net.NetStream", "NetStreamClass", flash.net.NetStream),
      M("flash.net.Responder", "ResponderClass", flash.net.Responder),
      M("flash.net.URLRequest", "URLRequestClass", flash.net.URLRequest),
      M("flash.net.URLRequestHeader"),
      M("flash.net.URLStream", "URLStreamClass", flash.net.URLStream),
      M("flash.net.URLLoader", "URLLoaderClass", flash.net.URLLoader),
      M("flash.net.SharedObject", "SharedObjectClass", flash.net.SharedObject),
      M("flash.net.ObjectEncoding", "ObjectEncodingClass", flash.net.ObjectEncoding),
      M("flash.net.LocalConnection", "LocalConnectionClass", flash.net.LocalConnection),
      M("flash.net.Socket", "SocketClass", flash.net.Socket),
      M("flash.net.URLVariables", "URLVariablesClass", flash.net.URLVariables),

      M("packageInternal flash.system.FSCommand", "FSCommandClass", flash.system.FSCommand),
      M("flash.system.Capabilities", "CapabilitiesClass", flash.system.Capabilities),
      // M("flash.system.System", "SystemClass", SystemDefinition),
      M("flash.system.Security", "SecurityClass", flash.system.Security),
      M("flash.system.SecurityDomain", "SecurityDomainClass", flash.system.SecurityDomain),
      M("flash.system.ApplicationDomain", "ApplicationDomainClass", flash.system.ApplicationDomain),
      M("flash.system.JPEGLoaderContext", "JPEGLoaderContextClass", flash.system.JPEGLoaderContext),

      M("flash.accessibility.Accessibility", "AccessibilityClass",
        flash.accessibility.Accessibility),
      M("flash.utils.Timer", "TimerClass", flash.utils.Timer),
      M("flash.utils.ByteArray", "ByteArrayClass", flash.utils.ByteArray),

      M("avm1lib.AS2Utils", "AS2Utils", Shumway.AVM1.AS2Utils),
      M("avm1lib.AS2Broadcaster"),
      M("avm1lib.AS2Key"),
      M("avm1lib.AS2Mouse"),
      M("avm1lib.AS2MovieClip", "AS2MovieClip", Shumway.AVM2.AS.avm1lib.AS2MovieClip),
      M("avm1lib.AS2BitmapData", "AS2BitmapData", Shumway.AVM2.AS.avm1lib.AS2BitmapData),
      M("avm1lib.AS2Button", "AS2Button", Shumway.AVM2.AS.avm1lib.AS2Button),
      M("avm1lib.AS2Sound"),
      M("avm1lib.AS2TextField", "AS2TextField", Shumway.AVM2.AS.avm1lib.AS2TextField),
      M("avm1lib.AS2Stage"),
      M("avm1lib.AS2System"),
      M("avm1lib.AS2Color"),
      M("avm1lib.AS2Globals", "AS2Globals", Shumway.AVM2.AS.avm1lib.AS2Globals),
      M("avm1lib.AS2MovieClipLoader", "AS2MovieClipLoader",
        Shumway.AVM2.AS.avm1lib.AS2MovieClipLoader),
    ];

    symbols.forEach(function (s) {
      var className = Multiname.fromSimpleName(s.classSimpleName);
      var path = className.getOriginalName().split(".");
      var container = Shumway.AVM2.AS;
      for (var i = 0, j = path.length - 1; i < j; i++) {
        if (!container[path[i]]) {
          container[path[i]] = {};
        }
        container = container[path[i]];
      }
      makeStub(container, s.classSimpleName, path[path.length - 1]);
      registerNativeClass(s.nativeName, s.cls);
    });

    registerNativeFunction('FlashUtilScript::getDefinitionByName',
                           Shumway.AVM2.AS.Natives.getDefinitionByName);

    var start = Date.now();
    registerNativeFunction('FlashUtilScript::getTimer', function getTimer() {
      return Date.now() - start;
    });

    registerNativeFunction('FlashUtilScript::escapeMultiByte', escape);
    registerNativeFunction('FlashUtilScript::unescapeMultiByte', unescape);

    registerNativeFunction('FlashNetScript::navigateToURL',
                           function navigateToURL(request, window_) {
                             if (request === null || request === undefined) {
                               throwError('TypeError', Errors.NullPointerError, 'request');
                             }
                             var RequestClass = Shumway.AVM2.Runtime.AVM2.instance.systemDomain.getClass("flash.net.URLRequest");
                             if (!RequestClass.isInstanceOf(request)) {
                               throwError('TypeError', Errors.CheckTypeFailedError, request,
                                          'flash.net.URLRequest');
                             }
                             var url = request.url;
                             if (/^fscommand:/i.test(url)) {
                               var fscommand = Shumway.AVM2.Runtime.AVM2.instance.applicationDomain.getProperty(
                                 Multiname.fromSimpleName('flash.system.fscommand'), true, true);
                               fscommand.call(null, url.substring('fscommand:'.length), window_);
                               return;
                             }
                             // TODO handle other methods than GET
                             var targetWindow = window_ || '_parent'; // using parent as default target
                             window.open(FileLoadingService.instance.resolveUrl(url), targetWindow);
                           });

    registerNativeFunction('FlashNetScript::sendToURL', function sendToURL(request) {
      if (request === null || request === undefined) {
        throwError('TypeError', Errors.NullPointerError, 'request');
      }
      var RequestClass = Shumway.AVM2.Runtime.AVM2.instance.systemDomain.getClass("flash.net.URLRequest");
      if (!RequestClass.isInstanceOf(request)) {
        throwError('TypeError', Errors.CheckTypeFailedError, request,
                   'flash.net.URLRequest');
      }
      var session = FileLoadingService.instance.createSession();
      session.onprogress = function () {
        // ...
      };
      session.open(request);
    });

    registerNativeFunction('Toplevel::registerClassAlias',
                           function registerClassAlias(aliasName, classObject) {
                             if (!aliasName) {
                               throwError('TypeError', Errors.NullPointerError, 'aliasName');
                             }
                             if (!classObject) {
                               throwError('TypeError', Errors.NullPointerError, 'classObject');
                             }

                             AMFUtils.aliasesCache.classes.set(classObject, aliasName);
                             AMFUtils.aliasesCache.names[aliasName] = classObject;
                           });

    registerNativeFunction('Toplevel::getClassByAlias', function getClassByAlias(aliasName) {
      if (!aliasName) {
        throwError('TypeError', Errors.NullPointerError, 'aliasName');
      }

      var classObject = AMFUtils.aliasesCache.names[aliasName];
      if (!classObject) {
        throwError('ReferenceError', Errors.ClassNotFoundError, aliasName);
      }
      return classObject;
    });

    registerNativeFunction('isFinite', isFinite);
  }
}
