function DisplayObjectContainer() {
}

DisplayObjectContainer.prototype = Object.create(new InteractiveObject, {
  mouseChildren: descAccessor(
    function () {
      return true;
    },
    function (val) {
      notImplemented();
    }
  ),
  numChildren: descAccessor(function () {
    notImplemented();
  }),
  tabChildren: descAccessor(
    function () {
      return true;
    },
    function (val) {
      notImplemented();
    }
  ),
  textSnapshot: descAccessor(
    function () {
      notImplemented();
    }
  ),

  addChild: descMethod(function (child) {
    notImplemented();
  }),
  addChildAt: descMethod(function (child, index) {
    notImplemented();
  }),
  areInaccessibleObjectsUnderPoint: descMethod(function (pt) {
    notImplemented();
  }),
  contains: descMethod(function (child) {
    notImplemented();
  }),
  getChildAt: descMethod(function (index) {
    notImplemented();
  }),
  getChildByName: descMethod(function (name) {
    notImplemented();
  }),
  getChildIndex: descMethod(function (child) {
    notImplemented();
  }),
  getObjectsUnderPoint: descMethod(function (pt) {
    notImplemented();
  }),
  removeChild: descMethod(function (child) {
    notImplemented();
  }),
  removeChildAt: descMethod(function (child, index) {
    notImplemented();
  }),
  setChildIndex: descMethod(function (child, index) {
    notImplemented();
  }),
  removeChildren: descMethod(function (begin, end) {
    notImplemented();
  }),
  swapChildren: descMethod(function (child1, child2) {
    notImplemented();
  }),
  swapChildrenAt: descMethod(function (index1, index2) {
    notImplemented();
  })
});
