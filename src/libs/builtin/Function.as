/* -*- c-basic-offset: 4; indent-tabs-mode: nil; tab-width: 4 -*- */
/* vi: set ts=4 sw=4 expandtab: (add to ~/.vimrc: set modeline modelines=5) */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


package
{
//pseudo-final - no user class can extend Function
[native(cls="FunctionClass", gc="exact", instance="FunctionObject", methods="auto", construct="instance")]
dynamic public class Function
{
  // E262 {DontDelete}
  // JS {DontEnum,DontDelete}
  public native function get prototype()
  public native function set prototype(p)

  // E262 {DontEnum, DontDelete, ReadOnly}
  public native function get length():int

  /* cn:  Spidermonkey returns the actual source text of the function here.  The ES3
   //  standard only says:
   15.3.4.2 Function.prototype.toString ( )
   An implementation-dependent representation of the function is returned. This
   representation has the syntax of a FunctionDeclaration. Note in particular
   that the use and placement of white space, line terminators, and semicolons
   within the representation string is implementation-dependent.
   The toString function is not generic; it throws a TypeError exception if its this value is not a Function object.
   Therefore, it cannot be transferred to other kinds of objects for use as a method.
   //
   // We don't have the source text, so this impl follows the letter if not the intent
   //  of the spec.
   //
   // Note: we only honor the compact ES3/4 spec, which means
   //  we don't support new Function(stringArg) where stringArg is the text of
   //  the function to be compiled at runtime.  Returning the true text of the
   //  function in toString() seems to be a bookend to this feature to me, and
   //  thus shouldn't be in the compact specification either. */


  AS3 native function call(thisArg=void 0, ...args)
  AS3 native function apply(thisArg=void 0, argArray=void 0)
}
}

// not dynamic
[native(cls="MethodClosureClass", gc="exact", instance="MethodClosure", methods="auto", construct="instance")]
final class MethodClosure extends Function
{
  public native function MethodClosure();

  override public native function get prototype();
  override public native function set prototype(p);

  AS3 override native function call(thisArg=void 0, ...args)
  AS3 override native function apply(thisArg=void 0, argArray=void 0)
}
