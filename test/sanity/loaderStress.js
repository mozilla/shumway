(function displayLoaderTests() {
  var Event = flash.events.Event;
  var Stage = flash.display.Stage;
  var Loader = flash.display.Loader;
  var URLRequest = flash.net.URLRequest;
  var DisplayObject = flash.display.DisplayObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;
  var BinaryFileReader = Shumway.BinaryFileReader;

  var timeline = null;

  function log(message) {
    console.info(message);
  }

  unitTests.push(0, function parseSWFs() {
    var i = 20000;
    var c = 30000;
    function next() {
      if (i > c) {
        return;
      }
      var path = "../../test/swfs~/" + i + ".swf";
      new BinaryFileReader(path).readAll(null, function (buffer) {
        timeline && timeline.enter("SWF");
        try {
          Shumway.SWF.Parser.parse(buffer, { });
        } catch (e) {
          log("Failed to Parse: " + path);
        }
        timeline && timeline.leave("SWF");
        i ++;
        if (i % 10 === 0) {
          log("Parsed: " + i + " of " + c + " ...");
        }
        next();
      });
    }
    next();
  });

  unitTests.push(0, function parseAllABCs() {
    var i = 0;
    var c = 9216;
    c = 10000;
    function next() {
      if (i > c) {
        return;
      }
      var path = "../../test/abcs~/" + i + ".abc";
      new BinaryFileReader(path).readAll(null, function (buffer) {
        timeline && timeline.enter("ABC");
        var abc = new AbcFile(new Uint8Array(buffer), path);
        timeline && timeline.leave("ABC");
        i ++;
        if (i % 10 === 0) {
          log("Parsed: " + i + " of " + c + " ...");
        }
        next();
      });
    }
    next();
  });

  unitTests.push(0, function parseLargeSWFs() {
    var i = 0;
    var j = 0;
    var paths = [
      "../../ex~/games/Canabalt.swf",
      "../../ex~/games/candy.swf",
      "../../ex~/games/knightmare.swf",
      "../../ex~/games/king.swf",
      "../../ex~/games/zombo.swf",
      "../../ex~/games/zombo-2.swf"
    ];
    var c = paths.length;
    function next() {
      if (i >= c) {
        return;
      }
      var path = paths[i];

      new BinaryFileReader(path).readAll(null, function (buffer) {
        var SWF_TAG_CODE_DO_ABC = Shumway.SWF.Parser.SwfTag.CODE_DO_ABC;
        Shumway.SWF.Parser.parse(buffer, {
          oncomplete: function(result) {
            var tags = result.tags;
            var abcs = []; // Group SWF ABCs in their own array.
            for (var k = 0, n = tags.length; k < n; k++) {
              var tag = tags[k];
              if (tag.code === SWF_TAG_CODE_DO_ABC) {
                timeline && timeline.enter("ABC");
                var abc = new AbcFile(tag.data, path);
                timeline && timeline.leave("ABC");
                j++;
                log("Parsed: " + j + " ABCs ...");
              }
            }
            i ++;
            log("Parsed: " + i + " of " + c + " SWFs ... (" + path + ")");
            next();
          }
        });
      });
    }
    next();
  });

})();
