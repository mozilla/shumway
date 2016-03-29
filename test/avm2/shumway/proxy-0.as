package {
  import flash.utils.Proxy;
  import flash.utils.flash_proxy

  namespace N0;
  namespace N1;

  class A extends Proxy {

    var target;

    function A (target) {
      trace("in constructor, target is: " + target);
      this.target = target;
      trace(this.boo);
      trace("done with the constructor");
    }

    flash_proxy override function getProperty(name:*):* {
      trace("AS3 getProperty: " + name);
      trace("TARGET: " + target);
      return target[name];
    }

    flash_proxy override function setProperty(name:*, value:*):void
    {
      trace("AS3 setProperty: " + name + ", " + value);
    }

    flash_proxy override function callProperty(name:*, ...rest):*
    {
      trace("AS3 callProperty: " + name);
    }

    flash_proxy override function hasProperty(name:*):Boolean
    {
      trace("AS3 hasProperty: " + name);
    }

    flash_proxy override function deleteProperty(name:*):Boolean
    {
      trace("AS3 deleteProperty: " + name);
    }

    flash_proxy override function getDescendants(name:*):*
    {
      trace("AS3 getDescendants: " + name);
    }

    flash_proxy override function nextNameIndex(index:int):int
    {
      trace("AS3 nextNameIndex: " + index);
    }

    flash_proxy override function nextName(index:int):String
    {
      trace("AS3 nextName: " + index);
    }

    flash_proxy override function nextValue(index:int):*
    {
      trace("AS3 nextValue: " + index);
    }
  }

  var a = new A({hello: "world", boo: "coo"});
  trace(a.hello);
  trace("-- DONE --");
}