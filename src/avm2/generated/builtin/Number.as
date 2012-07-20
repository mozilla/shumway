/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is [Open Source Virtual Machine.].
 *
 * The Initial Developer of the Original Code is
 * Adobe System Incorporated.
 * Portions created by the Initial Developer are Copyright (C) 2004-2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Adobe AS3 Team
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


package
{
  [native(cls="NumberClass")]
  public final class Number
  {
    // Number.length = 1 per ES3
    // E262 {ReadOnly, DontDelete, DontEnum }
    public static const length:int = 1;

    // E262 {DontEnum, DontDelete, ReadOnly}
    public static const NaN               :Number = 0/0;
    public static const NEGATIVE_INFINITY :Number = -1/0;
    public static const POSITIVE_INFINITY :Number = 1/0;
    public static const MIN_VALUE         :Number = unsafeJSNative("Number.MIN_VALUE");
    public static const MAX_VALUE         :Number = unsafeJSNative("Number.MAX_VALUE");

    // The following constants correspond to the constants on Math, but we add them to Number to make
    // Number, float, and float4 behave similarly.
    //[API(CONFIG::SWF_16)]
    public static const E       :Number = 2.718281828459045;
    //[API(CONFIG::SWF_16)]
    public static const LN10    :Number = 2.302585092994046;
    //[API(CONFIG::SWF_16)]
    public static const LN2     :Number = 0.6931471805599453;
    //[API(CONFIG::SWF_16)]
    public static const LOG10E  :Number = 0.4342944819032518;
    //[API(CONFIG::SWF_16)]
    public static const LOG2E   :Number = 1.442695040888963387;
    //[API(CONFIG::SWF_16)]
    public static const PI      :Number = 3.141592653589793;
    //[API(CONFIG::SWF_16)]
    public static const SQRT1_2 :Number = 0.7071067811865476;
    //[API(CONFIG::SWF_16)]
    public static const SQRT2   :Number = 1.4142135623730951;

    // The following methods correspond to the methods on Math, but we add them to Number to make
    // Number, float, and float4 behave similarly.
    [unsafeJSNative("Math.abs")]
    //[API(CONFIG::SWF_16)]
    public native static function abs   (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.acos")]
    public native static function acos  (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.asin")]
    public native static function asin  (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.atan")]
    public native static function atan  (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.ceil")]
    public native static function ceil  (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.cos")]
    public native static function cos   (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.exp")]
    public native static function exp   (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.floor")]
    public native static function floor (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.log")]
    public native static function log   (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.round")]
    public native static function round (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.sin")]
    public native static function sin   (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.sqrt")]
    public native static function sqrt  (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.tan")]
    public native static function tan   (x:Number)   :Number;

    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.atan2")]
    public native static function atan2 (y:Number, x:Number):Number;
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.pow")]
    public native static function pow   (x:Number, y:Number):Number;

    // max() and min() follow Math, for now; float does it differently however,
    // requiring zero or more arguments and having "length" properties of value zero.
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.max")]
    public native static function max    (x:Number = NEGATIVE_INFINITY, y:Number = NEGATIVE_INFINITY, ... rest):Number;
    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.min")]
    public native static function min    (x:Number = POSITIVE_INFINITY, y:Number = POSITIVE_INFINITY, ... rest):Number;

    //[API(CONFIG::SWF_16)]
    [unsafeJSNative("Math.random")]
    public native static function random ():Number;

    [compat]
    private static const DTOSTR_FIXED:int = 1;
    [compat]
    private static const DTOSTR_PRECISION:int = 2;
    [compat]
    private static const DTOSTR_EXPONENTIAL:int = 3;

    [compat]
    private static native function _numberToString(n:Number, radix:int):String;
    [compat]
    private static native function _convert(n:Number, precision:int, mode:int):String;
    [compat]
    private static native function _minValue():Number;

    AS3 native function toString(radix=10):String
    AS3 native function valueOf():Number

    // AS (incorrectly) makes toLocaleString === toString.
    prototype.toLocaleString = unsafeJSNative("Number.prototype.toLocaleString");
    prototype.toString = unsafeJSNative("Number.prototype.toString");
    prototype.valueOf = unsafeJSNative("Number.prototype.valueOf");

    AS3 native function toExponential(p=0):String
    prototype.toExponential = unsafeJSNative("Number.prototype.toExponential");

    AS3 native function toPrecision(p=0):String
    prototype.toPrecision = unsafeJSNative("Number.prototype.toPrecision");

    AS3 native function toFixed(p=0):String
    prototype.toFixed = unsafeJSNative("Number.prototype.toFixed");

    _dontEnumPrototype(prototype);
  }

  [native(cls="intClass")]
  public final class int
  {
    // based on Number: E262 {ReadOnly, DontDelete, DontEnum}
    public static const MIN_VALUE:int = -0x80000000;
    public static const MAX_VALUE:int =  0x7fffffff;

    // Number.length = 1 per ES3
    // E262 {ReadOnly, DontDelete, DontEnum }
    public static const length:int = 1

    //
    // NB: We _don't_ maintain slot-compatibility with AVM here, since we
    // don't want to box ints.
    //

    // Dummy constructor
    public function int(value = 0) {}

    _dontEnumPrototype(prototype);
  }

  [native(cls="uintClass")]
  public final class uint
  {
    // based on Number: E262 {ReadOnly, DontDelete, DontEnum}
    public static const MIN_VALUE:uint = 0;
    public static const MAX_VALUE:uint = 0xffffffff;

    // Number.length = 1 per ES3
    // E262 {ReadOnly, DontDelete, DontEnum}
    public static const length:int = 1;

    //
    // NB: We _don't_ maintain slot-compatibility with AVM here, since we
    // don't want to box uints.
    //

    // Dummy constructor
    public function uint(value = 0) {}

    _dontEnumPrototype(prototype);
  }
}
