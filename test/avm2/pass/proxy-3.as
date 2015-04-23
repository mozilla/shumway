package {
  import flash.utils.Proxy;
  import flash.utils.flash_proxy


  class A extends Proxy {

    var traitProperty;

    function A () {

    }

    function traitFunction () {
      trace("No Call Proxy AS3 Trait Function");
    }

    private function privateTraitFunction () {
      trace("No Call Proxy AS3 Private Trait Function");
    }

    public function publicTraitFunction () {
      trace("No Call Proxy AS3 Public Trait Function");
    }

    flash_proxy override function callProperty(name:*, ...rest):*
    {
      trace("AS3 callProperty: " + name + " " + rest);
    }

    flash_proxy override function getProperty(name:*):*
    {
      trace("AS3 getProperty: " + name);
    }

    flash_proxy override function setProperty(name:*, value:*):void
    {
      trace("AS3 setProperty: " + name + ", " + value);
    }

    flash_proxy override function hasProperty(name:*):Boolean
    {
      trace("AS3 hasProperty: " + name);
    }

    public function set delegate(x):void
    {
      trace("HERE " + x);
    }

  }

  var a = new A();
  trace("-- START --");
  a.traitFunction();
  a.privateTraitFunction();
  a.publicTraitFunction();
  a.foo(123);
  // a.foo.call(a, 234);
  trace("-- DONE --");
}