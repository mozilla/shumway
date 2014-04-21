(function displayTests() {
  var Stage = flash.display.Stage;
  var DisplayObject = flash.display.DisplayObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;
  function log(message) {
    console.info(message);
  }

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
    var container = new DisplayObjectContainer();
    make(container, 2, depth);
    return {
      node: container,
      nodes: nodes
    };
  }

  unitTests.push(function runInspectorSanityTests(console) {
    log("Check Defaults")
    var o = new Stage();
    check(o.root === o, "root");
    check(o.scaleMode === "showAll", "scaleMode");
    check(o.stage === o, "stage");
    check(o.tabIndex === -1, "tabIndex");
    check(o.mouseEnabled === true, "mouseEnabled");
    check(o.focusRect === null, "focusRect");
    check(o.mask === null, "mask");
    check(o.tabEnabled === false, "tabEnabled");
    check(o.visible === true, "visible");
    check(o.doubleClickEnabled === false, "doubleClickEnabled");
    check(o.scaleZ === 1, "scaleZ");
    check(o.accessibilityImplementation === null, "accessibilityImplementation");
    check(o.softKeyboardInputAreaOfInterest === null, "softKeyboardInputAreaOfInterest");
    check(o.rotation === 0, "rotation");
    check(o.needsSoftKeyboard === false, "needsSoftKeyboard");
    check(o.rotationX === 0, "rotationX");
    check(o.scaleX === 1, "scaleX");
    check(o.scaleY === 1, "scaleY");
    check(o.rotationZ === 0, "rotationZ");
    check(o.rotationY === 0, "rotationY");
    check(o.cacheAsBitmap === false, "cacheAsBitmap");
    check(o.opaqueBackground === null, "opaqueBackground");
    check(o.scrollRect === null, "scrollRect");
    check(o.contextMenu === null, "contextMenu");
    check(o.blendMode === "normal", "blendMode");
    check(o.transform, "transform");
    check(o.frameRate === 24, "frameRate");
    check(o.numChildren === 1, "numChildren");
    check(o.scale9Grid === null, "scale9Grid");
    check(o.constructor === null, "constructor");
    check(o.stageWidth === 550, "stageWidth");
    check(o.color === 4294967295, "color");
    check(o.tabChildren === true, "tabChildren");
    check(o.quality === "HIGH", "quality");
    check(o.mouseChildren === true, "mouseChildren");
    check(o.loaderInfo, "loaderInfo");
    check(o.focus === null, "focus");
    check(o.colorCorrection === "default", "colorCorrection");
    check(o.height === 0, "height");
    check(o.name === null, "name");
    check(o.colorCorrectionSupport === "defaultOff", "colorCorrectionSupport");
    check(o.showDefaultContextMenu === true, "showDefaultContextMenu");
    check(o.width === 0, "width");
    check(o.accessibilityProperties === null, "accessibilityProperties");
    check(o.align === "", "align");
    check(o.displayState === null, "displayState");
    check(o.fullScreenSourceRect === null, "fullScreenSourceRect");
    check(o.mouseLock === false, "mouseLock");
    check(o.stageFocusRect === true, "stageFocusRect");
    check(o.fullScreenWidth === 0, "fullScreenWidth");
    check(o.z === 0, "z");
    check(o.fullScreenHeight === 0, "fullScreenHeight");
    check(o.x === 0, "x");
    check(o.softKeyboardRect, "softKeyboardRect");
    check(o.wmodeGPU === false, "wmodeGPU");
    check(o.allowsFullScreen === false, "allowsFullScreen");
    check(o.allowsFullScreenInteractive === false, "allowsFullScreenInteractive");
    check(o.contentsScaleFactor === 2, "contentsScaleFactor");
    check(o.alpha === 1, "alpha");
    check(o.metaData === null, "metaData");
    check(o.y === 0, "y");
    check(o.displayContextInfo === null, "displayContextInfo");
    check(o.parent === null, "parent");
  });

  unitTests.push(function runInspectorSanityTests(console) {
    var s = new Stage();
    check(s.stage === s);
  });

  unitTests.push(function runInspectorSanityTests(console) {
    var r = createDisplayObjectTree(10, 1024, 1024);

    for (var i = 0; i < 1024; i++) {
      var x = r.nodes[(Math.random() * (r.nodes.length - 1)) | 0];
      if (DisplayObjectContainer.isType(x)) {
        var w = r.nodes[(Math.random() * (r.nodes.length - 1)) | 0];
        if (!w._isAncestor(x)) {
          x.addChild(w);
        }
      }
      var y = x.stage;
      var z = x.root;
      if (!(y === null || y.stage === y)) {
        check(false);
      }
      if (!(z === null || z.root === z)) {
        check(false);
      }
    }
  });

})();
