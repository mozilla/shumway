(function displayTests() {
  var Event = flash.events.Event;
  var EventPhase = Shumway.AVMX.AS.flash.events.EventPhase;
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


    function childListener(e) {
      if (e.target === a &&
        e.currentTarget === a &&
        e.eventPhase === EventPhase.AT_TARGET
        ) {
        trace('event fired on root');
      }
    }
    function parentListener(e) {
      if (e.target === a &&
        e.currentTarget === stage &&
        e.eventPhase === EventPhase.BUBBLING_PHASE
        ) {
        trace('event bubbled to stage');
      }
    }
    function captureListener(e) {
      if (e.target === a &&
        e.currentTarget === stage &&
        e.eventPhase === EventPhase.CAPTURING_PHASE
        ) {
        trace('event captured by stage');
      }
    }
    function stopListener(e) {
      trace('stop propagation');
      e.stopPropagation();
    }
    function stopImmediateListener(e) {
      trace('stop propagation immediately');
      e.stopImmediatePropagation();
    }

    var event = new Event('foo', true);

    a.addEventListener('foo', childListener);
    stage.addEventListener('foo', parentListener);
    a.dispatchEvent(event);

    stage.addEventListener('foo', captureListener, true);
    a.dispatchEvent(event);

    a.addEventListener('foo', stopListener, false, 1);
    a.dispatchEvent(event);

    a.addEventListener('foo', stopImmediateListener, false, 2);
    a.dispatchEvent(event);

    eqArray(traceOutput, [
      'event fired on root',
      'event bubbled to stage',
      'event captured by stage',
      'event fired on root',
      'event bubbled to stage',
      'event captured by stage',
      'stop propagation',
      'event fired on root',
      'event captured by stage',
      'stop propagation immediately'
    ]);
  });

})();
