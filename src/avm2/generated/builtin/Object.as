/* -*- c-basic-offset: 4; indent-tabs-mode: nil; tab-width: 4 -*- */
/* vi: set ts=4 sw=4 expandtab: (add to ~/.vimrc: set modeline modelines=5) */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


package
{
include "api-versions.as"

/*
 AS3 implementation constraint:
 Object cannot have any per-instance properties, because it is extended by Boolean, String,
 Number, Namespace, int, and uint, which cannot hold inherited state from Object because
 we represent these types more compactly than with ScriptObject.
 */
// instancegc is handled by a custom protocol
[native(cls="ObjectClass", classgc="exact", methods="auto", construct="override")]
public dynamic class Object
{
  // Object.length = 1 per ES3
  // E262 {ReadOnly, DontDelete, DontEnum }
  public static const length:int = 1

  private static native function _hasOwnProperty(o, V:String):Boolean
  private static native function _propertyIsEnumerable(o, V:String):Boolean
  protected static native function _setPropertyIsEnumerable(o, V:String, enumerable:Boolean):void
  private static native function _isPrototypeOf(o, V):Boolean
  private static native function _toString(o):String

  AS3 function isPrototypeOf(V=void 0):Boolean
  {
    return _isPrototypeOf(this,V)
  }

  AS3 function hasOwnProperty(V=void 0):Boolean
  {
    return _hasOwnProperty(this,V)
  }

  AS3 function propertyIsEnumerable(V=void 0):Boolean
  {
    return _propertyIsEnumerable(this, V)
  }

  protected static function _dontEnumPrototype(proto:Object):void
  {
    for (var name:String in proto)
    {
      _setPropertyIsEnumerable(proto, name, false);
    }
  }

  // https://bugzilla.mozilla.org/show_bug.cgi?id=605660
  // Some existing Flash content happens to rely on an "init" method
  // being present in the global namespace; hiding it via VM_INTERNAL breaks
  // the content as it causes an RTE. Let's provide a name here
  // that is harmless.
  static function init()
  {
    // nothing
  }

  // delay proto functions until class Function is initialized.
  [API(CONFIG::VM_INTERNAL)]
  public static function _init()
  {
    prototype.hasOwnProperty =
        function(V=void 0):Boolean
        {
          return this.AS3::hasOwnProperty(V)
        }

    prototype.propertyIsEnumerable = function(V=void 0)
    {
      return this.AS3::propertyIsEnumerable(V)
    }

    prototype.setPropertyIsEnumerable = function(name:String,enumerable:Boolean):void
    {
      _setPropertyIsEnumerable(this, name, enumerable);
    }

    prototype.isPrototypeOf = function(V=void 0):Boolean
    {
      return this.AS3::isPrototypeOf(V)
    }

    prototype.toString = prototype.toLocaleString =
        function():String
        {
          return _toString(this)
        }

    prototype.valueOf = function()
    {
      return this
    }

    _dontEnumPrototype(prototype);
  }
}

// dont create proto functions until after class Function is initialized
Object._init()
}
