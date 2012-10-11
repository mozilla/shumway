function makeStub(container, className, shortName) {
  function ctor() {
    // Assumes that once AVM2 is initialized, it lives in the global variable avm2.
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

   M("flash.geom.Point", "PointClass", PointDefinition),
   M("flash.geom.Rectangle", "RectangleClass", RectangleDefinition),
   M("flash.geom.Matrix", "MatrixClass", MatrixDefinition),
   M("flash.geom.Transform", "TransformClass", TransformDefinition),
   M("flash.geom.ColorTransform", "ColorTransformClass", ColorTransformDefinition),

   M("flash.events.EventDispatcher", "EventDispatcherClass", EventDispatcherDefinition),
   M("flash.events.Event", "EventClass", EventDefinition),
   M("flash.events.KeyboardEvent", "KeyboardEventClass", KeyboardEventDefinition),

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
       return new runtime.domain.system.ManagedClass(m.className, baseClass, m.definition, instance);
     };
   });
}).call(this);

natives['FlashUtilScript::getTimer'] = function GetTimerMethod(runtime, scope, instance, baseClass) {
  var start = Date.now();
  return function getTimer() {
    return Date.now() - start;
  };
};
