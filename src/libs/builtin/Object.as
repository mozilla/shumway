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
  AS3 native function isPrototypeOf(V=void 0):Boolean;
  AS3 native function hasOwnProperty(V=void 0):Boolean;
  AS3 native function propertyIsEnumerable(V=void 0):Boolean;

  static native function init();

  public native function Object();

  // Delay proto functions until class Function is initialized.
  internal native static function _init();
}

  // dont create proto functions until after class Function is initialized
  Object._init()
}
