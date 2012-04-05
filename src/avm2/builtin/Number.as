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
  [native("Number")]
  public final class Number
  {
    // Number.length = 1 per ES3
    // E262 {ReadOnly, DontDelete, DontEnum }
    public static const length:int = 1;

    // E262 {DontEnum, DontDelete, ReadOnly}
    public static const NaN               :Number = 0/0;
    public static const NEGATIVE_INFINITY :Number = -1/0;
    public static const POSITIVE_INFINITY :Number = 1/0;
    public static const MIN_VALUE         :Number = native("Number.MIN_VALUE");
    public static const MAX_VALUE         :Number = native("Number.MAX_VALUE");

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
    [native("Math.abs")]
    //[API(CONFIG::SWF_16)]
    public native static function abs   (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [native("Math.acos")]
    public native static function acos  (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [native("Math.asin")]
    public native static function asin  (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [native("Math.atan")]
    public native static function atan  (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [native("Math.ceil")]
    public native static function ceil  (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [native("Math.cos")]
    public native static function cos   (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [native("Math.exp")]
    public native static function exp   (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [native("Math.floor")]
    public native static function floor (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [native("Math.log")]
    public native static function log   (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [native("Math.round")]
    public native static function round (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [native("Math.sin")]
    public native static function sin   (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [native("Math.sqrt")]
    public native static function sqrt  (x:Number)   :Number;
    //[API(CONFIG::SWF_16)]
    [native("Math.tan")]
    public native static function tan   (x:Number)   :Number;

    //[API(CONFIG::SWF_16)]
    [native("Math.atan2")]
    public native static function atan2 (y:Number, x:Number):Number;
    //[API(CONFIG::SWF_16)]
    [native("Math.pow")]
    public native static function pow   (x:Number, y:Number):Number;

    // max() and min() follow Math, for now; float does it differently however, 
    // requiring zero or more arguments and having "length" properties of value zero.
    //[API(CONFIG::SWF_16)]
    [native("Math.max")]
    public native static function max    (x:Number = NEGATIVE_INFINITY, y:Number = NEGATIVE_INFINITY, ... rest):Number;
    //[API(CONFIG::SWF_16)]
    [native("Math.min")]
    public native static function min    (x:Number = POSITIVE_INFINITY, y:Number = POSITIVE_INFINITY, ... rest):Number;

    //[API(CONFIG::SWF_16)]
    [native("Math.random")]
    public native static function random ():Number;

    AS3 native function toString(radix=10):String
    AS3 native function valueOf():Number

    prototype.toLocaleString = prototype.toString = native("Number.prototype.toLocaleString");
    prototype.valueOf = native("Number.prototype.valueOf");

    AS3 native function toExponential(p=0):String
    prototype.toExponential = native("Number.prototype.toExponential");

    AS3 native function toPrecision(p=0):String
    prototype.toPrecision = native("Number.prototype.toPrecision");

    AS3 native function toFixed(p=0):String
    prototype.toFixed = native("Number.prototype.toFixed");

    _dontEnumPrototype(prototype);
  }

  [native("int")]
  public final class int
  {
    // based on Number: E262 {ReadOnly, DontDelete, DontEnum}
    public static const MIN_VALUE:int = -0x80000000;
    public static const MAX_VALUE:int =  0x7fffffff;

    // Number.length = 1 per ES3
    // E262 {ReadOnly, DontDelete, DontEnum }
    public static const length:int = 1

    _dontEnumPrototype(prototype);
  }

  [native("uint")]
  public final class uint
  {
    // based on Number: E262 {ReadOnly, DontDelete, DontEnum}
    public static const MIN_VALUE:uint = 0;
    public static const MAX_VALUE:uint = 0xffffffff;

    // Number.length = 1 per ES3
    // E262 {ReadOnly, DontDelete, DontEnum}
    public static const length:int = 1

    _dontEnumPrototype(prototype);
  }
}
