(function displayTests() {
  var Event = flash.events.Event;
  var EventDispatcher = flash.events.EventDispatcher;
  var ProgressEvent = flash.events.ProgressEvent;

  var Stage = flash.display.Stage;
  var Loader = flash.display.Loader;
  var URLRequest = flash.net.URLRequest;
  var DisplayObject = flash.display.DisplayObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;

  function log(message) {
    console.info(message);
  }

  unitTests.push(function () {
    var ed = new EventDispatcher();
    var sum = 0;
    ed.addEventListener("X", function () {
      ed.addEventListener("X", function () {
        ed.addEventListener("X", function () {
          ed.addEventListener("X", function () {
            ed.addEventListener("X", function () {
              ed.addEventListener("X", function () {
                ed.addEventListener("X", function () {
                  ed.addEventListener("X", function () {
                    ed.addEventListener("X", function () {
                      sum ^= 612354632;
                    });
                    sum ^= 666354632;
                  });
                  sum ^= 163354632;
                });
                sum ^= 163354123;
              });
              sum ^= 12354123;
            });
            sum ^= 12123123;
          });
          sum ^= 12515211;
        });
        sum ^= 56188185;
      });
      sum ^= 9172732;
    });
    var sums = [9172732,56188185,57433198,12123123,9408324,173879521,57158613,666354632,54787964,619618001,10769902,655308859,55019204,770372393,10494549];
    for (var i = 0; i < 13; i++) {
      ed.dispatchEvent(new Event("X"));
      check(sum === sums[i], sums[i]);
    }
  });

  // Test that listener list snapshotting works as expected.
  unitTests.push(function testEventListenerListSnapshotting() {
    var nestedDispatchTriggered = false;
    var ed = new EventDispatcher();
    ed.addEventListener('event', function() {
      if (!nestedDispatchTriggered) {
        nestedDispatchTriggered = true;
        ed.dispatchEvent(new Event('event'));
        ed.addEventListener('event', function() {
          check(false, "snapshotting is broken");
        });
      }
    });
    ed.dispatchEvent(new Event('event'));
    check(true, "snapshotting works");
  });

})();
