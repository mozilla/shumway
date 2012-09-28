natives.SoundTransformClass = function SoundTransformClass(runtime, scope, instance, baseClass) {
  function constructorHook() {
    this.d = runtime.notifyConstruct(this, Array.prototype.slice.call(arguments, 0));
    //this.nativeObject = new Timer_avm2(arguments[0], arguments[1]); // XXX constructing the native timer
    // TODO how to update iteration count in the script object?
    // TODO and in reverse, if repeatCount was updated how to update native object?
    return instance.apply(this, arguments);
  }

  var c = new runtime.domain.system.Class("SoundTransform", constructorHook, Domain.passthroughCallable(constructorHook));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {};

  return c;
};

natives.VideoClass = function VideoClass(runtime, scope, instance, baseClass) {
  function constructorHook() {
    this.nativeObject = new Video();
    return instance.apply(this, arguments);
  }

  var c = new runtime.domain.system.Class("Video", constructorHook, Domain.passthroughCallable(constructorHook));
  c.extend(baseClass);

  c.nativeStatics = {
  };

  c.nativeMethods = {
    // ctor :: width:int, height:int -> void
    ctor: function ctor(width, height) {
      // console.info("Video.ctor");
    },

    // deblocking :: void -> int
    "get deblocking": function deblocking() {
      console.info("Video.deblocking");
    },

    // deblocking :: value:int -> void
    "set deblocking": function deblocking(value) {
      console.info("Video.deblocking");
    },

    // smoothing :: void -> Boolean
    "get smoothing": function smoothing() {
      console.info("Video.smoothing");
    },

    // smoothing :: value:Boolean -> void
    "set smoothing": function smoothing(value) {
      console.info("Video.smoothing");
    },

    // videoWidth :: void -> int
    "get videoWidth": function videoWidth() {
      console.info("Video.videoWidth");
    },

    // videoHeight :: void -> int
    "get videoHeight": function videoHeight() {
      console.info("Video.videoHeight");
    },

    // clear :: void -> void
    clear: function clear() {
      console.info("Video.clear");
    },

    // attachNetStream :: netStream:NetStream -> void
    attachNetStream: function attachNetStream(netStream) {
      console.info("Video.attachNetStream");
    },

    // attachCamera :: camera:Camera -> void
    attachCamera: function attachCamera(camera) {
      console.info("Video.attachCamera");
    }
  };

  return c;
};