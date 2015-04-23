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

    var dispatchedEvent;

    function listener(e) {
      if (e.target === a &&
        e.currentTarget === a &&
        e.eventPhase === EventPhase.AT_TARGET
        ) {
        trace('listener called on root, type is "' + e.type + '"');
      }

      dispatchedEvent = e;

      if (e.cancelable) {
        trace('event is cancelable');
        e.preventDefault();
      }
    }

    var event = new Event('foo');

    a.addEventListener('foo', listener);
    if (a.hasEventListener('foo') && a.willTrigger('foo')) {
      trace('listener added');
    }
    a.dispatchEvent(event);

    if (dispatchedEvent === event) {
      trace('event objects are equal');
    }
    a.dispatchEvent(event);
    if (dispatchedEvent !== event) {
      trace('redispatched event object got cloned');
    }

    var canceableEvent = new Event('foo', false, true);
    if (!a.dispatchEvent(canceableEvent) && canceableEvent.isDefaultPrevented()) {
      trace('prevent default behaviour');
    }

    stage.addEventListener('foo', listener);
    a.removeEventListener('foo', listener);
    if (!a.hasEventListener('foo')) {
      trace('listener removed from root');
    }
    if (a.willTrigger('foo')) {
      trace('still triggers on stage');
    }

    try {
      a.addEventListener('foo', 'string');
    } catch(e) {
      trace(e + '');
    }

    try {
      a.removeEventListener('foo', 'string');
    } catch(e) {
      trace(e + '');
    }

    eqArray(traceOutput, [
      'listener added',
      'listener called on root, type is "foo"',
      'event objects are equal',
      'listener called on root, type is "foo"',
      'redispatched event object got cloned',
      'listener called on root, type is "foo"',
      'event is cancelable',
      'prevent default behaviour',
      'listener removed from root',
      'still triggers on stage',
      'TypeError: Error #1034: Type Coercion failed: cannot convert string to Function.',
      'TypeError: Error #1034: Type Coercion failed: cannot convert string to Function.'
    ]);
  });

})();
