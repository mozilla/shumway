var Bench = (function () {
  function bench () {

  }
  return bench;
})();

var Animator = (function () {
  function animator(frame) {
    this.frame = frame;
  }
  animator.prototype.step = function (time) {

  };
  return animator;
})();

Animator.Rotate = (function () {
  function rotate(frame, time) {
    Animator.call(this, frame);
    this.time = time;
    this.speed = Math.random() / 10;
    this.speed = 0.05;
  }
  rotate.prototype = Object.create(Animator.prototype);
  rotate.prototype.step = function (time) {
    if (time > this.time) {
      return false;
    }
    this.frame.rotate(this.speed);
    return true;
  };
  return rotate;
})();

Animator.Scale = (function () {
  function rotate(frame, time) {
    Animator.call(this, frame);
    this.time = time;
    this.speed = Math.random();
  }
  rotate.prototype = Object.create(Animator.prototype);
  rotate.prototype.step = function (time) {
    if (time > this.time) {
      return false;
    }
    var x = Math.sin(time / 500) / 50;
    var y = Math.cos(time / 500) / 100;
    this.frame.scale(1 - x, 1);
    return true;
  };
  return rotate;
})();

Animator.Slide = (function () {
  function slide(frame, time) {
    Animator.call(this, frame);
    this.time = time;
    this.speed = Math.random() * 100;
    this.counter = 0;
  }
  slide.prototype = Object.create(Animator.prototype);
  slide.prototype.step = function (time) {
    if (time > this.time) {
      return false;
    }
    this.frame.translate(Math.cos(this.counter += 0.1) * this.speed, 0);
    return true;
  };
  return slide;
})();

function drawRectangle(context, rectangle) {
  context.rect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
}

var selected = undefined;
var Frame = (function () {
  function frame(name) {
    this.style = "rgba(" + (Math.random() * 255 | 0) + "," + (Math.random() * 255 | 0)  + "," + (Math.random() * 255 | 0)  + ", 1)";
    this.children = [];
    this.transform = new Matrix();
    this.inverseTransform = new Matrix();
    this.isTransformDirty = false;
    this.isDirty = false;

    this._x = 0;
    this._y = 0;
    this._scaleX = 1;
    this._scaleY = 1;
    this._rotation = 0;
    this.center = new Point();
  }

  frame.prototype.alignCenter = function () {
    this.center.x = this.w / 2;
    this.center.y = this.h / 2;
  };

  frame.prototype.addChild = function (frame) {
    this.children.push(frame);
    frame.parent = this;
  };

  frame.prototype.render = function (context, ignore) {
    this._updateTransform();
    context.save();
    var t = this.transform;
    context.transform(t.a, t.b, t.c, t.d, t.tx, t.ty);
    context.beginPath();
    context.rect(0, 0, this.w, this.h);
    context.closePath();
    context.fillStyle = this.style;
    if (true || !ignore) {
      context.fill();
      if (this === selected) {
        context.lineWidth = 3;
        context.strokeStyle = "red";
        context.stroke();
      }
    }
    context.save();
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].render(context);
    }
    context.restore();
    context.restore();
  };
  var tmpPoint = {x: 0, y: 0};
  frame.prototype.select = function (x, y) {
    var contains;
    contains = x >= 0 && x < this.w && y >= 0 && y < this.h;
    if (contains) {
      for (var i = this.children.length - 1; i >= 0; i--) {
        var child = this.children[i];
        var point = {x: x, y: y};
        child.transformPoint(point);
        var result = child.select(point.x, point.y);
        if (result) {
          return result;
        }
      }
    }
    if (contains) {
      return this;
    }
    return undefined;
  };

  frame.prototype.visit = function (visitor, transform) {
    var stack, frame, transforms;
    this._updateTransform();
    if (transform) {
      stack = [this];
      transforms = [transform];
      while (stack.length > 0) {
        frame = stack.pop();
        transform = transforms.pop();
        for (var i = frame.children.length - 1; i >= 0; i--) {
          stack.push(frame.children[i]);
          var t = transform.clone();
          Matrix.multiply(t, frame.children[i].transform);
          transforms.push(t);
        }
        visitor(frame, transform);
      }
    } else {
      stack = [this];
      while (stack.length > 0) {
        frame = stack.pop();
        for (var i = frame.children.length - 1; i >= 0; i--) {
          stack.push(frame.children[i]);
        }
        visitor(frame);
      }
    }
  };

  frame.prototype.transformPoint = function(point) {
    this._updateTransform();
    this.inverseTransform.transformPoint(point);
  };

  frame.createGrid = function (columns, rows, w, h, padding) {
    padding = padding || 2;
    var parent = new Frame();
    for (var i = 0; i < columns; i++) {
      for (var j = 0; j < rows; j++) {
        var child = new Frame();
        var x = padding + i * (w + padding);
        var y = padding + j * (h + padding);
        child.translate(x, y);
        child.w = w;
        child.h = w;
        child.alignCenter();
        parent.addChild(child);
      }
    }
    parent.w = padding + columns * (w + padding);
    parent.h = padding + rows * (h + padding);
    return parent;
  };

  frame.prototype._updateTransform = function () {
    if (this.isTransformDirty) {
      this.transform.identity();
      this.transform.translate(-this.center.x, -this.center.y);
      this.transform.rotate(this._rotation);
      this.transform.translate(this.center.x + this._x, this.center.y + this._y);

      var scale = new Matrix();
      scale.scale(this.scaleX, this.scaleY);
      scale.concat(this.transform);
      this.transform = scale;

      this.transform.inverse(this.inverseTransform);
    }
    this.isTransformDirty = false;
  };

  frame.prototype.rotate = function (angle) {
    this.rotation += angle;
  };

  frame.prototype.scale = function (x, y) {
    this.scaleX *= x;
    this.scaleY *= y;
  };

  frame.prototype.translate = function (x, y) {
    this.x += x;
    this.y += y;
  };

  frame.createNestedList = function (count, w, h, padding) {
    padding = padding || 2;
    var parent = new Frame();
    var root = parent;

    for (var i = 0; i < count; i++) {
      var x = padding;
      var y = padding;
      var child = new Frame();
      child.translate(x, y);
      child.w = w + (count - i - 1) * 2 * padding;
      child.h = h + (count - i - 1) * 2 * padding;
      // child.center.x = child.w / 2;
      // child.center.y = child.h / 2;
      parent.addChild(child);
      parent = child;
    }
    root.w = w + count * 2 * padding;
    root.h = h + count * 2 * padding;
    return root;
  };

  Object.defineProperty(frame.prototype, "x", {
    get: function () {
      return this._x;
    },
    set: function (x) {
      this.isDirty = true;
      this.isTransformDirty = true;
      this._x = x;
    }
  });

  Object.defineProperty(frame.prototype, "y", {
    get: function () {
      return this._y;
    },
    set: function (y) {
      this.isDirty = true;
      this.isTransformDirty = true;
      this._y = y;
    }
  });

  Object.defineProperty(frame.prototype, "scaleX", {
    get: function () {
      return this._scaleX;
    },
    set: function (x) {
      this.isDirty = true;
      this.isTransformDirty = true;
      this._scaleX = x;
    }
  });

  Object.defineProperty(frame.prototype, "scaleY", {
    get: function () {
      return this._scaleY;
    },
    set: function (y) {
      this.isDirty = true;
      this.isTransformDirty = true;
      this._scaleY = y;
    }
  });

  Object.defineProperty(frame.prototype, "rotation", {
    get: function () {
      return this._rotation;
    },
    set: function (rotation) {
      this.isDirty = true;
      this.isTransformDirty = true;
      this._rotation = rotation;
    }
  });

  return frame;
})();

