(function displayStageTests() {
  var Stage = flash.display.Stage;
  var DisplayObject = flash.display.DisplayObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;

  function createDisplayObjectTree(depth, width, height) {
    var nodes = [];
    Shumway.Random.seed(0x12343);
    function make(parent, count, depth) {
      if (depth > 0) {
        for (var i = 0; i < count; i++) {
          var o = new DisplayObjectContainer();
          nodes.push(o);
          parent.addChild(o);
          make(o, count, depth - 1);
        }
      } else {
        parent.addChild(new DisplayObject());
      }
    }
    var container = new Stage();
    make(container, 2, depth);
    return {
      node: container,
      nodes: nodes
    };
  }

  unitTests.push(function checkDefaults() {
    var stage = new Stage();
    eq(stage.root, stage, "root");
    check(stage.scaleMode === "showAll", "scaleMode");
    eq(stage.stage, stage, "stage");
    check(stage.tabIndex === -1, "tabIndex");
    eq(stage.mouseEnabled, true, "mouseEnabled");
    eq(stage.focusRect, null, "focusRect");
    eq(stage.mask, null, "mask");
    eq(stage.tabEnabled, false, "tabEnabled");
    eq(stage.visible, true, "visible");
    eq(stage.doubleClickEnabled, false, "doubleClickEnabled");
    eq(stage.scaleZ, 1, "scaleZ");
    eq(stage.accessibilityImplementation, null, "accessibilityImplementation");
    eq(stage.softKeyboardInputAreaOfInterest, null, "softKeyboardInputAreaOfInterest");
    eq(stage.rotation, 0, "rotation");
    eq(stage.needsSoftKeyboard, false, "needsSoftKeyboard");
    eq(stage.rotationX, 0, "rotationX");
    eq(stage.scaleX, 1, "scaleX");
    eq(stage.scaleY, 1, "scaleY");
    eq(stage.rotationZ, 0, "rotationZ");
    eq(stage.rotationY, 0, "rotationY");
    eq(stage.cacheAsBitmap, false, "cacheAsBitmap");
    eq(stage.opaqueBackground, null, "opaqueBackground");
    eq(stage.scrollRect, null, "scrollRect");
    eq(stage.contextMenu, null, "contextMenu");
    check(stage.blendMode === "normal", "blendMode");
    check(stage.transform, "transform");
    eq(stage.frameRate, 24, "frameRate");
    //check(o.numChildren === 1, "numChildren");
    eq(stage.scale9Grid, null, "scale9Grid");
    //check(o.constructor === null, "constructor");
    //check(o.stageWidth === 550, "stageWidth");
    eq(stage.color, 4294967295, "color");
    eq(stage.tabChildren, true, "tabChildren");
    //check(o.quality === "HIGH", "quality");
    eq(stage.mouseChildren, true, "mouseChildren");
    //check(o.loaderInfo, "loaderInfo");
    eq(stage.focus, null, "focus");
    check(stage.colorCorrection === "default", "colorCorrection");
    eq(stage.height, 0, "height");
    //check(o.name === null, "name");
    check(stage.colorCorrectionSupport === "defaultOff", "colorCorrectionSupport");
    eq(stage.showDefaultContextMenu, true, "showDefaultContextMenu");
    eq(stage.width, 0, "width");
    //check(o.accessibilityProperties === null, "accessibilityProperties");
    check(stage.align === "", "align");
    eq(stage.displayState, null, "displayState");
    eq(stage.fullScreenSourceRect, null, "fullScreenSourceRect");
    eq(stage.mouseLock, false, "mouseLock");
    eq(stage.stageFocusRect, true, "stageFocusRect");
    eq(stage.fullScreenWidth, 0, "fullScreenWidth");
    eq(stage.z, 0, "z");
    eq(stage.fullScreenHeight, 0, "fullScreenHeight");
    eq(stage.x, 0, "x");
    check(stage.softKeyboardRect, "softKeyboardRect");
    eq(stage.wmodeGPU, false, "wmodeGPU");
    eq(stage.allowsFullScreen, false, "allowsFullScreen");
    eq(stage.allowsFullScreenInteractive, false, "allowsFullScreenInteractive");
    eq(stage.contentsScaleFactor, 1, "contentsScaleFactor");
    eq(stage.alpha, 1, "alpha");
    //check(o.metaData === null, "metaData");
    eq(stage.y, 0, "y");
    eq(stage.displayContextInfo, null, "displayContextInfo");
    eq(stage.parent, null, "parent");
  });

  unitTests.push(function stagePropertySetup() {
    var s = new Stage();
    eq(s.stage, s, 'stage correctly assigns its `stage` property');
  });

  unitTests.push(function displayListStateConsistency() {
    var tree = createDisplayObjectTree(10, 1024, 1024);

    for (var i = 0; i < 1024; i++) {
      var element = tree.nodes[(Math.random() * (tree.nodes.length - 1)) | 0];
      if (DisplayObjectContainer.isType(element)) {
        var otherElement = tree.nodes[(Math.random() * (tree.nodes.length - 1)) | 0];
        if (!otherElement._isAncestor(element)) {
          element.addChild(otherElement);
        }
      }
      var stage = element.stage;
      var root = element.root;
      check(stage);
      eq(stage, stage.stage);
      check(root);
      eq(root, root.root);
    }
  });

})();
