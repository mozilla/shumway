(function displayTests() {
  var easel = createEasel();
  easel.startRendering();

  var Grid = Shumway.GFX.Grid;
  var Shape = Shumway.GFX.Shape;
  var FrameContainer = Shumway.GFX.FrameContainer;

  var c = new FrameContainer();
  for (var i = 0; i < 2; i++) {
    var frame = new Shape(Shumway.getRandomShape());
    frame.matrix.translate(Math.random() * 1000, Math.random() * 1000);
    frame.matrix.scale(2, 2);
    c.addChild(frame);
  }
  easel.world.addChild(c);
})();
