/* -*- c-basic-offset: 4; indent-tabs-mode: nil; tab-width: 4 -*- */
/* vi: set ts=4 sw=4 expandtab: (add to ~/.vimrc: set modeline modelines=5) */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package
{
[native(cls="RegExpClass", gc="exact", instance="RegExpObject", methods="auto", construct="override")]
public dynamic class RegExp
{
  // RegExp.length = 1 per ES3

  // E262 {ReadOnly, DontDelete, DontEnum }
  public static const length:int = 1

  // {RO,DD,DE} properties of RegExp instances
  public native function get source():String
  public native function get global():Boolean
  public native function get ignoreCase():Boolean
  public native function get multiline():Boolean

  // {DD,DE} properties of RegExp instances
  public native function get lastIndex():int
  public native function set lastIndex(i:int)

  // AS3 specific properties {RO,DD,DE}
  public native function get dotall():Boolean
  public native function get extended():Boolean

  prototype.toString = function():String
  {
    var r:RegExp = this // TypeError if not
    var out:String = "/" + r.source + "/"
    if (r.global)       out += "g"
    if (r.ignoreCase)   out += "i"
    if (r.multiline)    out += "m"
    if (r.dotall)       out += "s"
    if (r.extended)     out += "x"
    return out
  }

  AS3 native function exec(s:String="")

  prototype.exec = function(s="")
  {
    // arg not typed String, so that null and undefined convert
    // to "null" and "undefined", respectively
    var r:RegExp = this // TypeError if not
    return r.AS3::exec(String(s))
  }

  AS3 function test(s:String=""):Boolean
  {
    return AS3::exec(s) != null
  }

  prototype.test = function(s=""):Boolean
  {
    // arg not typed String, so that null and undefined convert
    // to "null" and "undefined", respectively
    var r:RegExp = this
    return r.AS3::test(String(s))
  }

  // Dummy constructor function - This is neccessary so the compiler can do arg # checking for the ctor in strict mode
  // The code for the actual ctor is in RegExpClass::construct in the avmplus
  public function RegExp(pattern = void 0, options = void 0)
  {}

  _dontEnumPrototype(prototype);
}
}
