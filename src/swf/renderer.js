function renderStage(stage, ctx) {
  var frameWidth = ctx.canvas.width;
  var frameHeight = ctx.canvas.height;

  var scaleX = frameWidth / stage._stageWidth;
  var scaleY = frameHeight / stage._stageHeight;

  var scale = Math.min(scaleX, scaleY);
  var offsetX = (frameWidth - scale * stage.stageWidth) / 2;
  var offsetY = (frameHeight - scale * stage.stageHeight) / 2;

  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // All the visitors close over this class to do instance testing.
  var MovieClipClass = avm2.systemDomain.getClass("flash.display.MovieClip");
  var ContainerClass = avm2.systemDomain.getClass("flash.display.DisplayObjectContainer");
  var SimpleButtonClass = avm2.systemDomain.getClass("flash.display.SimpleButton");
  var InteractiveClass = avm2.systemDomain.getClass("flash.display.InteractiveObject");

  function visitContainer(container, visitor, interactiveParent) {
    var children = container._children;
    var dirty = false;

    visitor.childrenStart(container);

    for (var i = 0, n = children.length; i < n; i++) {
      var child = children[i];
      if (child) {
        var isContainer = ContainerClass.isInstanceOf(child) ||
                          SimpleButtonClass.isInstanceOf(child);

        if (InteractiveClass.isInstanceOf(child)) {
          if (!interactiveParent || interactiveParent._mouseChildren)
            interactiveParent = child;
        }

        visitor.visit(child, isContainer, interactiveParent);

        if (isContainer)
          visitContainer(child, visitor, interactiveParent);

        if (child._dirtyArea)
          dirty = true;
      }
    }

    visitor.childrenEnd(container);

    if (dirty)
      container._bounds = null;
  }

  function EnterFrameVisitor(ctx) {
    this.ctx = ctx;
  }
  EnterFrameVisitor.prototype = {
    childrenStart: function() {},
    childrenEnd: function() {},
    visit: function (obj) {
      if (MovieClipClass.isInstanceOf(obj)) {
        if (obj.isPlaying()) {
          var currentFrame = obj._currentFrame;

          obj.nextFrame();

          if (obj._currentFrame !== currentFrame)
            obj._scriptExecutionPending = true;
        }
        obj.dispatchEvent(new flash.events.Event("enterFrame"));
      }

      if (obj._dirtyArea) {
        var b = obj._dirtyArea;
        this.ctx.rect((b.x) - 2, (b.y) - 2, (b.width) + 4, (b.height) + 4);
        b = obj.getBounds();
        this.ctx.rect((b.x) - 2, (b.y) - 2, (b.width) + 4, (b.height) + 4);
      } else if (obj._graphics && (obj._graphics._revision !== obj._revision)) {
        obj._markAsDirty();
      }
    }
  };

  function ExitFrameVisitor() {
  }
  ExitFrameVisitor.prototype = {
    childrenStart: function() { this.depth++; },
    childrenEnd: function() { this.depth--; },
    visit: function (obj) {
      if (MovieClipClass.isInstanceOf(obj))
        obj.dispatchEvent(new flash.events.Event("exitFrame"));
    }
  };

  function RenderVisitor(ctx) {
    this.ctx = ctx;
    this.depth = 0;
  }
  RenderVisitor.prototype = {
    childrenStart: function(parent) {
      if (this.depth == 0) {
        var ctx = this.ctx;

        ctx.save();

        ctx.clip();

        ctx.clearRect(0, 0, frameWidth, frameHeight);

        ctx.mozFillRule = 'evenodd';

        stage._canvasState = {
          canvas: ctx.canvas,
          scale: scale,
          offsetX: offsetX,
          offsetY: offsetY
        };
      }
      this.depth++;

      // TODO move into separate visitor?
      if (MovieClipClass.isInstanceOf(parent) && parent._scriptExecutionPending) {
        var currentFrame;
        do {
          currentFrame = parent._currentFrame;
          parent._callFrame(currentFrame);
          // currentFrame can be changed, calling scripts again
        } while (currentFrame != parent._currentFrame);
        parent._scriptExecutionPending = false;
      }
    },
    childrenEnd: function(parent) {
      this.depth--;
      this.ctx.restore();
    },
    visit: function (child, isContainer, interactiveParent) {
      if (child._clipDepth) {
        // TODO handle masking
        return;
      }

      //var hitTest = false;
      //var hitTestShape = false;
      //
      //if (interactiveParent) {
      //  var pt = new flash.geom.Point(stage._mouseX, stage._mouseY);
      //  child._applyCurrentInverseTransform(pt, child._parent);
      //
      //  if (child._hitArea)
      //    hitTest = child._hitArea._hitTest(true, pt.x, pt.y, true);
      //
      //  if (!hitTest)
      //    hitTestShape = true;
      //}

      var ctx = this.ctx;
      ctx.save();

      var m = child._currentTransform;
      ctx.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);

      var cxform = child._cxform;
      if (cxform) {
        // We only support alpha channel transformation for now
        ctx.globalAlpha = (ctx.globalAlpha * cxform.alphaMultiplier + cxform.alphaOffset) / 256;
      }

      if (child._graphics) {
        var graphics = child._graphics;

        var scale = graphics._scale;
        if (scale !== 1)
          ctx.scale(scale, scale);

        var subpaths = graphics._subpaths;
        for (var j = 0, o = subpaths.length; j < o; j++) {
          var path = subpaths[j];
          if (path.fillStyle) {
            ctx.fillStyle = path.fillStyle;
            if (path.fillTransform) {
              var m = path.fillTransform;
              ctx.beginPath();
              path.__draw__(ctx);
              ctx.save();
              ctx.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
              ctx.fill();
              ctx.restore();
            } else {
              ctx.fill(path);
            }

            //if (hitTestShape && !hitTest && ctx.isPointInPath(pt.x, pt.y))
            //  hitTest = true;
          }
          if (path.strokeStyle) {
            ctx.strokeStyle = path.strokeStyle;
            var drawingStyles = path.drawingStyles;
            for (var prop in drawingStyles)
              ctx[prop] = drawingStyles[prop];
            ctx.stroke(path);

            //if (hitTestShape && !hitTest &&
            //    ctx.mozIsPointInStroke && ctx.mozIsPointInStroke(pt.x, pt.y))
            //  hitTest = true;
          }
        }

        child._revision = graphics._revision;
      }

      if (child.draw)
        child.draw(ctx, child.ratio);

      if (!isContainer) {
        // letting the container to restore transforms after all children are painted
        ctx.restore();
      }

      //if (interactiveParent && hitTest) {
      //  if (interactiveParent._mouseOver) {
      //    interactiveParent.dispatchEvent(new flash.events.MouseEvent('mouseMove'));
      //  } else {
      //    interactiveParent._mouseOver = true;
      //    interactiveParent.dispatchEvent(new flash.events.MouseEvent('mouseOver'));
      //  }
      //
      //  stage._clickTarget = interactiveParent;
      //} else {
      //  if (interactiveParent._mouseOver) {
      //    interactiveParent._mouseOver = false;
      //    interactiveParent.dispatchEvent(new flash.events.MouseEvent('mouseOut'));
      //  }
      //
      //  if (stage._mouseTarget === interactiveParent)
      //    stage._clickTarget = null;
      //}

      if (stage._showRedrawRegions && child._dirtyArea) {
        var bounds = child._dirtyArea;
        ctx.save();
        ctx.strokeStyle = '#f00';
        ctx.lineWidth = 1;
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.restore();
      }

      child._dirtyArea = null;
    }
  };

  var frameTime = 0;
  var maxDelay = 1000 / stage.frameRate;

  var requestAnimationFrame = window.requestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.oRequestAnimationFrame ||
                              window.msRequestAnimationFrame ||
                              window.setTimeout;

  (function draw() {
    var now = +new Date;
    if (now - frameTime >= maxDelay) {
      frameTime = now;

      ctx.beginPath();

      visitContainer(stage, new EnterFrameVisitor(ctx));
      visitContainer(stage, new RenderVisitor(ctx));
      visitContainer(stage, new ExitFrameVisitor());
    }
    requestAnimationFrame(draw);
  })();
}
