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

  function PreVisitor(ctx) {
    this.ctx = ctx;
  }
  PreVisitor.prototype = {
    childrenStart: function() {},
    childrenEnd: function() {},
    visit: function (child, isContainer, interactiveParent) {
      if (MovieClipClass.isInstanceOf(child)) {
        if (child.isPlaying()) {
          child.nextFrame();
        }
        child.dispatchEvent(new flash.events.Event("enterFrame"));
      }

      if (child._refreshAS2Variables) {
        child._refreshAS2Variables();
      }

      if (interactiveParent) {
        var hitArea = child._hitArea || child;
        var pt = new flash.geom.Point(stage._mouseX, stage._mouseY);
        child._applyCurrentInverseTransform(pt, child._parent);

        if (child._hitTest(true, pt.x, pt.y, true)) {
          if (interactiveParent._mouseOver) {
            interactiveParent.dispatchEvent(new flash.events.MouseEvent('mouseMove'));
          } else {
            interactiveParent._mouseOver = true;
            interactiveParent.dispatchEvent(new flash.events.MouseEvent('mouseOver'));
          }

          stage._clickTarget = interactiveParent;
        } else {
          if (interactiveParent._mouseOver) {
            interactiveParent._mouseOver = false;
            interactiveParent.dispatchEvent(new flash.events.MouseEvent('mouseOut'));
          }

          if (stage._clickTarget === interactiveParent)
            stage._clickTarget = null;
        }
      }

      if (child._dirtyArea) {
        var b1 = child._dirtyArea;
        var b2 = child.getBounds();
        this.ctx.rect((~~b1.x) - 5, (~~b1.y) - 5, (~~b1.width) + 10, (~~b1.height) + 10);
        this.ctx.rect((~~b2.x) - 5, (~~b2.y) - 5, (~~b2.width) + 10, (~~b2.height) + 10);
      } else if (child._graphics && (child._graphics._revision !== child._revision)) {
        child._markAsDirty();
        // redraw entire stage till we calculate bounding boxes for dynamic graphics
        this.ctx.rect(0, 0, frameWidth, frameHeight);
      }
    }
  };

  function PostVisitor() {
  }
  PostVisitor.prototype = {
    childrenStart: function() {},
    childrenEnd: function() {},
    visit: function (child) {
      if (MovieClipClass.isInstanceOf(child))
        child.dispatchEvent(new flash.events.Event("exitFrame"));
    }
  };

  function ScriptExecutionVisitor() {}
  ScriptExecutionVisitor.prototype = {
    childrenStart: function() {},
    childrenEnd: function() {},
    visit: function (obj) {
      if (obj._scriptExecutionPending) {
        obj._scriptExecutionPending = false;

        var currentFrame = obj._currentFrame;
        obj._callFrame(currentFrame);
      }
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
    },
    childrenEnd: function(parent) {
      this.depth--;
      this.ctx.restore();
    },
    visit: function (child, isContainer) {
      if (child._clipDepth) {
        // TODO handle masking
        return;
      }

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
          }
          if (path.strokeStyle) {
            ctx.strokeStyle = path.strokeStyle;
            var drawingStyles = path.drawingStyles;
            for (var prop in drawingStyles)
              ctx[prop] = drawingStyles[prop];
            ctx.stroke(path);
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

      if (stage._showRedrawRegions && child._dirtyArea) {
        var b = child._dirtyArea;
        ctx.save();
        ctx.strokeStyle = '#f00';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, b.width, b.height);
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

      stage._callFrameRequested = false;
      visitContainer(stage, new PreVisitor(ctx));
      while (stage._callFrameRequested) {
        stage._callFrameRequested = false;
        visitContainer(stage, new ScriptExecutionVisitor());
      }
      visitContainer(stage, new RenderVisitor(ctx));
      visitContainer(stage, new PostVisitor());
    }
    requestAnimationFrame(draw);
  })();
}
