(function displayStageTests() {
  var Stage = flash.display.Stage;
  var DisplayObject = flash.display.DisplayObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;

  function createDisplayObjectTree(depth) {
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
      nodes: nodes,
      getRandomNode: function () {
        return this.nodes[(Math.random() * (this.nodes.length - 1)) | 0];
      }
    };
  }

  unitTests.push(function checkDefaults() {
    var stage = new Stage();
    stage.setStageWidth(550);
    stage.setStageHeight(450);
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
    stage.frameRate = 10;
    eq(stage.frameRate, 10, "frameRate");
    //check(o.numChildren === 1, "numChildren");
    eq(stage.scale9Grid, null, "scale9Grid");
    //check(o.constructor === null, "constructor");
    eq(stage.color, 4294967295, "color");
    eq(stage.tabChildren, true, "tabChildren");
    //check(o.quality === "HIGH", "quality");
    eq(stage.mouseChildren, true, "mouseChildren");
    //check(o.loaderInfo, "loaderInfo");
    eq(stage.focus, null, "focus");
    check(stage.colorCorrection === "default", "colorCorrection");
    eq(stage.width, 0, "width");
    eq(stage.stageWidth, 550, "stageWidth");
    stage.stageWidth = 300;
    eq(stage.stageWidth, 550, "stageWidth setter is ignored");
    eq(stage.height, 0, "height");
    eq(stage.stageHeight, 450, "stageHeight");
    stage.stageHeight = 300;
    eq(stage.stageHeight, 450, "stageHeight setter is ignored");
    //check(o.name === null, "name");
    check(stage.colorCorrectionSupport === "defaultOff", "colorCorrectionSupport");
    eq(stage.showDefaultContextMenu, true, "showDefaultContextMenu");
    //check(o.accessibilityProperties === null, "accessibilityProperties");
    check(stage.align === "", "align");
    eq(stage.displayState, null, "displayState");
    eq(stage.fullScreenSourceRect, null, "fullScreenSourceRect");
    eq(stage.mouseLock, false, "mouseLock");
    eq(stage.stageFocusRect, true, "stageFocusRect");
    eq(stage.fullScreenWidth, 0, "fullScreenWidth");
    eq(stage.fullScreenHeight, 0, "fullScreenHeight");
    eq(stage.x, 0, "x");
    eq(stage.y, 0, "y");
    eq(stage.z, 0, "z");
    check(stage.softKeyboardRect, "softKeyboardRect");
    eq(stage.wmodeGPU, false, "wmodeGPU");
    eq(stage.allowsFullScreen, false, "allowsFullScreen");
    eq(stage.allowsFullScreenInteractive, false, "allowsFullScreenInteractive");
    eq(stage.contentsScaleFactor, 1, "contentsScaleFactor");
    eq(stage.alpha, 1, "alpha");
    //check(o.metaData === null, "metaData");
    eq(stage.displayContextInfo, null, "displayContextInfo");
    eq(stage.parent, null, "parent");
    // TODO: check that stage.stageVideos is of type Vector.<StageVideo>.
    eq(stage.stageVideos.length, 0, "stageVideos");

    stage.color = 0x12345678;
    eq(stage.color | 0,  0xff345678 | 0, "opaque");
  });

  unitTests.push(function stagePropertySetup() {
    var s = new Stage();
    eq(s.stage, s, 'stage correctly assigns its `stage` property');
  });

  unitTests.push(function displayListStateConsistency() {
    var tree = createDisplayObjectTree(10);
    var fail = false;
    for (var i = 0; i < 50; i++) {
      var element = tree.getRandomNode();
      if (DisplayObjectContainer.axIsType(element)) {
        var otherElement = tree.getRandomNode();
        if (!otherElement._isAncestor(element)) {
          element.addChild(otherElement);
        }
      }
      var stage = element.stage;
      var root = element.root;

      if (!stage || stage !== stage.stage || !root || root !== root.root) {
        fail = true;
        break;
      }
    }
    check(!fail);
  });

  unitTests.push(function align() {
    var s = new Stage();
    s.align = "1";
    eq(s.align, "");
    s.align = "TOP";
    eq(s.align, "T");
    s.align = "T";
    eq(s.align, "T");
    s.align = "B";
    eq(s.align, "B");
    s.align = "R";
    eq(s.align, "R");
    s.align = "L";
    eq(s.align, "L");
    s.align = "?";
    eq(s.align, "");
    s.align = "BOTTOM";
    eq(s.align, "TB");
    s.align = "12310B_TOP_RRRR";
    eq(s.align, "TBR");
  });

})();
