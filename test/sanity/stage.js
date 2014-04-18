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

  sanityTests.push(function runInspectorSanityTests(console) {
    var s = new Stage();
    check(s.stage === s);
  });

  sanityTests.push(function runInspectorSanityTests(console) {
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
