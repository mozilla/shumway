function DisplayObjectContainer() {
}

DisplayObjectContainer.prototype = Object.create(new InteractiveObject, {
  numChildren: descAccessor(function () {
    notImplemented();
  }),
  textSnapshot: descAccessor(
    function () {
      notImplemented();
    }
  ),
  tabChildren: descAccessor(
    function () {
      return true;
    },
    function (val) {
      notImplemented();
    }
  ),
  mouseChildren: descAccessor(
    function () {
      return true;
    },
    function (val) {
      notImplemented();
    }
  ),

  addChild: descMethod(function (child) {
    notImplemented();
  }),
  addChildAt: descMethod(function (child, index) {
    notImplemented();
  }),
  removeChild: descMethod(function (child) {
    notImplemented();
  }),
  removeChildAt: descMethod(function (child, index) {
    notImplemented();
  }),
  getChildIndex: descMethod(function (child) {
    notImplemented();
  }),
  setChildIndex: descMethod(function (child, index) {
    notImplemented();
  }),
  getChildAt: descMethod(function (index) {
    notImplemented();
  }),
  getChildByName: descMethod(function (name) {
    notImplemented();
  }),
  getObjectsUnderPoint: descMethod(function (pt) {
    notImplemented();
  }),
  areInaccessibleObjectsUnderPoint: descMethod(function (pt) {
    notImplemented();
  }),
  contains: descMethod(function (child) {
    notImplemented();
  }),
  swapChildrenAt: descMethod(function (index1, index2) {
    notImplemented();
  }),
  swapChildren: descMethod(function (child1, child2) {
    notImplemented();
  }),
  removeChildren: descMethod(function (begin, end) {
    notImplemented();
  })
});
