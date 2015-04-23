(function timelineTests() {
  var Stage = flash.display.Stage;
  var Loader = flash.display.Loader;
  var Sprite = flash.display.Sprite;
  var MovieClip = flash.display.MovieClip;
  var SpriteSymbol = flash.display.SpriteSymbol;
  var FrameDelta = Shumway.Timeline.FrameDelta;
  var Event = flash.events.Event;
  var URLRequest = flash.net.URLRequest;
  var Player = Shumway.Player;

  function createMovieClipFromSymbol(numFrames) {
    var symbol = new SpriteSymbol(0);
    symbol.numFrames = numFrames;
    var frame = new Frame();
    for (var i = 0; i < numFrames; i++) {
      symbol.frames.push(frame);
    }
    mc = MovieClip.initializeFrom(symbol);
    mc.class.instanceConstructorNoInitialize.call(mc);
    return mc;
  }

  unitTests.push(0, function runInspectorSanityTests() {
    var stage = new Stage();
    var mc = new MovieClip();

    eq(mc.currentFrame, 0);
    eq(mc.framesLoaded, 1);
    eq(mc.totalFrames, 1);
    check(!mc.isPlaying);

    mc.play();
    check(!mc.isPlaying);

    var mc = createMovieClipFromSymbol(5);
    eq(mc.currentFrame, 1);
    eq(mc.framesLoaded, 5);
    eq(mc.totalFrames, 5);

    MovieClip.initFrame();
    eq(mc.currentFrame, 2);
  });

  unitTests.push(0, function runInspectorSanityTests() {
    var mc = createMovieClipFromSymbol(5);

    MovieClip.initFrame();
    eq(mc.currentFrame, 2);

    var frameScriptWasCalled = false;
    mc.addFrameScript(1, function () {
      frameScriptWasCalled = true;
      mc.prevScene();
      mc.nextScene();
      mc.nextScene();
      mc.nextFrame();
      mc.stop();
      mc.nextFrame();
      mc.play();
      mc.gotoAndStop(2);
      mc.gotoAndPlay(1);
      mc.gotoAndStop(3);
      mc.prevFrame();
      mc.gotoAndStop(4);
    });
    MovieClip.constructFrame();
    check(frameScriptWasCalled);

    MovieClip.initFrame();
    eq(mc.currentFrame, 4);

    var r = '';
    mc.addFrameScript(2, function () {
      r += '3';
      mc.stop();
    });
    mc.addFrameScript(3, function () {
      r += '4';
      mc.gotoAndPlay(3);
      r += mc.currentFrame;
    });
    MovieClip.constructFrame();
    eq(r, '443');

    MovieClip.initFrame();
    eq(mc.currentFrame, 3);
    eq(r, '443');

    mc.play();
    MovieClip.initFrame();
    eq(mc.currentFrame, 4);
  });

  unitTests.push(0, function runInspectorSanityTests() {
    var mc = createMovieClipFromSymbol();

  });

  unitTests.push(function runInspectorSanityTests() {
    var player = new Player();
    player.load("../ats/timelineEventOrder.swf");
  });

})();
