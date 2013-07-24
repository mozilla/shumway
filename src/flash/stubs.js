/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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

/**
 * Stubs Overview
 *
 * Stubs are self-patching getters which patch themselves with the actual
 * AVM2 class instance constructor the first time they are accessed. They assume
 * that AVM2 is already initialized and lives in the global variable avm2.
 *
 * Stubbed classes live in containers named after their Flash namespaces,
 * i.e. flash.events.Event, and can be called like 'new flash.events.Event'.
 *
 * This self-patching isn't perfect; identity isn't preserved, so don't close
 * over these constructors before you call them at least once!
 *
 * What this lets us have is a semi-seamless way to unify the representation
 * of objects between the renderer and the VM.
 *
 * Static Properties
 * -----------------
 *
 * Due to how classes work, getting static properties is not as simple as
 * getting properties on the instance constructor. Static properties are
 * really instance properties on the Class instance of a particular class, so
 * they must be accessed via the Class instance, which is available in the
 * 'class' property of the instance constructor.
 *
 * To get static properties, just use flash.events.Event.class.STATIC_PROPERTY
 *
 * Linked Definitions
 * ------------------
 *
 * All stubbed classes use the linked-definition style of native. See the note
 * in ../src/avm2/native.js. This means AVM2 manages the prototype chaining
 * and inheritance, and the native writer should not do that manually.
 *
 * Adding Stubs
 * ------------
 *
 * Adding a stub and exposing a Flash class to JS consists of the following
 * steps:
 *
 *   1) Write a definition to be linked in.
 *   2) Add a line to the closure at the bottom with the form
 *      M("fully.qualified.Name", "NameClass", NameDefinition)
 *
 * Where "NameClass" is the string that appears in [native(cls="...")]
 *
 *   3) For non-native classes that you still want access to, use:
 *      M("fully.qualified.Name")
 */
/*global createEmptyObject */

// Ignoring all "is not defined." errors in this file
/*jshint undef: false */

