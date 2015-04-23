(function timelineTests() {
  var assert = Shumway.Debug.assert;
  var LoaderInfo = flash.display.LoaderInfo;
  var DisplayObject = flash.display.DisplayObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;
  var Stage = flash.display.Stage;
  var MovieClip = flash.display.MovieClip;
  var SpriteSymbol = Shumway.AVMX.AS.flash.display.SpriteSymbol;
  var SWFFrame = Shumway.SWF.SWFFrame;

  var MC_NAME_SUFFIX = 0;

  function reset() {
    MC_NAME_SUFFIX = 0;
    MovieClip.axClass.reset();
    DisplayObjectContainer.axClass.reset();
  }

  function A(){}
  A.prototype.toString = function(){return "A"};
  function B(){}
  B.prototype.toString = function(){return "B"};

  function createMovieClipWithFrames(numFrames) {
    assert(typeof numFrames === 'number');
    var loaderInfo = new LoaderInfo(LoaderInfo.axClass.CtorToken);
    var stage = new Stage();
    DisplayObject.axClass._stage = stage;
    stage._stage = stage;
    var symbol = new SpriteSymbol({id: 0});
    symbol.loaderInfo = loaderInfo;
    symbol.numFrames = numFrames;
    var frame = new SWFFrame();
    for (var i = 0; i < numFrames; i++) {
      symbol.frames.push(frame);
    }
    var mc = createMovieClipFromSymbol(symbol);
    stage.addChild(mc);
    return mc;
  }

  function createMovieClipFromSymbol(symbol) {
    var mc = MovieClip.axClass.initializeFrom(symbol);
    mc.axInitializer();
    mc._name = 'movieclip_' + MC_NAME_SUFFIX++;
    return mc;
  }

  unitTests.push(function basicCreation() {
    var mc = createMovieClipWithFrames(10);
    eq(mc.totalFrames, 10);
    eq(mc.framesLoaded, 10);
    eq(mc.currentFrame, 1);
    reset();
  });

  unitTests.push(function frameScriptAddition() {
    var mc = createMovieClipWithFrames(10);
    mc.addFrameScript(-100, A);
    mc.addFrameScript(100, A);
    eq(mc._frameScripts.length, 0, "addFrameScript ignores out-of-bounds frame positions");
    mc.addFrameScript(0, A);
    eq(mc._frameScripts.length, 2, "addFrameScript properly adds script");
    eq(mc._frameScripts[1], A, "addFrameScript properly adds script");

    mc._frameScripts.length = 0;
    mc.addFrameScript(mc._totalFrames - 1, A);
    eq(mc._frameScripts.length, mc._totalFrames + 1, "addFrameScript works for last frame");
    eq(mc._frameScripts[mc._totalFrames], A, "addFrameScript properly adds script");

    mc._frameScripts.length = 0;
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

    mc._frameScripts.length = 0;
    mc.addFrameScript(0, A, 0, B);
    eq(mc._frameScripts.length, 2, "addFrameScript replaces scripts on the same frame");
    eq(mc._frameScripts[1], B, "addFrameScript adds scripts until coercion fails");

    reset();
  });

  unitTests.push(function frameScriptExecution() {
    var mc = createMovieClipWithFrames(10);
    check(!mc.isPlaying);
    mc.play();
    check(mc.isPlaying);
    var framesExecuted = [0, 0, 0, 0, 0, 0];
    mc.addFrameScript(0, function(){
      framesExecuted[0]++;
    });
    eq(framesExecuted[0], 0, "Just adding a script to the current frame doesn't run it");
    mc.stage._enqueueFrameScripts();
    MovieClip.axClass.runFrameScripts();
    eq(framesExecuted[0], 1, "MovieClip.runFrameScripts() runs queued scripts");
    mc.addFrameScript(2, function(){
      framesExecuted[3]++;
    });
    mc.gotoAndPlay(3);
    eq(framesExecuted[3], 1, "MovieClip.gotoAndPlay() runs the destination frame's script");
    mc.gotoAndPlay(3);
    eq(framesExecuted[3], 1, "MovieClip.gotoAndPlay() called twice doesn't run the script twice");
    mc.addFrameScript(3, function(){
      framesExecuted[4]++;
    });
    mc.gotoAndPlay(4);
    mc.gotoAndPlay(3);
    mc.gotoAndPlay(4);
    eq(framesExecuted[3], 2, "Jumping between frames with MovieClip.gotoAndPlay() calls script " +
                             "multiple times");
    eq(framesExecuted[4], 2, "Jumping between frames with MovieClip.gotoAndPlay() calls script " +
                             "multiple times");
    reset();
  });

  unitTests.push(function basicPlaybackControl() {
    var mc = createMovieClipWithFrames(10);
    check(!mc.isPlaying);
    mc.play();
    check(mc.isPlaying);
    mc.stop();
    check(!mc.isPlaying);
    var errorThrown = false;
    try {
      mc.gotoAndPlay({toString: function(){throw 1}});
    } catch (e) {
      errorThrown = true;
    }
    check(errorThrown);
    check(!mc.isPlaying);
    mc.play();
    check(mc.isPlaying);
    errorThrown = false;
    try {
      mc.gotoAndStop({toString: function(){throw 1}});
    } catch (e) {
      errorThrown = true;
    }
    check(errorThrown);
    check(mc.isPlaying);
    reset();
  });

})();
