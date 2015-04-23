(function () {
  trace("--- Test 0 ---");
  function traceProps(re) {
    trace(re.source);
    trace(re.global);
    trace(re.ignoreCase);
    trace(re.multiline);
  }
  traceProps(new RegExp("foo", ""));
  traceProps(new RegExp("foo", "g"));
  traceProps(new RegExp("foo", "i"));
  traceProps(new RegExp("foo", "m"));
  traceProps(new RegExp("foo", "gim"));
})();
