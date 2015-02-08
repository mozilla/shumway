/* -*- c-basic-offset: 4; indent-tabs-mode: nil; tab-width: 4 -*- */
/* vi: set ts=4 sw=4 expandtab: (add to ~/.vimrc: set modeline modelines=5) */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


package
{
// No instancegc, value is primitive.

[native(cls="BooleanClass", classgc="exact", instance="bool", methods="auto", construct="override")]
public final class Boolean extends Object
{
  // Boolean.length = 1 per ES3
  // E262 {ReadOnly, DontDelete, DontEnum }
  public static const length:int = 1

  AS3 function toString():String {
    return this ? "true" : "false"
  }

  AS3 function valueOf():Boolean { return this }

  // Dummy constructor function - This is neccessary so the compiler can do arg # checking for the ctor in strict mode
  // The code for the actual ctor is in BooleanClass::construct in the avmplus
  public function Boolean(value = void 0)
  {}
}
}
