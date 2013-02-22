function renderDisplayObject(child, ctx, transform, cxform, clip) {
  var m = transform;
  if (m.a * m.d == m.b * m.c) {
    // Workaround for bug 844184 -- the object is invisible
    ctx.closePath();
    ctx.rect(0, 0, 0, 0);
    ctx.clip();
  } else {
    ctx.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
  }

  if (cxform) {
    // We only support alpha channel transformation for now
    ctx.globalAlpha = (ctx.globalAlpha * cxform.alphaMultiplier + cxform.alphaOffset) / 256;
  }

  if (child._graphics) {
    var graphics = child._graphics;

    if (graphics._bitmap) {
      ctx.translate(child._bbox.left, child._bbox.top);
      ctx.drawImage(graphics._bitmap, 0, 0);
    } else {
      var scale = graphics._scale;
      if (scale !== 1)
        ctx.scale(scale, scale);

      var subpaths = graphics._subpaths;
      for (var j = 0, o = subpaths.length; j < o; j++) {
        var pathTracker = subpaths[j], path = pathTracker.target;
        if (clip) {
          ctx.closePath();
          ctx.__draw__(path);
        } else {
          if (path.fillStyle) {
            ctx.fillStyle = path.fillStyle;
            if (path.fillTransform) {
              var m = path.fillTransform;
              ctx.beginPath();
              ctx.__draw__(path);
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
            var drawingStyles = pathTracker.drawingStyles;
            for (var prop in drawingStyles)
              ctx[prop] = drawingStyles[prop];
            ctx.stroke(path);
          }
        }
      }
    }
  }

  if (child.draw)
    child.draw(ctx, child.ratio);
}

function renderStage(stage, ctx, onBeforeFrame, onAfterFrame) {
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
      if (child && child._visible) {
        var isContainer = ContainerClass.isInstanceOf(child) ||
                          SimpleButtonClass.isInstanceOf(child);

        var interactiveParentForChild = interactiveParent;
        if (InteractiveClass.isInstanceOf(child) && child._mouseEnabled) {
          if (!interactiveParent || interactiveParent._mouseChildren)
            interactiveParentForChild = child;
        }

        visitor.visit(child, isContainer, interactiveParentForChild);

        if (isContainer)
          visitContainer(child, visitor, interactiveParentForChild);

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
    this.enterFrameEvt = new flash.events.Event("enterFrame");
  }
  PreVisitor.prototype = {
    childrenStart: function() {},
    childrenEnd: function() {},
    visit: function (child, isContainer, interactiveParent) {
      if (MovieClipClass.isInstanceOf(child) && child.isPlaying()) {
        child.nextFrame();
      }

      child.dispatchEvent(this.enterFrameEvt);

      if (child._refreshAS2Variables) {
        child._refreshAS2Variables();
      }

      var mouseMoved = false;

      var parent = child._parent;
      var pt = { x: parent._mouseX, y: parent._mouseY };
      child._applyCurrentInverseTransform(pt, parent);

      if (pt.x !== child._mouseX || pt.y !== child._mouseY)
        mouseMoved = true;

      child._mouseX = pt.x;
      child._mouseY = pt.y;

      if (interactiveParent && (stage._mouseOver || stage._mouseJustLeft)) {
        var hitArea = child._hitArea || child;

        if (child._hitTest(true, stage._mouseX, stage._mouseY, true, true)) {
          if (interactiveParent._mouseOver) {
            if (mouseMoved)
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
        stage._mouseJustLeft = false;
      }

      if (child._dirtyArea) {
        var b1 = child._dirtyArea;
        var b2 = child.getBounds();
        this.ctx.rect((~~b1.x) - 5, (~~b1.y) - 5, (~~b1.width) + 10, (~~b1.height) + 10);
        this.ctx.rect((~~b2.x) - 5, (~~b2.y) - 5, (~~b2.width) + 10, (~~b2.height) + 10);
      } else if (child._graphics && (child._graphics._revision !== child._revision)) {
        child._revision = child._graphics._revision;
        child._markAsDirty();
        // redraw entire stage till we calculate bounding boxes for dynamic graphics
        this.ctx.rect(0, 0, frameWidth, frameHeight);
      }
    }
  };

  function PostVisitor() {
    this.exitFrameEvt = new flash.events.Event("exitFrame");
  }
  PostVisitor.prototype = {
    childrenStart: function() {},
    childrenEnd: function() {},
    visit: function (child) {
      //if (MovieClipClass.isInstanceOf(child))
        child.dispatchEvent(this.exitFrameEvt);
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

    this.clip = null;
    this.clipDepth = null;
    this.clipStack = [];
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

      this.clipStack.push(this.clip, this.clipDepth);
      this.clipDepth = null;
    },
    childrenEnd: function(parent) {
      this.depth--;
      this.ctx.restore();

      if (this.clipDepth)
        this.ctx.restore();

      this.clipDepth = this.clipStack.pop();
      this.clip = this.clipStack.pop();
    },
    visit: function (child, isContainer) {
      var ctx = this.ctx;

      if (this.clip) {
        if (child._parent === this.clip._parent) {
          ctx.save();
          ctx.clip();
          this.clipDepth = this.clip._clipDepth;
          this.clip = null;
        }
      } else if (this.clipDepth && child._depth > this.clipDepth) {
        ctx.restore();
        this.clipDepth = null;
      }

      if (child._clipDepth) {
        this.clip = child;
        this.clipDepth = null;
      }

      ctx.save();

      renderDisplayObject(child, ctx, child._currentTransform, child._cxform, this.clip);

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
  var nextRenderAt = Date.now();

  var requestAnimationFrame = window.requestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.oRequestAnimationFrame ||
                              window.msRequestAnimationFrame ||
                              window.setTimeout;

  (function draw() {
    var now = Date.now();
    var renderFrame;
    var renderFrame = now >= nextRenderAt;
    if (renderFrame && onBeforeFrame) {
      var e = { cancel: false };
      onBeforeFrame(e);
      renderFrame = !e.cancel;
    }
    if (renderFrame) {
      frameTime = now;
      nextRenderAt = frameTime + maxDelay;

      ctx.beginPath();

      stage._callFrameRequested = false;
      visitContainer(stage, new PreVisitor(ctx));
      while (stage._callFrameRequested) {
        stage._callFrameRequested = false;
        visitContainer(stage, new ScriptExecutionVisitor());
      }
      visitContainer(stage, new RenderVisitor(ctx));
      visitContainer(stage, new PostVisitor());
      stage._syncCursor();

      if (onAfterFrame) {
        onAfterFrame();
      }
    }
    requestAnimationFrame(draw);
  })();
}
