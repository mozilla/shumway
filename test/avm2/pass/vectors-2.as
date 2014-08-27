package {

  (function () {
    trace(new Vector.<int>(null).length);
    trace(new Vector.<int>(undefined).length);
    trace(new Vector.<int>("3").length);
    trace(new Vector.<int>(false).length);
    trace(new Vector.<int>(true).length);
  })();

  trace("-");
}