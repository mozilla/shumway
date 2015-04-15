package {
  import flash.utils.Proxy;
  import flash.utils.flash_proxy

  class A extends Proxy {
    var target;

    function A(target) {
      this.target = target;
      var fn = this.memoizedFunction;
      // Make sure the memoizer binds to the JS proxy object, not to the underlying class
      // object.
      trace("RESULT: " + fn());
    }

    private function memoizedFunction() {
      return this.x;
    }

    flash_proxy override function callProperty(name:*, ...rest):* { }

    flash_proxy override function getProperty(name:*):* {
      return target[name];
    }

    flash_proxy override function setProperty(name:*, value:*):void { }

    flash_proxy override function hasProperty(name:*):Boolean { }
  }

  var a = new A({x: 42});
}