var DirtyRegion = (function () {
  var SIZE_IN_BITS = 7;
  var SIZE = 1 << SIZE_IN_BITS;
  function Cell(region) {
    this.region = region;
    this.children = [];
  }

  Cell.prototype.clear = function () {
    this.children.length = 0;
  };

  function dirtyRegion(w, h) {
    this.w = w;
    this.h = h;
    this.c = ceil(w / SIZE);
    this.r = ceil(h / SIZE);
    this.grid = [];
    for (var j = 0; j < this.r; j++) {
      for (var i = 0; i < this.c; i++) {
        this.grid.push(new Cell(new Rectangle(i * SIZE, j * SIZE, SIZE, SIZE)));
      }
    }
  }

  dirtyRegion.prototype.clear = function () {
    for (var i = 0; i < this.grid.length; i++) {
      this.grid[i].clear();
    }
  };

  var tmpRectangle = Rectangle.createEmpty();

  dirtyRegion.prototype.addDirtyRectangle = function (rectangle) {
    var x = rectangle.x >> SIZE_IN_BITS;
    var y = rectangle.y >> SIZE_IN_BITS;
    if (x >= this.c || y >= this.r) {
      return;
    }
    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }
    var cell = this.grid[y * this.c + x];
    rectangle = rectangle.clone();
    rectangle.snap();
    if (cell.region.contains(rectangle)) {
      var children = cell.children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        // Check if rectangle is within another dirty rectangle.
        if (child.contains(rectangle)) {
          return;
        }
//        if (rectangle.contains(child)) {
//          child.set(rectangle);
//          return;
////          for (i = i + 1; i < children.length; i++) {
////            if (rectangle.contains(children[i])) {
////              children[i] = null;
////            }
////          }
//        }
      }
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        tmpRectangle.set(child);
        tmpRectangle.union(rectangle);
        if (child.intersects(rectangle)) {
          child.set(tmpRectangle);
          return;
        }
        if (tmpRectangle.area() < 6 * (child.area() + rectangle.area())) {
          // this.addDirtyRectangle(tmpRectangle);
          child.set(tmpRectangle);
          return;
        }
      }
      cell.children.push(rectangle);
    } else {
      var w = Math.min(this.c, ceil((rectangle.x + rectangle.w) / SIZE)) - x;
      var h = Math.min(this.r, ceil((rectangle.y + rectangle.h) / SIZE)) - y;
      for (var i = 0; i < w; i++) {
        for (var j = 0; j < h; j++) {
          var cell = this.grid[(y + j) * this.c + (x + i)];
          var intersection = cell.region.clone();
          intersection.intersect(rectangle);
          if (!intersection.isEmpty()) {
            this.addDirtyRectangle(intersection);
            // cell.children.push(intersection);
          }
        }
      }
    }
  };

  dirtyRegion.prototype.render = function (context) {
    if (true) {
      context.strokeStyle = "white";
      for (var i = 0; i < this.c; i++) {
        for (var j = 0; j < this.r; j++) {
          var cell = this.grid[j * this.c + i];
          context.beginPath();
          drawRectangle(context, cell.region);
          context.closePath();
          context.stroke();
          context.fillText(cell.children.length, cell.region.x + 3, cell.region.y + 12);
        }
      }
    }

    context.strokeStyle = "black";
    for (var i = 0; i < this.c; i++) {
      for (var j = 0; j < this.r; j++) {
        var cell = this.grid[j * this.c + i];
        var children = cell.children;
        for (var k = 0; k < children.length; k++) {
          var rectangle = children[k];
          context.beginPath();
          drawRectangle(context, rectangle);
          context.closePath();
          context.stroke();
        }
      }
    }

  };

  return dirtyRegion;
})();

