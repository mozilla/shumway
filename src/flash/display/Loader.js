function Loader() {
}

Loader.prototype = Object.create(new DisplayObjectContainer, {
  content: descAccessor(function() {
    return this._content;
  }),
  contentLoaderInfo: descAccessor(function() {
    return this._contentLoaderInfo;
  }),
  uncaughtErrorEvents: descAccessor(function() {
    notImplemented();
  }),

  close: descMethod(function() {
    notImplemented();
  }),
  load: descMethod(function(request, context) {
    var loaderInfo = new LoaderInfo();
    this._contentLoaderInfo = loaderInfo;

    var result;
    var root;
    var pframes = [];
    var dictionary = new ObjDictionary();
    var frameRate, bounds;
    var plays;
    var as2Context = null;

    var loader = this;
    startWorking(request, function(obj) {
      if (!root) {
        bounds = obj.bounds;
        loaderInfo._width = (bounds.xMax - bounds.xMin) / 20;
        loaderInfo._height = (bounds.yMax - bounds.yMin) / 20
        loaderInfo._frameRate = obj.frameRate;
        loaderInfo._swfVersion = obj.version;

        // TODO disable AVM1 if AVM2 is enabled
        as2Context = new AS2Context(obj.version);
        AS2Context.instance = as2Context;
        var globals = as2Context.globals;

        var timelineLoader = new TimelineLoader(obj.frameCount, pframes, dictionary);
        var proto = new MovieClipPrototype({}, timelineLoader);
        root = proto.constructor();
        root.name = '_root';

        globals._root = globals._level0 = root.$as2Object;

        loader._content = root;
        loader._onStart(root, loaderInfo);
        return;
      }

      AS2Context.instance = as2Context;
      if (obj) {
        if (obj.id) {
          definePrototype(dictionary, obj);
        } else if (obj.type === 'pframe') {
          if (obj.abcBlocks) {
            var blocks = obj.abcBlocks;
            var i = 0;
            var block;
            while (block = blocks[i++]) {
              var abc = new AbcFile(block);
              executeAbc(abc, ALWAYS_INTERPRET);
            }
          }

          if (obj.symbols) {
            var symbols = obj.symbols;
            var i = 0;
            var sym;
            while (sym = symbols[i++]) {
              if (!sym.id) {
                var mainTimeline = new (toplevel.getTypeByName(
                  Multiname.fromSimpleName(sym.name),
                  true
                )).instance;
              }
            }
          }

          pframes.push(obj);
          loader._onProgress(root, obj);
        } else {
          result = obj;
        }
      } else {
        loader._onComplete(root, result);
      }
    });
  }),
  loadBytes: descMethod(function(bytes, context) {
    notImplemented();
  }),
  unload: descMethod(function() {
    notImplemented();
  }),
  unloadAndStop: descMethod(function(gc) {
    notImplemented();
  }),
  _onStart: descProperty(function() {}),
  _onComplete: descProperty(function() {}),
  _onProgress: descProperty(function() {})
});
