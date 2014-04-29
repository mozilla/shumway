(function timelineTests() {
  var Stage = flash.display.Stage;
  var Loader = flash.display.Loader;
  var Sprite = flash.display.Sprite;
  var MovieClip = flash.display.MovieClip;
  var SpriteSymbol = Shumway.SWF.Timeline.SpriteSymbol;
  var Frame = Shumway.SWF.Timeline.Frame;
  var Event = flash.events.Event;
  var URLRequest = flash.net.URLRequest;

  unitTests.push(function runInspectorSanityTests() {
    var stage = new Stage();
    var mc = new MovieClip();

    check(mc.currentFrame === 0);
    check(mc.framesLoaded === 1);
    check(mc.totalFrames === 1);
    check(mc.isPlaying === false);

    mc.play();
    check(mc.isPlaying === false);

    var symbol = new SpriteSymbol(0);
    var frame = new Frame();
    symbol.numFrames = 5;
    symbol.frames.push(frame, frame, frame, frame, frame);
    mc = MovieClip.initializeFrom(symbol);
    mc.class.instanceConstructorNoInitialize.call(mc);
    check(mc.currentFrame === 1);
    check(mc.framesLoaded === 5);
    check(mc.totalFrames === 5);

    mc.advanceFrame();
    check(mc.currentFrame === 2);
  });

})();
