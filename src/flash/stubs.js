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

["flash.display.DisplayObject",
 "flash.display.InteractiveObject",
 "flash.display.DisplayObjectContainer",
 "flash.display.Sprite",
 "flash.display.MovieClip",
 "flash.display.Shape",
 "flash.display.Stage",
 "flash.display.Loader",
 "flash.display.LoaderInfo",

 "flash.events.EventDispatcher",
 "flash.events.Event",
 "flash.events.KeyboardEvent",

 "flash.text.TextField",
 "flash.text.StaticText",

 "flash.text.Video",

 "flash.utils.Timer"].forEach(function (className) {
  var path = className.split(".");
  var container = this;
  for (var i = 0, j = path.length - 1; i < j; i++) {
    if (!container[path[i]]) {
      container[path[i]] = {};
    }
    container = container[path[i]];
  }

  makeStub(container, className, path[path.length - 1]);
});

//
// Hook up natives
//
function manage(name, definition) {
  return function (runtime, scope, instance, baseClass) {
    return new runtime.domain.system.ManagedClass(name, baseClass, definition, instance);
  };
}

natives.DisplayObjectClass = manage("DisplayObject", DisplayObjectDefinition);
natives.InteractiveObjectClass = manage("InteractiveObject", InteractiveObjectDefinition);
natives.ContainerClass = manage("DisplayObjectContainer", DisplayObjectContainerDefinition);
natives.SpriteClass = manage("Sprite", SpriteDefinition);
natives.MovieClipClass = manage("MovieClip", MovieClipDefinition);
natives.ShapeClass = manage("Shape", ShapeDefinition);
natives.StageClass = manage("Stage", StageDefinition);
natives.LoaderClass = manage("Loader", LoaderDefinition);
natives.LoaderInfoClass = manage("LoaderInfo", LoaderInfoDefinition);

natives.EventDispatcherClass = manage("EventDispatcher", EventDispatcherDefinition);
natives.EventClass = manage("Event", EventDefinition);
natives.KeyboardEventClass = manage("KeyboardEvent", KeyboardEventDefinition);

natives.TextFieldClass = manage("TextField", TextFieldDefinition);
natives.StaticTextClass = manage("StaticText", StaticTextDefinition);

natives.VideoClass = manage("Video", VideoDefinition);

natives.TimerClass = manage("Timer", TimerDefinition);
natives['FlashUtilScript::getTimer'] = function GetTimerMethod(runtime, scope, instance, baseClass) {
  var start = Date.now();
  return function getTimer() {
    return Date.now() - start;
  };
};
