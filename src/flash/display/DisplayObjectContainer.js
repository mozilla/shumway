function DisplayObjectContainer() {
}

DisplayObjectContainer.prototype = Object.create(new InteractiveObject, {
  mouseChildren: describeAccessor(
    function () {
      return true;
    },
    function (val) {
      notImplemented();
    }
  ),
  numChildren: describeAccessor(function () {
    notImplemented();
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
    notImplemented();
  }),
  addChildAt: describeMethod(function (child, index) {
    notImplemented();
  }),
  areInaccessibleObjectsUnderPoint: describeMethod(function (pt) {
    notImplemented();
  }),
  contains: describeMethod(function (child) {
    notImplemented();
  }),
  getChildAt: describeMethod(function (index) {
    notImplemented();
  }),
  getChildByName: describeMethod(function (name) {
    notImplemented();
  }),
  getChildIndex: describeMethod(function (child) {
    notImplemented();
  }),
  getObjectsUnderPoint: describeMethod(function (pt) {
    notImplemented();
  }),
  removeChild: describeMethod(function (child) {
    notImplemented();
  }),
  removeChildAt: describeMethod(function (child, index) {
    notImplemented();
  }),
  setChildIndex: describeMethod(function (child, index) {
    notImplemented();
  }),
  removeChildren: describeMethod(function (begin, end) {
    notImplemented();
  }),
  swapChildren: describeMethod(function (child1, child2) {
    notImplemented();
  }),
  swapChildrenAt: describeMethod(function (index1, index2) {
    notImplemented();
  })
});
