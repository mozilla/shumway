package {
  import flash.utils.Proxy;
  import flash.utils.flash_proxy


  class A extends Proxy {

    var traitProperty;

    function A () {

    }

    flash_proxy override function callProperty(name:*, ...rest):*
    {
      trace("AS3 callProperty: " + name);
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
  a.traitProperty;
  a.dynamicProperty;
  Object.prototype.hasOwnProperty.call(a, "traitProperty");
  "traitPropertyIn" in a;
  "dynamicProperty" in a;
  trace("-- DONE --");
}