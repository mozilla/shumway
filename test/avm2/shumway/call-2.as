package {
  (function () {
    trace("--- Cast Return Type : int ---");
    trace(typeof (function () : int {
      return "123";
    })());
  })();

  (function () {
    trace("--- Cast Return Type : String ---");
    var getText = function () : String {
      return <test>test</test>.text();
    }
    trace(typeof getText()); // string
  })();
}