(function displayTests() {
  var Event = flash.events.Event;
  var EventPhase = flash.events.EventPhase;
  var EventDispatcher = flash.events.EventDispatcher;
  var ProgressEvent = flash.events.ProgressEvent;

  var Stage = flash.display.Stage;
  var Loader = flash.display.Loader;
  var URLRequest = flash.net.URLRequest;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;

  unitTests.push(function () {

    var traceOutput = [];
    function trace(message) {
      traceOutput.push(message);
    }

    EventDispatcher.axClass.broadcastEventDispatchQueue.reset();
    var stage = new Stage();
    var a = new DisplayObjectContainer();
    stage.addChild(a);

    function listener1(event) {
      trace('listener #1 called');
    }
    function listener2(event) {
      trace('listener #2 called');
    }

    var event = new Event('foo');

    a.addEventListener('foo', listener1);
    a.addEventListener('foo', listener2);
    a.dispatchEvent(event);

    a.addEventListener('foo', listener2, false, 1);
    a.dispatchEvent(event);

    a.removeEventListener('foo', listener2);
    a.addEventListener('foo', listener2, false, 1);
    a.dispatchEvent(event);

    a.removeEventListener('foo', listener1);
    a.addEventListener('foo', listener1, false, 1);
    a.dispatchEvent(event);

    a.removeEventListener('foo', listener1);
    a.addEventListener('foo', listener1, false, 2);
    a.dispatchEvent(event);

    eqArray(traceOutput, [
      'listener #1 called',
      'listener #2 called',
      'listener #1 called',
      'listener #2 called',
      'listener #2 called',
      'listener #1 called',
      'listener #2 called',
      'listener #1 called',
      'listener #1 called',
      'listener #2 called'
    ]);
  });

})();
