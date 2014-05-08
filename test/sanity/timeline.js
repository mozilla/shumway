(function timelineTests() {
  var Stage = flash.display.Stage;
  var Loader = flash.display.Loader;
  var Sprite = flash.display.Sprite;
  var MovieClip = flash.display.MovieClip;
  var SpriteSymbol = Shumway.Timeline.SpriteSymbol;
  var Frame = Shumway.Timeline.Frame;
  var Event = flash.events.Event;
  var URLRequest = flash.net.URLRequest;
  var Player = Shumway.Player;

  unitTests.push(function runInspectorSanityTests() {
    var stage = new Stage();
    var mc = new MovieClip();

    eq(mc.currentFrame, 0);
    eq(mc.framesLoaded, 1);
    eq(mc.totalFrames, 1);
    check(!mc.isPlaying);

    mc.play();
    check(!mc.isPlaying);

    var symbol = new SpriteSymbol(0);
    var frame = new Frame();
    symbol.numFrames = 5;
    symbol.frames.push(frame, frame, frame, frame, frame);
    mc = MovieClip.initializeFrom(symbol);
    mc.class.instanceConstructorNoInitialize.call(mc);
    eq(mc.currentFrame, 1);
    eq(mc.framesLoaded, 5);
    eq(mc.totalFrames, 5);

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
    MovieClip.executeFrame();
    check(frameScriptWasCalled);

    MovieClip.initFrame();
    eq(mc.currentFrame, 4);
  });

})();
