package {
  function test2(obj:*) {
    trace("test()");
    if (obj != null) {
      var t = obj.t;
      switch(t) {
        case 'test':
          if (obj.s == null) {
            return;
          }
          break;
        case 'test2':
          trace('test2');
          break;
      }
      trace('obj != null');
    }
    trace('test()');
  }

  test2({t: 'test', s: null});
  trace("DONE");
}