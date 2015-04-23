package {

  class E {
    public var a:Number;
  }

  (function () {
    var e = new E();
    trace('New instance of "E" has own property "a": ' + e.hasOwnProperty('a'));
  })();

}