/*jshint -W057 */
var Stubs = new (function () {

  var that = this;
  var definitions = createEmptyObject();
  var DEFAULT_DEFINITION = {
    __glue__: {
      script: {
        instance: Glue.ALL, static: Glue.ALL
      }
    }
  };

  this.getClassNames = function () {
    return Object.keys(definitions);
  };

  /**
   * Called whenever a class is created.
   *
   * The `eventType` argument is transmitted by the broadcaster, can be ignored.
   */
  this.onClassCreated = function (eventType, cls) {
    var classOriginalName = cls.classInfo.instanceInfo.name.getOriginalName();
    if (classOriginalName in definitions) {
      cls.link(definitions[classOriginalName] || DEFAULT_DEFINITION);
    }
  };

  /**
   * Creates a self patching getter that lazily constructs the class and memoizes
   * to the class's instance constructor.
   */
  function makeStub(container, classSimpleName, shortName) {
    Object.defineProperty(container, shortName, {
      get: function () {
        assert (avm2, "AVM2 is not initialized.");
        var cls = avm2.systemDomain.getClass(classSimpleName);
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

  // Make special stubs for errors, which shouldn't conflict with JavaScript
  // error constructors.

  [
    "Error",
    "DefinitionError",
    "EvalError",
    "RangeError",
    "ReferenceError",
    "SecurityError",
    "SyntaxError",
    "TypeError",
    "URIError",
    "VerifyError",
    "UninitializedError",
    "ArgumentError"
  ].forEach(function (classSimpleName) {
    makeStub(that, classSimpleName, classSimpleName);
  });

  function M(classSimpleName, nativeName, definition) {
    return {
      classSimpleName: classSimpleName, nativeName: nativeName, definition: definition
    };
  }

  [
    M("flash.display.DisplayObject", "DisplayObjectClass", DisplayObjectDefinition),
    M("flash.display.InteractiveObject", "InteractiveObjectClass", InteractiveObjectDefinition),
    M("flash.display.DisplayObjectContainer", "ContainerClass", DisplayObjectContainerDefinition),
    M("flash.display.Sprite", "SpriteClass", SpriteDefinition),
    M("flash.display.MovieClip", "MovieClipClass", MovieClipDefinition),
    M("flash.display.Shape", "ShapeClass", ShapeDefinition),
    M("flash.display.Bitmap", "BitmapClass", BitmapDefinition),
    M("flash.display.BitmapData", "BitmapDataClass", BitmapDataDefinition),
    M("flash.display.Stage", "StageClass", StageDefinition),
    M("flash.display.Loader", "LoaderClass", LoaderDefinition),
    M("flash.display.LoaderInfo", "LoaderInfoClass", LoaderInfoDefinition),
    M("flash.display.Graphics", "GraphicsClass", GraphicsDefinition),
    M("flash.display.SimpleButton", "SimpleButtonClass", SimpleButtonDefinition),
    M("flash.display.MorphShape", "MorphShapeClass", MorphShapeDefinition),
    M("flash.display.NativeMenu", "MenuClass", NativeMenuDefinition),
    M("flash.display.NativeMenuItem", "MenuItemClass", NativeMenuItemDefinition),
    M("flash.display.FrameLabel", "FrameLabelClass", FrameLabelDefinition),
    M("flash.display.Scene"),

    M("flash.filters.BevelFilter", "BevelFilterClass", BevelFilterDefinition),
    M("flash.filters.BitmapFilter", "BitmapFilterClass", BitmapFilterDefinition),
    M("flash.filters.BlurFilter", "BlurFilterClass", BlurFilterDefinition),
    M("flash.filters.ColorMatrixFilter", "ColorMatrixFilterClass", ColorMatrixFilterDefinition),
    M("flash.filters.ConvolutionFilter", "ConvolutionFilterClass", ConvolutionFilterDefinition),
    M("flash.filters.DisplacementMapFilter", "DisplacementMapFilterClass", DisplacementMapFilterDefinition),
    M("flash.filters.DropShadowFilter", "DropShadowFilterClass", DropShadowFilterDefinition),
    M("flash.filters.GlowFilter", "GlowFilterClass", GlowFilterDefinition),
    M("flash.filters.GradientBevelFilter", "GradientBevelFilterClass", GradientBevelFilterDefinition),
    M("flash.filters.GradientGlowFilter", "GradientGlowFilterClass", GradientGlowFilterDefinition),
    M("flash.filters.ShaderFilter", "ShaderFilterClass", ShaderFilterDefinition),

    M("flash.geom.Point", "PointClass", PointDefinition),
    M("flash.geom.Rectangle", "RectangleClass", RectangleDefinition),
    M("flash.geom.Matrix", "MatrixClass", MatrixDefinition),
    M("flash.geom.Matrix3D", "Matrix3DClass", Matrix3DDefinition),
    M("flash.geom.Vector3D", "Vector3DClass", Vector3DDefinition),
    M("flash.geom.Transform", "TransformClass", TransformDefinition),
    M("flash.geom.ColorTransform", "ColorTransformClass", ColorTransformDefinition),

    M("flash.events.EventDispatcher", "EventDispatcherClass", EventDispatcherDefinition),
    M("flash.events.Event", "EventClass", EventDefinition),
    M("flash.events.IOErrorEvent"),
    M("flash.events.NetStatusEvent"),
    M("flash.events.KeyboardEvent", "KeyboardEventClass", KeyboardEventDefinition),
    M("flash.events.MouseEvent", "MouseEventClass", MouseEventDefinition),
    M("flash.events.TextEvent", "TextEventClass", TextEventDefinition),
    M("flash.events.TimerEvent", "TimerEventClass", TimerEventDefinition),
    M("flash.events.ProgressEvent"),
    M("flash.events.NetStatusEvent"),

    M("flash.external.ExternalInterface", "ExternalInterfaceClass", ExternalInterfaceDefinition),

    M("flash.ui.ContextMenu", "ContextMenuClass", ContextMenuDefinition),
    M("flash.ui.ContextMenuItem", "ContextMenuItemClass", ContextMenuItemDefinition),
    M("flash.ui.Keyboard", "KeyboardClass", KeyboardDefinition),
    M("flash.ui.Mouse", "MouseClass", MouseDefinition),

    M("flash.text.Font", "FontClass", FontDefinition),
    M("flash.text.TextField", "TextFieldClass", TextFieldDefinition),
    M("flash.text.StaticText", "StaticTextClass", StaticTextDefinition),
    M("flash.text.TextFormat", "TextFormatClass", TextFormatDefinition),

    M("flash.media.Sound", "SoundClass", SoundDefinition),
    M("flash.media.SoundChannel", "SoundChannelClass", SoundChannelDefinition),
    M("flash.media.SoundMixer", "SoundMixerClass", SoundMixerDefinition),
    M("flash.media.SoundTransform", "SoundTransformClass", SoundTransformDefinition),
    M("flash.media.Video", "VideoClass", VideoDefinition),
    M("flash.media.ID3Info", "ID3InfoClass", ID3InfoDefinition),

    M("flash.net.NetConnection", "NetConnectionClass", NetConnectionDefinition),
    M("flash.net.NetStream", "NetStreamClass", NetStreamDefinition),
    M("flash.net.Responder", "ResponderClass", ResponderDefinition),
    M("flash.net.URLRequest", "URLRequestClass", URLRequestDefinition),
    M("flash.net.URLStream", "URLStreamClass", URLStreamDefinition),
    M("flash.net.URLLoader", "URLLoaderClass", URLLoaderDefinition),
    M("flash.net.SharedObject", "SharedObjectClass", SharedObjectDefinition),
    M("flash.net.ObjectEncoding", "ObjectEncodingClass", ObjectEncodingDefinition),
    M("flash.net.LocalConnection", "LocalConnectionClass", LocalConnectionDefinition),
    M("flash.net.URLVariables"),

    M("packageInternal flash.system.FSCommand", "FSCommandClass", FSCommandDefinition),
    M("flash.system.Capabilities", "CapabilitiesClass", CapabilitiesDefinition),
    M("flash.system.System", "SystemClass", SystemDefinition),
    M("flash.system.Security", "SecurityClass", SecurityDefinition),
    M("flash.system.SecurityDomain", "SecurityDomainClass", SecurityDomainDefinition),
    M("flash.system.ApplicationDomain", "ApplicationDomainClass", ApplicationDomainDefinition),

    M("flash.accessibility.Accessibility", "AccessibilityClass", AccessibilityDefinition),
    M("flash.utils.Timer", "TimerClass", TimerDefinition)
  ].forEach(function (m) {
    var className = Multiname.fromSimpleName(m.classSimpleName);
    var path = className.getOriginalName().split(".");
    var container = this;
    for (var i = 0, j = path.length - 1; i < j; i++) {
      if (!container[path[i]]) {
        container[path[i]] = {};
      }
      container = container[path[i]];
    }
    makeStub(container, m.classSimpleName, path[path.length - 1]);
    if (m.nativeName) {
      // Hook up the native.
      natives[m.nativeName] = function (runtime, scope, instanceConstructor, baseClass) {
        var c = new Class(undefined, instanceConstructor, Domain.coerceCallable);
        c.extend(baseClass);
        c.linkNatives(m.definition);
        return c;
      };
    }
    definitions[className.getOriginalName()] = m.definition;
  });
})();

natives["FlashUtilScript::getAliasName"] = function (runtime, scope, instanceConstructor, baseClass) {
//  notImplemented("FlashUtilScript::getAliasName");
  return function getAliasName(value) {
    // FIXME don't know what is expected here
    return value.debugName;
  };
};

natives['FlashUtilScript::getDefinitionByName'] = natives.getDefinitionByName;

natives['FlashUtilScript::getTimer'] = function GetTimerMethod(runtime, scope, instanceConstructor, baseClass) {
  var start = Date.now();
  return function getTimer() {
    return Date.now() - start;
  };
};

natives['FlashUtilScript::escapeMultiByte'] = function EscapeMultiByteMethod(runtime, scope, instanceConstructor, baseClass) {
  return escape;
};

natives['FlashUtilScript::unescapeMultiByte'] = function UnescapeMultiByteMethod(runtime, scope, instanceConstructor, baseClass) {
  return unescape;
};

natives['FlashNetScript::navigateToURL'] = function GetNavigateToURLMethod(runtime, scope, instanceConstructor, baseClass) {
  return function navigateToURL(request, window_) {
    if (!request || !request.url)
      throw new Error('Invalid request object');
    var url = request.url;
    if (/^fscommand:/i.test(url)) {
      var fscommand = avm2.applicationDomain.getProperty(
        Multiname.fromSimpleName('flash.system.fscommand'), true, true);
      fscommand.call(null, url.substring('fscommand:'.length), window_);
      return;
    }
    // TODO handle other methods than GET
    window.open(FileLoadingService.resolveUrl(url), window_);
  };
};

natives['FlashNetScript::sendToURL'] = function GetSendToURLMethod(runtime, scope, instanceConstructor, baseClass) {
  return function sendToURL(request) {
    if (!request || !request.url)
      throw new Error('Invalid request object');
    var session = FileLoadingService.createSession();
    session.onprogress = function () {};
    session.open(request);
  };
};

natives['Toplevel::registerClassAlias'] = function GetRegisterClassAliasMethod(runtime, scope, instance, baseClass) {
  return function registerClassAlias(aliasName, classObject) {
    if (!aliasName) {
      throw new TypeError(formatErrorMessage(Errors.NullPointerError, 'aliasName'));
    }
    if (!classObject) {
      throw new TypeError(formatErrorMessage(Errors.NullPointerError, 'classObject'));
    }

    AMFUtils.aliasesCache.classes.set(classObject, aliasName);
    AMFUtils.aliasesCache.names[aliasName] = classObject;
  };
};

natives['Toplevel::getClassByAlias'] = function GetGetClassByAliasMethod(runtime, scope, instance, baseClass) {
  return function getClassByAlias(aliasName) {
    if (!aliasName) {
      throw new TypeError(formatErrorMessage(Errors.NullPointerError, 'aliasName'));
    }

    var classObject = AMFUtils.aliasesCache.names[aliasName];
    if (!classObject) {
      throw ReferenceError();
    }
    return classObject;
  };
};
