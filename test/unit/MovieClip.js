(function timelineTests() {
  var LoaderInfo = flash.display.LoaderInfo;
  var MovieClip = flash.display.MovieClip;
  var SpriteSymbol = Shumway.Timeline.SpriteSymbol;
  var FrameDelta = Shumway.Timeline.FrameDelta;

  function A(){}
  A.prototype.toString = function(){return "A"};
  function B(){}
  B.prototype.toString = function(){return "B"};

  function createMovieClipWithFrames(numFrames) {
    var loaderInfo = new LoaderInfo();
    var symbol = new SpriteSymbol(0);
    symbol.numFrames = numFrames;
    var frame = new FrameDelta(loaderInfo, []);
    for (var i = 0; i < numFrames; i++) {
      symbol.frames.push(frame);
    }
    return createMovieClipFromSymbol(symbol);
  }

  function createMovieClipFromSymbol(symbol) {
    var mc = MovieClip.initializeFrom(symbol);
    mc.class.instanceConstructorNoInitialize.call(mc);
    return mc;
  }

  unitTests.push(function basicCreation() {
    var mc = createMovieClipWithFrames(10);
    eq(mc.totalFrames, 10);
    eq(mc.framesLoaded, 10);
    eq(mc.currentFrame, 1);
  });

  unitTests.push(function frameScriptAddition() {
    var mc = createMovieClipWithFrames(10);
    mc.addFrameScript(-100, function(){});
    mc.addFrameScript(100, function(){});
    eq(mc._frameScripts.length, 0, "addFrameScript ignores out-of-bounds frame positions");
    mc.addFrameScript(0, A);
    eq(mc._frameScripts.length, 2, "addFrameScript properly adds script");
    eq(mc._frameScripts[1], A, "addFrameScript properly adds script");
    mc.addFrameScript("0", A);
    eq(mc._frameScripts.length, 2, "addFrameScript coerces frameIndex to number");
    assertThrowsInstanceOf(function(){
      mc.addFrameScript({
                          valueOf: function(){throw new A()},
                          toString: function(){throw new B()}
                        }, B);
    }, A, "addFrameScript frameIndex coercion calls the argument's valueOf");
    assertThrowsInstanceOf(function(){
      mc.addFrameScript({
                          toString: function(){throw new B()}
                        }, B);
    }, B, "addFrameScript frameIndex coercion falls back on the argument's toString");
    mc._frameScripts.length = 0;
    try {
      mc.addFrameScript(0, A, {toString: function(){throw new B()}}, B);
    } catch (e) {
    }
    eq(mc._frameScripts.length, 2, "addFrameScript adds scripts until coercion fails");
    eq(mc._frameScripts[1], A, "addFrameScript adds scripts until coercion fails");
    mc.addFrameScript(0, A, 0, B);
    eq(mc._frameScripts.length, 2, "addFrameScript replaces scripts on the same frame");
  });

})();
