function DisplayObjectContainer() {
  InteractiveObject.call(this);

  this._children = [];
}

DisplayObjectContainer.prototype = Object.create(InteractiveObject.prototype, {
  mouseChildren: describeAccessor(
    function () {
      return true;
    },
    function (val) {
      notImplemented();
    }
  ),
  numChildren: describeAccessor(function () {
    return this._children.length;
  }),
  tabChildren: describeAccessor(
    function () {
      return true;
    },
    function (val) {
      notImplemented();
    }
  ),
  textSnapshot: describeAccessor(
    function () {
      notImplemented();
    }
  ),

  addChild: describeMethod(function (child) {
    if (child === this)
      throw ArgumentError();

    return this.addChildAt(child, this._children.length);
  }),
  addChildAt: describeMethod(function (child, index) {
    if (child === this)
      throw ArgumentError();

    var children = this._children;

    if (index < 0 || index > children.length)
      throw RangeError();

    if (child._parent)
      child._parent.removeChild(child);
    else

    child._parent = this;
    children.splice(index, 0, child);

    return child;
  }),
  areInaccessibleObjectsUnderPoint: describeMethod(function (pt) {
    notImplemented();
  }),
  contains: describeMethod(function (child) {
    return this._children.indexOf(child) > -1;
  }),
  getChildAt: describeMethod(function (index) {
    var children = this._children;

    if (index < 0 || index > children.length)
      throw RangeError();

    return children[index];
  }),
  getChildByName: describeMethod(function (name) {
    var children = this._children;
    for (var i = 0, n = children.length; i < n; i++) {
      var child = children[i];
      if (child.name === name)
        return child;
    }
    return null;
  }),
  getChildIndex: describeMethod(function (child) {
    var index = this._children.indexOf(child);

    if (index < 0)
      throw ArgumentError();

    return index;
  }),
  getObjectsUnderPoint: describeMethod(function (pt) {
    notImplemented();
  }),
  removeChild: describeMethod(function (child) {
    var children = this._children;
    var index = children.indexOf(child);

    if (index < 0)
      throw ArgumentError();

    return this.removeChildAt(index);
  }),
  removeChildAt: describeMethod(function (index) {
    var children = this._children;

    if (index < 0 || index > children.length)
      throw RangeError();

    var child = children[index];
    children.splice(index, 1);
    child._parent = null;

    return child;
  }),
  setChildIndex: describeMethod(function (child, index) {
    var children = this._children;

    if (index < 0 || index > children.length)
      throw RangeError();

    var currentIndex = children.indexOf(child);

    if (currentIndex < 0)
      throw ArgumentError();

    children.splice(currentIndex, 1);
    children.splice(index, 0, child);
    child._owned = false;

    return child;
  }),
  removeChildren: describeMethod(function (begin, end) {
    var children = this._children;
    var numChildren = children.length;

    if (begin < 0 || begin > numChildren || end < 0 || end < begin || end > numChildren)
      throw RangeError();

    for (var i = begin; i < end; i++)
      this.removeChildAt(i);
  }),
  swapChildren: describeMethod(function (child1, child2) {
    var children = this._children;
    var index1 = children.indexOf(child1);
    var index2 = children.indexOf(child1);

    if (index1 < 0 || index2 < 0)
      throw ArgumentError();

    this.swapChildrenAt(index1, index2);
  }),
  swapChildrenAt: describeMethod(function (index1, index2) {
    var children = this._children;
    var numChildren = children.length;

    if (index1 < 0 || index1 > numChildren || index2 < 0 || index2 > numChildren)
      throw RangeError();

    var child1 = children[index1];
    var child2 = children[index2];
    children[index1] = child2;
    children[index2] = child1;
    child1._owned = false;
    child2._owned = false;
  }),

  _bbox: describeAccessor(function () {
    var children = this._children;
    var numChildren = children.length;

    if (!numChildren) {
      return {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      }
    }

    var xMin = Number.MAX_VALUE;
    var xMax = 0;
    var yMin = Number.MAX_VALUE;
    var yMax = 0;

    for (var i = 0; i < numChildren; i++) {
      var child = children[i];
      var b = child.getBounds();

      var x1 = b.x;
      var y1 = b.y;
      var x2 = b.x + b.width;
      var y2 = b.y + b.height;

      xMin = Math.min(xMin, x1, x2);
      xMax = Math.max(xMax, x1, x2);
      yMin = Math.min(yMin, y1, y2);
      yMax = Math.max(yMax, y1, y2);
    }

    return {
      left: xMin,
      top: yMin,
      right: xMax,
      bottom: yMax
    };
  })
});
