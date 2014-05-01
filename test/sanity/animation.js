(function displayLoaderTests() {
  var Event = flash.events.Event;
  var Stage = flash.display.Stage;
  var Loader = flash.display.Loader;
  var URLRequest = flash.net.URLRequest;
  var DisplayObject = flash.display.DisplayObject;
  var VisitorFlags = flash.display.VisitorFlags;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;

  var GFXShape = Shumway.GFX.Shape;
  var Renderable = Shumway.GFX.Renderable;
  var ColorMatrix = Shumway.GFX.ColorMatrix;
  var FrameContainer = Shumway.GFX.FrameContainer;
  var Geometry = Shumway.GFX.Geometry;

  var Remoting = Shumway.Remoting;


  Shumway.GFX.GL.SHADER_ROOT = "../../src/gfx/gl/shaders/";

  function syncOptions(options) {
    options.perspectiveCamera = perspectiveCamera.value;
    options.perspectiveCameraFOV = perspectiveCameraFOV.value;
    options.perspectiveCameraAngle = perspectiveCameraAngle.value;
    options.perspectiveCameraDistance = perspectiveCameraDistance.value;

    options.drawTiles = drawTiles.value;
    options.drawTextures = drawTextures.value;
    options.drawTexture = drawTexture.value;
    options.drawElements = drawElements.value;
    options.ignoreViewport = ignoreViewport.value;
    options.ignoreColorTransform = ignoreColorTransform.value;
    options.clipDirtyRegions = clipDirtyRegions.value;
    options.clipCanvas = clipCanvas.value;
    options.paintFlashing = paintFlashing.value;
    options.paintBounds = paintBounds.value;

    options.cull = cull.value;
    options.disableMasking = disableMasking.value;
    options.debug = debugStage.value;
    options.disable = disableStage.value;
    options.compositeMask = compositeMask.value;
    options.disableTextureUploads = disableTextureUploads.value;
  }

  function log(message) {
    console.info(message);
  }

  function makeFrameTree(easel, root) {
    function makeFrame(node) {
      var frame = null
      if (DisplayObjectContainer.isType(node)) {
        frame = new FrameContainer();
        var children = node._children;
        for (var i = 0; i < children.length; i++) {
          frame.addChild(makeFrame(children[i]));
        }
      } else {
        var b = node.getBounds(null);
        // var b = new Renderable(0, 0, 256, 256);
        var bounds = new Geometry.Rectangle(b.x, b.y, b.width, b.height);
        // var bounds = new Geometry.Rectangle(0, 0, 256, 256);
        var renderable = new Renderable(bounds, function (context) {
          context.save();
          context.beginPath();
          context.lineWidth = 2;
          context.fillStyle = node.fillStyle;
          context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
          // if (node.over) {
            context.fillStyle = Shumway.ColorStyle.randomStyle();
            context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
          //}
          context.restore();
          this.isInvalid = false;
        });
        // frame = new GFXShape(renderable);
        // frame = new GFXShape(Shumway.getRandomShape());
        frame = new GFXShape(renderable);
      }
      var m = node.transform.matrix;
      frame.matrix = new Geometry.Matrix(m.a, m.b, m.c, m.d, m.tx, m.ty);
      return frame;
    }
    easel.world.addChild(makeFrame(root));
  }

  unitTests.push(function runInspectorSanityTests() {
    var r = new URLRequest("../../ex~/paralax/w.swf");
    var l = new Loader();
    var s = new Stage();

    var easel = createEasel();
    var server = new Remoting.Server(easel.world);

    s.frameRate = 60;

    l.contentLoaderInfo.addEventListener(Event.INIT, function (event) {
      s.addChild(l.content);
      s.enterEventLoop();
    });

    s.addEventListener(Event.ENTER_FRAME, function (event) {
      var writer = new Shumway.ArrayUtilities.ArrayWriter(16);
      var visitor = new Shumway.Remoting.Client.ClientVisitor();
      visitor.writer = writer;

      s.visit(function (displayObject) {
        visitor.writeReferences = false;
        visitor.clearDirtyBits = false;
        visitor.visitDisplayObject(displayObject);
        return VisitorFlags.Continue;
      }, VisitorFlags.None);

      s.visit(function (displayObject) {
        visitor.writeReferences = true;
        visitor.clearDirtyBits = true;
        visitor.visitDisplayObject(displayObject);
        return VisitorFlags.Continue;
      }, flash.display.VisitorFlags.None);

      writer.writeInt(Shumway.Remoting.MessageTag.EOF);

      var reader = new Remoting.MessageReader(writer.subU8View().buffer);
      server.recieve(reader);
      syncOptions(easel.options);
      easel.render();
    });
    l.load(r);
  });

})();
