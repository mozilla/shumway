/**
 * Stubs Overview
 *
 * Stubs are self-patching constructors which patch themselves with the actual
 * AVM2 class instance constructor the first time they are called. They assume
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
 * they must be accessed via the Class instance.
 *
 * To get static properties, just get the class using avm2 and get the
 * properties from there.
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
 */

function makeStub(container, className, shortName) {
  function ctor() {
    // Assumes that once AVM2 is initialized, it lives in the global variable
    // avm2.
    if (!avm2) {
      throw new Error("AVM2 not initialized");
    }

    var c = avm2.systemDomain.getClass(className);
    assert(c.instance);
    container[shortName] = c.instance;
    // XXX: Patch our own prototype just in case someone saved a reference to
    // the function before it was patched. We still don't get identity though.
    ctor.prototype = c.instance.prototype;
    return c.createInstance(arguments);
  };

  container[shortName] = ctor;
}

// Make special stubs for errors, which shouldn't conflict with JavaScript
// error constructors.
var as3error = {};
["Error",
 "DefinitionError",
 "EvalError",
 "RangeError",
 "ReferenceError",
 "SecurityError",
 "SyntaxError",
 "TypeError",
 "URIError",
 "URIError",
 "VerifyError",
 "UninitializedError",
 "ArgumentError"].forEach(function (className) {
   makeStub(as3error, className, className);
 });

(function () {
  function M(className, nativeName, definition) {
    return {
      className: className,
      nativeName: nativeName,
      definition: definition
    };
  }

  [M("flash.display.DisplayObject", "DisplayObjectClass", DisplayObjectDefinition),
   M("flash.display.InteractiveObject", "InteractiveObjectClass", InteractiveObjectDefinition),
   M("flash.display.DisplayObjectContainer", "ContainerClass", DisplayObjectContainerDefinition),
   M("flash.display.Sprite", "SpriteClass", SpriteDefinition),
   M("flash.display.MovieClip", "MovieClipClass", MovieClipDefinition),
   M("flash.display.Shape", "ShapeClass", ShapeDefinition),
   M("flash.display.Stage", "StageClass", StageDefinition),
   M("flash.display.Loader", "LoaderClass", LoaderDefinition),
   M("flash.display.LoaderInfo", "LoaderInfoClass", LoaderInfoDefinition),
   M("flash.display.Graphics", "GraphicsClass", GraphicsDefinition),
   M("flash.display.SimpleButton", "SimpleButtonClass", SimpleButtonDefinition),

   M("flash.geom.Point", "PointClass", PointDefinition),
   M("flash.geom.Rectangle", "RectangleClass", RectangleDefinition),
   M("flash.geom.Matrix", "MatrixClass", MatrixDefinition),
   M("flash.geom.Transform", "TransformClass", TransformDefinition),
   M("flash.geom.ColorTransform", "ColorTransformClass", ColorTransformDefinition),

   M("flash.events.EventDispatcher", "EventDispatcherClass", EventDispatcherDefinition),
   M("flash.events.Event", "EventClass", EventDefinition),
   M("flash.events.KeyboardEvent", "KeyboardEventClass", KeyboardEventDefinition),
   M("flash.events.MouseEvent", "MouseEventClass", MouseEventDefinition),
   M("flash.events.TimerEvent", "TimerEventClass", TimerEventDefinition),

   M("flash.ui.Keyboard", "KeyboardClass", KeyboardDefinition),

   M("flash.text.TextField", "TextFieldClass", TextFieldDefinition),
   M("flash.text.StaticText", "StaticTextClass", StaticTextDefinition),

   M("flash.text.Video", "VideoClass", VideoDefinition),

   M("flash.utils.Timer", "TimerClass", TimerDefinition)].forEach(function (m) {
     var path = m.className.split(".");
     var container = this;
     for (var i = 0, j = path.length - 1; i < j; i++) {
       if (!container[path[i]]) {
         container[path[i]] = {};
       }
       container = container[path[i]];
     }

     makeStub(container, m.className, path[path.length - 1]);

     // Hook up the native.
     natives[m.nativeName] = function (runtime, scope, instance, baseClass) {
       var c = new runtime.domain.system.Class(name, function () {
         this.class.initializeInstance(this);
         instance.apply(this, arguments);
       });
       c.extend(baseClass);
       c.link(m.definition);
       return c;
     };
   });
}).call(this);

natives['FlashUtilScript::getTimer'] = function GetTimerMethod(runtime, scope, instance, baseClass) {
  var start = Date.now();
  return function getTimer() {
    return Date.now() - start;
  };
};
