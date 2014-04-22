(function displayTests() {
  var GFXShape = Shumway.GFX.Layers.Shape;
  var Renderable = Shumway.GFX.Layers.Renderable;
  var FrameContainer = Shumway.GFX.Layers.FrameContainer;
  var Geometry = Shumway.Geometry;

  function syncOptions(options) {
    options.perspectiveCamera = perspectiveCamera.value;
    options.perspectiveCameraFOV = perspectiveCameraFOV.value;
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

  function timeAllocation(C) {
    var s = Date.now();
    for (var i = 0; i < 10000; i++) {
      var o = new C();
    }
    console.info("Took: " + (Date.now() - s) + " " + C);
  }

  function log(message) {
    console.info(message);
  }

  var Random = Shumway.Random;
  var Matrix = flash.geom.Matrix;
  var Rectangle = flash.geom.Rectangle;
  var Point = flash.geom.Point;
  var DisplayObject = flash.display.DisplayObject;
  var VisitorFlags = flash.display.VisitorFlags;

  var DisplayObjectFlags = flash.display.DisplayObjectFlags;
  var InteractiveObject = flash.display.InteractiveObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;
  var Shape = flash.display.Shape;
  var Sprite = flash.display.Sprite;

  var frameMap = {};

  function createDisplayObjectTree(depth, branch, width, height) {
    var nodes = [];
    Random.seed(0x12343);
    function make(parent, count, depth) {
      if (depth > 0) {
        for (var i = 0; i < count; i++) {
          var o = new DisplayObjectContainer();
          nodes.push(o);
          parent.addChild(o);
          make(o, count, depth - 1);
        }
      } else {
        var o = new Shape();
        o._getContentBounds = function () {
          var w = (width * 20) | 0;
          var h = (height * 20) | 0;
          return new Rectangle(- w / 2, - h / 2, w, h);
        }
        o.fillStyle = Shumway.ColorStyle.randomStyle();
        parent.addChild(o);
      }
    }
    var container = new DisplayObjectContainer();
    make(container, branch, depth);
    return container;
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
//        var r = new Renderable(Geometry.Rectangle.createSquare(1024), function (context) {
//          context.save();
//          var m = node._getConcatenatedMatrix();
//          context.transform(m.a, m.b, m.c, m.d, m.tx / 20, m.ty / 20);
//          context.beginPath();
//          context.lineWidth = 2;
//          context.strokeStyle = Shumway.ColorStyle.Red;
//          if (m.ty > 1000) {
//            m = node._getConcatenatedMatrix();
//          }
//          var b = node.getBounds(null);
//          if (node.style) {
//            context.strokeStyle = node.style;
//          } else {
//            context.strokeStyle = Shumway.ColorStyle.LightOrange;
//          }
//          context.strokeRect(b.x, b.y, b.width, b.height);
//          context.closePath();
//          context.restore();
//        });
//        easel.worldOverlay.addChild(new GFXShape(r));
      } else {
        var b = node.getBounds(null);
        var bounds = new Geometry.Rectangle(b.x, b.y, b.width, b.height);
        var renderable = new Renderable(bounds, function (context) {
          context.save();
          context.beginPath();
          context.lineWidth = 2;
          context.fillStyle = node.fillStyle;
          context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
          if (node.over) {
            context.fillStyle = Shumway.ColorStyle.Pink;
            context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
          }
          context.restore();
        });
        frame = new GFXShape(renderable);
      }
      var m = node.transform.matrix;
      frame.matrix = new Geometry.Matrix(m.a, m.b, m.c, m.d, m.tx, m.ty);
      frameMap[node._id] = frame;
      return frame;
    }

    easel.world.addChild(makeFrame(root));
  }

  unitTests.push(function runInspectorSanityTests(console) {
    Random.seed(0x12343);

    var r = createDisplayObjectTree(3, 8, 32, 32);
    // var r = createDisplayObjectTree(0, 1, 128, 128);

    // var r = new DisplayObjectContainer();
    // var c0 = new DisplayObjectContainer(); c0.x = 200;
    // var c1 = new DisplayObjectContainer(); c1.x = 200;

    // r.addChild(c0);
    // c0.addChild(c1);

//    for (var i = 0; i < 20; i++) {
//      var s = new Shape();
//      s._getContentBounds = function () {
//        var w = 10 * 20;
//        var h = 10 * 20;
//        return new Rectangle(- w / 2, - h / 2, w, h);
//      }
//      s.scaleX = 8;
//      s.scaleY = 8;
//      s.fillStyle = Shumway.ColorStyle.randomStyle();
//      r.addChild(s);
//    }

    r.visit(function (node) {
      if (r === node) {
        return VisitorFlags.Continue;
      }
      node.speed = Math.random() / 10;
      node.scaleSpeed = (Math.random() - 0.5) / 500;
      node.x = (Math.random()) * 512;
      node.y = (Math.random()) * 512;
      // node.scaleX = 2;
      // node.scaleY = 2;
      return VisitorFlags.Continue;
    });

    var easel = createEasel();
    makeFrameTree(easel, r);

    var mousePoint = null;
    var k = 0;
    setInterval(function tick() {
      r.visit(function (node) {
        node.over = false;
        // node._invalidatePosition();

        if (r === node) {
          return VisitorFlags.Continue;
        }
        if (node.speed) {
          node.rotation += node.speed;
        }
        if (node.scaleSpeed) {
          node.scaleX += node.scaleSpeed;
          node.scaleY += node.scaleSpeed;
        }
        return VisitorFlags.Continue;
      });

      r.visit(function (node) {
        var f = frameMap[node._id];
        var m = node.transform.matrix;
        f.matrix = new Geometry.Matrix(m.a, m.b, m.c, m.d, m.tx, m.ty);
        return VisitorFlags.Continue;
      });

      if (mousePoint) {
        var objects = r.getObjectsUnderPoint(mousePoint);
        for (var i = 0; i < objects.length; i++) {
          objects[i].over = true;
        }
      }


      k ++;
      syncOptions(easel.options);
      easel.render();
    }, 16);

    window.addEventListener("mousemove", function (event) {
      mousePoint = easel.getMousePosition(event, easel.world);
    }, false);

  });

})();
