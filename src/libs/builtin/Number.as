/* -*- c-basic-offset: 4; indent-tabs-mode: nil; tab-width: 4 -*- */
/* vi: set ts=4 sw=4 expandtab: (add to ~/.vimrc: set modeline modelines=5) */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


package
{
// No instancegc, value is primitive.

[native(cls="NumberClass", classgc="exact", instance="double", methods="auto", construct="override")]
public final class Number
{
  // The following methods correspond to the methods on Math, but we add them to Number to make
  // Number behave similarly.
  [API(CONFIG::SWF_16)]
  public native static function abs   (x:Number)   :Number;
  [API(CONFIG::SWF_16)]
  public native static function acos  (x:Number)   :Number;
  [API(CONFIG::SWF_16)]
  public native static function asin  (x:Number)   :Number;
  [API(CONFIG::SWF_16)]
  public native static function atan  (x:Number)   :Number;
  [API(CONFIG::SWF_16)]
  public native static function ceil  (x:Number)   :Number;
  [API(CONFIG::SWF_16)]
  public native static function cos   (x:Number)   :Number;
  [API(CONFIG::SWF_16)]
  public native static function exp   (x:Number)   :Number;
  [API(CONFIG::SWF_16)]
  public native static function floor (x:Number)   :Number;
  [API(CONFIG::SWF_16)]
  public native static function log   (x:Number)   :Number;
  [API(CONFIG::SWF_16)]
  public native static function round (x:Number)   :Number;
  [API(CONFIG::SWF_16)]
  public native static function sin   (x:Number)   :Number;
  [API(CONFIG::SWF_16)]
  public native static function sqrt  (x:Number)   :Number;
  [API(CONFIG::SWF_16)]
  public native static function tan   (x:Number)   :Number;

  [API(CONFIG::SWF_16)]
  public native static function atan2 (y:Number, x:Number):Number;
  [API(CONFIG::SWF_16)]
  public native static function pow   (x:Number, y:Number):Number;

  // max() and min() follow Math, for now; float does it differently however,
  // requiring zero or more arguments and having "length" properties of value zero.
  [API(CONFIG::SWF_16)]
  public native static function max    (x:Number = -1/0, y:Number = -1/0, ... rest):Number;
  [API(CONFIG::SWF_16)]
  public native static function min    (x:Number = 1/0, y:Number = 1/0, ... rest):Number;

  [API(CONFIG::SWF_16)]
  public native static function random ():Number;

  AS3 native function toString(radix=10):String;
  AS3 native function valueOf():Number;

  AS3 native function toExponential(p=0):String;
  AS3 native function toPrecision(p=0):String;
  AS3 native function toFixed(p=0):String;

  public native function Number(value = 0);
}

// No instancegc, value is primitive.

[native(cls="IntClass", classgc="exact", instance="int32_t", methods="auto", construct="override")]
public final class int
{
  AS3 native function toString(radix=10):String;
  AS3 native function valueOf():int;

  AS3 native function toExponential(p=0):String;
  AS3 native function toPrecision(p=0):String;
  AS3 native function toFixed(p=0):String;

  public native function int(value = 0);
}

// No instancegc, value is primitive.

[native(cls="UIntClass", classgc="exact", instance="uint32_t", methods="auto", construct="override")]
public final class uint
{
  AS3 native function toString(radix=10):String;
  AS3 native function valueOf():int;

  AS3 native function toExponential(p=0):String;
  AS3 native function toPrecision(p=0):String;
  AS3 native function toFixed(p=0):String;

  public native function uint(value = 0);
}
}