var Scene = (function () {
  function scene(w, h) {
    this.w = w;
    this.h = h;
    this.animators = [];
    this.dirtyRegion = new DirtyRegion(w, h);
  }
  scene.prototype.render = function (context) {
    context.lineWidth = 1;
    this.root.render(context, true);

    var dirtyRegion = this.dirtyRegion;
    dirtyRegion.clear();

    var rectangle = Rectangle.createEmpty();

    timeline.enter("DIRTY");
    var s = performance.now();
    for (var i = 0; i < 1; i++) {
      dirtyRegion.clear();
      this.root.visit(function (frame, transform) {
        if (frame.isDirty) {
          rectangle.setElements(0, 0, frame.w, frame.h);
          transform.transformRectangleAABB(rectangle);
          dirtyRegion.addDirtyRectangle(rectangle);
        }
      }, this.root.transform);
    }
    timeline.leave("DIRTY");

    dirtyRegion.render(context);

    this.root.visit(function (frame) {
      frame.isDirty = false;
    });
  };
  scene.prototype.select = function (x, y) {
    return this.root.select(x, y);
  };
  function getLetter(i) {
    if (i < 26) {
      return String.fromCharCode(65 + i);
    }
    return i;
  }
  scene.create = function (w, h) {
    var s = new Scene(w, h);
    s.root = new Frame("");
    s.root.w = s.w;
    s.root.h = s.h;
    s.root.alignCenter();
    var count = 64;
    var frames = [s.root];

    for (var i = 0; i < 0; i++) {
      var child = Frame.createNestedList(32, 4, 4, 4);
      var parent = frames[0];
      child.translate (
        Math.random() * (parent.w - child.w),
        Math.random() * (parent.h - child.h)
      );
      parent.addChild(child);
      frames.push(child);
      s.animators.push(new Storm(s.root, 100, Math.random() / 1));
    }

    var parent = frames[0];
    for (var i = 0; i < 0; i++) {
      var child = Frame.createGrid(16, 16, 8, 8, 8);
      child.alignCenter();
      child.translate(Math.random() * (parent.w - child.w), Math.random() * (parent.w - child.w));
      parent.addChild(child);
    }
    s.animators.push(new Storm(s.root, 1000, Math.random() / 10, 4));
    // s.animators.push(new Cross(s.root));

    /*
    for (var i = 0; i < 1; i++) {
      var k = new Storm(s.root, 3, Math.random() / 100, 200);
      s.animators.push(k);
      for (var j = 0; j < k.flakes.length; j++) {
        var f = new Storm(k.flakes[j], 1000, 0.1, 2);
        s.animators.push(f);
      }
    }
    */

    return s;
  };
  return scene;
})();

var Cross = (function () {
  function storm(parent) {
    this.parent = parent;
    this.angle = 0;

    this.v = new Frame();
    this.v.w = 10;
    this.v.h = 200;
    this.v.translate(100, 0);

    this.h = new Frame();
    this.h.w = 200;
    this.h.h = 10;
    this.h.translate(0, 100);

    this.v.translate(322, 375);
    this.h.translate(322, 375);

//    this.r = new Frame();
//    this.r.w = 200;
//    this.r.h = 200;
//    this.r.translate(100, 100);
    this.parent.addChild(this.v);
    this.parent.addChild(this.h);
  }

  storm.prototype.step = function () {
    this.angle += 0.0001;
    // this.v.rotate(0.002);
    // this.h.rotate(0.002);
  };

  return storm;
})();
