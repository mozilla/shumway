package {
  (function () {
    var getText = function () : String {
      return <test>test</test>.text();
    };
    trace(typeof getText()); // string
  })();
}