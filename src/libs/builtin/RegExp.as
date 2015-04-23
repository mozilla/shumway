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

  AS3 native function exec(s:String="");
  AS3 native function test(s:String=""):Boolean;

  public native function RegExp(pattern = void 0, options = void 0);
}
}
