/* -*- c-basic-offset: 4; indent-tabs-mode: nil; tab-width: 4 -*- */
/* vi: set ts=4 sw=4 expandtab: (add to ~/.vimrc: set modeline modelines=5) */
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
    // No instancegc, value is primitive.
    [native(cls="FloatClass", classgc="exact", instance="float", methods="auto", construct="override")]
    [API(CONFIG::SWF_16)]
    CONFIG::VMCFG_FLOAT
    public final class float
    {
        // E262 {DontEnum, DontDelete, ReadOnly}
        public static const NaN               :float = float(0/0)
        public static const NEGATIVE_INFINITY :float = float(-1/0)
        public static const POSITIVE_INFINITY :float = float(1/0)
        public static const MIN_VALUE         :float = _minValue() // 1.175494351e-38 
        public static const MAX_VALUE         :float = float(3.4028235e+38); // exact value: 340282346638528859811704183484516925440, bit pattern: 0x7f7fffff
        public static const E                 :float = float(2.7182818);
        public static const LN10              :float = float(2.30258509);
        public static const LN2               :float = float(0.693147181);
        public static const LOG2E             :float = float(1.44269504);
        public static const PI                :float = float(3.1415927);
        public static const SQRT1_2           :float = float(7.0710677e-1);
        public static const SQRT2             :float = float(1.4142135);
        // these must match the same constants in MathUtils
        private static const DTOSTR_FIXED:int = 1
        private static const DTOSTR_PRECISION:int = 2
        private static const DTOSTR_EXPONENTIAL:int = 3

        // float.length = 1 per ES3
        // E262 {ReadOnly, DontDelete, DontEnum }
        public static const length:int = 1

        public native static function abs        (x:float)        :float;
        public native static function acos       (x:float)        :float;
        public native static function asin       (x:float)        :float;
        public native static function atan       (x:float)        :float;
        public native static function atan2      (y:float,x:float):float;
        public native static function ceil       (x:float)        :float;
        public native static function cos        (x:float)        :float;
        public native static function exp        (x:float)        :float;
        public native static function floor      (x:float)        :float;
        public native static function log        (x:float)        :float;
        public native static function pow        (x:float,y:float):float;
        public native static function random     ()               :float;
        public native static function round      (x:float)        :float;
        public native static function sin        (x:float)        :float;
        public native static function sqrt       (x:float)        :float;
        public native static function tan        (x:float)        :float;
        public native static function reciprocal (arg:float)      :float;
        public native static function rsqrt      (arg:float)      :float;

        public static function max( ...xs ) : float  
        {
            var result:float = NEGATIVE_INFINITY;
            for(var i:int = 0; i<xs.length; i++)
            {
                var p: float = float(xs[i]);
                if(isNaN(p)) return p;
                if(p > result) result = p;
                else if( p == result && p == float(0) && (float(1)/result)<float(0) ) result = p; // replace "-0" with "+0". 
            }
            return result;
        }

        public static function min( ...xs ) : float  
        {
            var result:float = POSITIVE_INFINITY;
            for(var i:int = 0; i<xs.length; i++)
            {
                var p: float = float(xs[i]);
                if(isNaN(p)) return p;
                if(p < result) result = p;
                else if( p == result && p == float(0) && (float(1)/result)>float(0) ) result = p; // replace "+0" with "-0". 
            }
            return result;
        }

        private static native function _minValue ():float
        private static native function _floatToString(n:float, radix:int):String
        private static native function _convert(n:float, precision:int, mode:int):String

        AS3 function toString(radix=10):String
        {
            return _floatToString(this, radix)
        }
        AS3 function valueOf():float { return this }

        prototype.toLocaleString =
        prototype.toString = function (radix=10):String
        {
            if (this === prototype) return "0"

            if (!(this is float))
                Error.throwError( TypeError, 1004 /*kInvokeOnIncompatibleObjectError*/, "float.prototype.toString" );

            return _floatToString(this, radix)
        }

        prototype.valueOf = function()
        {
            if (this === prototype) return 0
            if (!(this is float))
                Error.throwError( TypeError, 1004 /*kInvokeOnIncompatibleObjectError*/, "float.prototype.valueOf" );
            return this
        }

        AS3 function toExponential(p=0):String
        {
            return _convert(this, int(p), DTOSTR_EXPONENTIAL);
        }
        prototype.toExponential = function(p=0):String
        {
            return _convert(float(this), int(p), DTOSTR_EXPONENTIAL); 
        }

        AS3 function toPrecision(p=0):String
        {
            return _convert(this, int(p), DTOSTR_PRECISION);
        }
        prototype.toPrecision = function(p=0):String
        {
            return _convert(float(this), int(p), DTOSTR_PRECISION); 
        }

        AS3 function toFixed(p=0):String
        {
            return _convert(this, int(p), DTOSTR_FIXED);
        }
        prototype.toFixed = function(p=0):String
        {
            return _convert(float(this), int(p), DTOSTR_FIXED); 
        }

        // Dummy constructor function - This is neccessary so the compiler can do arg # checking for the ctor in strict mode
        // The code for the actual ctor is in FloatClass::construct in the avmplus
        public function float(value = 0)
        {}

        _dontEnumPrototype(prototype);
    }

    // No instancegc, value is primitive.

    [native(cls="Float4Class", classgc="exact", instance="float4_t", methods="auto", construct="override")]
    [API(CONFIG::SWF_16)]
    CONFIG::VMCFG_FLOAT
    public final class float4
    {
        // Dummy constructor function - This is neccessary so the compiler can do arg # checking for the ctor in strict mode
        // The code for the actual ctor is in Float4Class::construct in the avmplus
        public function float4(x:float = 0, y:float = 0, z:float = 0, w:float = 0)     {}

        // float4.length = 4 per float4 spec
        // {ReadOnly, DontDelete, DontEnum }
        public static const length             :int   = 4;

        // comparison functions
        public static native function isGreater        (arg1:float4, arg2:float4) : float4 ;
        public static native function isGreaterOrEqual (arg1:float4, arg2:float4) : float4 ;
        public static native function isLess           (arg1:float4, arg2:float4) : float4 ;
        public static native function isLessOrEqual    (arg1:float4, arg2:float4) : float4 ;
        public static native function isEqual          (arg1:float4, arg2:float4) : float4 ;
        public static native function isNotEqual       (arg1:float4, arg2:float4) : float4 ;
       
        // math and geometric functions
        public static native function abs              (arg:float4)               : float4 ;
        public static native function max              (arg1:float4, arg2:float4) : float4 ;
        public static native function min              (arg1:float4, arg2:float4) : float4 ;
        public static native function reciprocal       (arg:float4)               : float4 ;
        public static native function rsqrt            (arg:float4)               : float4 ;
        public static native function sqrt             (arg:float4)               : float4 ;
        public static native function normalize        (arg:float4)               : float4 ;
        public static native function cross            (arg1:float4, arg2:float4) : float4 ;
        public static native function dot              (arg1:float4, arg2:float4) : float  ;
        public static native function dot2             (arg1:float4, arg2:float4) : float  ;
        public static native function dot3             (arg1:float4, arg2:float4) : float  ;
        public static native function magnitude        (arg:float4)               : float  ;
        public static native function magnitude3       (arg:float4)               : float  ;
        public static native function magnitude2       (arg:float4)               : float  ;
        public static native function distance         (arg1:float4, arg2:float4) : float  ;
        public static native function distance3        (arg1:float4, arg2:float4) : float  ;
        public static native function distance2        (arg1:float4, arg2:float4) : float  ;
 
        // Boolean abstractors
        public function get all() : Boolean { return Boolean(x) && Boolean(y) && Boolean(z) && Boolean(w); }
        public function get any() : Boolean { return Boolean(x) || Boolean(y) || Boolean(z) || Boolean(w); }
        public function get none() : Boolean { return !(Boolean(x) || Boolean(y) || Boolean(z) || Boolean(w)); }

        // component accesses
        private static native function _swizzle        (v:float4, arg:int)        : float4 ;

        public native function get x()    : float;
        public native function get y()    : float;
        public native function get z()    : float;
        public native function get w()    : float;
        
        public function        get xxxx() : float4               { return _swizzle(this,(0) | (0<<2) | (0<<4) | (0<<6)); }
        public function        get xxxy() : float4               { return _swizzle(this,(0) | (0<<2) | (0<<4) | (1<<6)); }
        public function        get xxxz() : float4               { return _swizzle(this,(0) | (0<<2) | (0<<4) | (2<<6)); }
        public function        get xxxw() : float4               { return _swizzle(this,(0) | (0<<2) | (0<<4) | (3<<6)); }
        public function        get xxyx() : float4               { return _swizzle(this,(0) | (0<<2) | (1<<4) | (0<<6)); }
        public function        get xxyy() : float4               { return _swizzle(this,(0) | (0<<2) | (1<<4) | (1<<6)); }
        public function        get xxyz() : float4               { return _swizzle(this,(0) | (0<<2) | (1<<4) | (2<<6)); }
        public function        get xxyw() : float4               { return _swizzle(this,(0) | (0<<2) | (1<<4) | (3<<6)); }
        public function        get xxzx() : float4               { return _swizzle(this,(0) | (0<<2) | (2<<4) | (0<<6)); }
        public function        get xxzy() : float4               { return _swizzle(this,(0) | (0<<2) | (2<<4) | (1<<6)); }
        public function        get xxzz() : float4               { return _swizzle(this,(0) | (0<<2) | (2<<4) | (2<<6)); }
        public function        get xxzw() : float4               { return _swizzle(this,(0) | (0<<2) | (2<<4) | (3<<6)); }
        public function        get xxwx() : float4               { return _swizzle(this,(0) | (0<<2) | (3<<4) | (0<<6)); }
        public function        get xxwy() : float4               { return _swizzle(this,(0) | (0<<2) | (3<<4) | (1<<6)); }
        public function        get xxwz() : float4               { return _swizzle(this,(0) | (0<<2) | (3<<4) | (2<<6)); }
        public function        get xxww() : float4               { return _swizzle(this,(0) | (0<<2) | (3<<4) | (3<<6)); }

        public function        get xyxx() : float4               { return _swizzle(this,(0) | (1<<2) | (0<<4) | (0<<6)); }
        public function        get xyxy() : float4               { return _swizzle(this,(0) | (1<<2) | (0<<4) | (1<<6)); }
        public function        get xyxz() : float4               { return _swizzle(this,(0) | (1<<2) | (0<<4) | (2<<6)); }
        public function        get xyxw() : float4               { return _swizzle(this,(0) | (1<<2) | (0<<4) | (3<<6)); }
        public function        get xyyx() : float4               { return _swizzle(this,(0) | (1<<2) | (1<<4) | (0<<6)); }
        public function        get xyyy() : float4               { return _swizzle(this,(0) | (1<<2) | (1<<4) | (1<<6)); }
        public function        get xyyz() : float4               { return _swizzle(this,(0) | (1<<2) | (1<<4) | (2<<6)); }
        public function        get xyyw() : float4               { return _swizzle(this,(0) | (1<<2) | (1<<4) | (3<<6)); }
        public function        get xyzx() : float4               { return _swizzle(this,(0) | (1<<2) | (2<<4) | (0<<6)); }
        public function        get xyzy() : float4               { return _swizzle(this,(0) | (1<<2) | (2<<4) | (1<<6)); }
        public function        get xyzz() : float4               { return _swizzle(this,(0) | (1<<2) | (2<<4) | (2<<6)); }
        public function        get xyzw() : float4               { return _swizzle(this,(0) | (1<<2) | (2<<4) | (3<<6)); }
        public function        get xywx() : float4               { return _swizzle(this,(0) | (1<<2) | (3<<4) | (0<<6)); }
        public function        get xywy() : float4               { return _swizzle(this,(0) | (1<<2) | (3<<4) | (1<<6)); }
        public function        get xywz() : float4               { return _swizzle(this,(0) | (1<<2) | (3<<4) | (2<<6)); }
        public function        get xyww() : float4               { return _swizzle(this,(0) | (1<<2) | (3<<4) | (3<<6)); }

        public function        get xzxx() : float4               { return _swizzle(this,(0) | (2<<2) | (0<<4) | (0<<6)); }
        public function        get xzxy() : float4               { return _swizzle(this,(0) | (2<<2) | (0<<4) | (1<<6)); }
        public function        get xzxz() : float4               { return _swizzle(this,(0) | (2<<2) | (0<<4) | (2<<6)); }
        public function        get xzxw() : float4               { return _swizzle(this,(0) | (2<<2) | (0<<4) | (3<<6)); }
        public function        get xzyx() : float4               { return _swizzle(this,(0) | (2<<2) | (1<<4) | (0<<6)); }
        public function        get xzyy() : float4               { return _swizzle(this,(0) | (2<<2) | (1<<4) | (1<<6)); }
        public function        get xzyz() : float4               { return _swizzle(this,(0) | (2<<2) | (1<<4) | (2<<6)); }
        public function        get xzyw() : float4               { return _swizzle(this,(0) | (2<<2) | (1<<4) | (3<<6)); }
        public function        get xzzx() : float4               { return _swizzle(this,(0) | (2<<2) | (2<<4) | (0<<6)); }
        public function        get xzzy() : float4               { return _swizzle(this,(0) | (2<<2) | (2<<4) | (1<<6)); }
        public function        get xzzz() : float4               { return _swizzle(this,(0) | (2<<2) | (2<<4) | (2<<6)); }
        public function        get xzzw() : float4               { return _swizzle(this,(0) | (2<<2) | (2<<4) | (3<<6)); }
        public function        get xzwx() : float4               { return _swizzle(this,(0) | (2<<2) | (3<<4) | (0<<6)); }
        public function        get xzwy() : float4               { return _swizzle(this,(0) | (2<<2) | (3<<4) | (1<<6)); }
        public function        get xzwz() : float4               { return _swizzle(this,(0) | (2<<2) | (3<<4) | (2<<6)); }
        public function        get xzww() : float4               { return _swizzle(this,(0) | (2<<2) | (3<<4) | (3<<6)); }

        public function        get xwxx() : float4               { return _swizzle(this,(0) | (3<<2) | (0<<4) | (0<<6)); }
        public function        get xwxy() : float4               { return _swizzle(this,(0) | (3<<2) | (0<<4) | (1<<6)); }
        public function        get xwxz() : float4               { return _swizzle(this,(0) | (3<<2) | (0<<4) | (2<<6)); }
        public function        get xwxw() : float4               { return _swizzle(this,(0) | (3<<2) | (0<<4) | (3<<6)); }
        public function        get xwyx() : float4               { return _swizzle(this,(0) | (3<<2) | (1<<4) | (0<<6)); }
        public function        get xwyy() : float4               { return _swizzle(this,(0) | (3<<2) | (1<<4) | (1<<6)); }
        public function        get xwyz() : float4               { return _swizzle(this,(0) | (3<<2) | (1<<4) | (2<<6)); }
        public function        get xwyw() : float4               { return _swizzle(this,(0) | (3<<2) | (1<<4) | (3<<6)); }
        public function        get xwzx() : float4               { return _swizzle(this,(0) | (3<<2) | (2<<4) | (0<<6)); }
        public function        get xwzy() : float4               { return _swizzle(this,(0) | (3<<2) | (2<<4) | (1<<6)); }
        public function        get xwzz() : float4               { return _swizzle(this,(0) | (3<<2) | (2<<4) | (2<<6)); }
        public function        get xwzw() : float4               { return _swizzle(this,(0) | (3<<2) | (2<<4) | (3<<6)); }
        public function        get xwwx() : float4               { return _swizzle(this,(0) | (3<<2) | (3<<4) | (0<<6)); }
        public function        get xwwy() : float4               { return _swizzle(this,(0) | (3<<2) | (3<<4) | (1<<6)); }
        public function        get xwwz() : float4               { return _swizzle(this,(0) | (3<<2) | (3<<4) | (2<<6)); }
        public function        get xwww() : float4               { return _swizzle(this,(0) | (3<<2) | (3<<4) | (3<<6)); }
        //////////////////////////////////////////////////////////////////////////////////////
        public function        get yxxx() : float4               { return _swizzle(this,(1) | (0<<2) | (0<<4) | (0<<6)); }
        public function        get yxxy() : float4               { return _swizzle(this,(1) | (0<<2) | (0<<4) | (1<<6)); }
        public function        get yxxz() : float4               { return _swizzle(this,(1) | (0<<2) | (0<<4) | (2<<6)); }
        public function        get yxxw() : float4               { return _swizzle(this,(1) | (0<<2) | (0<<4) | (3<<6)); }
        public function        get yxyx() : float4               { return _swizzle(this,(1) | (0<<2) | (1<<4) | (0<<6)); }
        public function        get yxyy() : float4               { return _swizzle(this,(1) | (0<<2) | (1<<4) | (1<<6)); }
        public function        get yxyz() : float4               { return _swizzle(this,(1) | (0<<2) | (1<<4) | (2<<6)); }
        public function        get yxyw() : float4               { return _swizzle(this,(1) | (0<<2) | (1<<4) | (3<<6)); }
        public function        get yxzx() : float4               { return _swizzle(this,(1) | (0<<2) | (2<<4) | (0<<6)); }
        public function        get yxzy() : float4               { return _swizzle(this,(1) | (0<<2) | (2<<4) | (1<<6)); }
        public function        get yxzz() : float4               { return _swizzle(this,(1) | (0<<2) | (2<<4) | (2<<6)); }
        public function        get yxzw() : float4               { return _swizzle(this,(1) | (0<<2) | (2<<4) | (3<<6)); }
        public function        get yxwx() : float4               { return _swizzle(this,(1) | (0<<2) | (3<<4) | (0<<6)); }
        public function        get yxwy() : float4               { return _swizzle(this,(1) | (0<<2) | (3<<4) | (1<<6)); }
        public function        get yxwz() : float4               { return _swizzle(this,(1) | (0<<2) | (3<<4) | (2<<6)); }
        public function        get yxww() : float4               { return _swizzle(this,(1) | (0<<2) | (3<<4) | (3<<6)); }
                                                                                    
        public function        get yyxx() : float4               { return _swizzle(this,(1) | (1<<2) | (0<<4) | (0<<6)); }
        public function        get yyxy() : float4               { return _swizzle(this,(1) | (1<<2) | (0<<4) | (1<<6)); }
        public function        get yyxz() : float4               { return _swizzle(this,(1) | (1<<2) | (0<<4) | (2<<6)); }
        public function        get yyxw() : float4               { return _swizzle(this,(1) | (1<<2) | (0<<4) | (3<<6)); }
        public function        get yyyx() : float4               { return _swizzle(this,(1) | (1<<2) | (1<<4) | (0<<6)); }
        public function        get yyyy() : float4               { return _swizzle(this,(1) | (1<<2) | (1<<4) | (1<<6)); }
        public function        get yyyz() : float4               { return _swizzle(this,(1) | (1<<2) | (1<<4) | (2<<6)); }
        public function        get yyyw() : float4               { return _swizzle(this,(1) | (1<<2) | (1<<4) | (3<<6)); }
        public function        get yyzx() : float4               { return _swizzle(this,(1) | (1<<2) | (2<<4) | (0<<6)); }
        public function        get yyzy() : float4               { return _swizzle(this,(1) | (1<<2) | (2<<4) | (1<<6)); }
        public function        get yyzz() : float4               { return _swizzle(this,(1) | (1<<2) | (2<<4) | (2<<6)); }
        public function        get yyzw() : float4               { return _swizzle(this,(1) | (1<<2) | (2<<4) | (3<<6)); }
        public function        get yywx() : float4               { return _swizzle(this,(1) | (1<<2) | (3<<4) | (0<<6)); }
        public function        get yywy() : float4               { return _swizzle(this,(1) | (1<<2) | (3<<4) | (1<<6)); }
        public function        get yywz() : float4               { return _swizzle(this,(1) | (1<<2) | (3<<4) | (2<<6)); }
        public function        get yyww() : float4               { return _swizzle(this,(1) | (1<<2) | (3<<4) | (3<<6)); }
                                                                                    
        public function        get yzxx() : float4               { return _swizzle(this,(1) | (2<<2) | (0<<4) | (0<<6)); }
        public function        get yzxy() : float4               { return _swizzle(this,(1) | (2<<2) | (0<<4) | (1<<6)); }
        public function        get yzxz() : float4               { return _swizzle(this,(1) | (2<<2) | (0<<4) | (2<<6)); }
        public function        get yzxw() : float4               { return _swizzle(this,(1) | (2<<2) | (0<<4) | (3<<6)); }
        public function        get yzyx() : float4               { return _swizzle(this,(1) | (2<<2) | (1<<4) | (0<<6)); }
        public function        get yzyy() : float4               { return _swizzle(this,(1) | (2<<2) | (1<<4) | (1<<6)); }
        public function        get yzyz() : float4               { return _swizzle(this,(1) | (2<<2) | (1<<4) | (2<<6)); }
        public function        get yzyw() : float4               { return _swizzle(this,(1) | (2<<2) | (1<<4) | (3<<6)); }
        public function        get yzzx() : float4               { return _swizzle(this,(1) | (2<<2) | (2<<4) | (0<<6)); }
        public function        get yzzy() : float4               { return _swizzle(this,(1) | (2<<2) | (2<<4) | (1<<6)); }
        public function        get yzzz() : float4               { return _swizzle(this,(1) | (2<<2) | (2<<4) | (2<<6)); }
        public function        get yzzw() : float4               { return _swizzle(this,(1) | (2<<2) | (2<<4) | (3<<6)); }
        public function        get yzwx() : float4               { return _swizzle(this,(1) | (2<<2) | (3<<4) | (0<<6)); }
        public function        get yzwy() : float4               { return _swizzle(this,(1) | (2<<2) | (3<<4) | (1<<6)); }
        public function        get yzwz() : float4               { return _swizzle(this,(1) | (2<<2) | (3<<4) | (2<<6)); }
        public function        get yzww() : float4               { return _swizzle(this,(1) | (2<<2) | (3<<4) | (3<<6)); }
                                                                                   
        public function        get ywxx() : float4               { return _swizzle(this,(1) | (3<<2) | (0<<4) | (0<<6)); }
        public function        get ywxy() : float4               { return _swizzle(this,(1) | (3<<2) | (0<<4) | (1<<6)); }
        public function        get ywxz() : float4               { return _swizzle(this,(1) | (3<<2) | (0<<4) | (2<<6)); }
        public function        get ywxw() : float4               { return _swizzle(this,(1) | (3<<2) | (0<<4) | (3<<6)); }
        public function        get ywyx() : float4               { return _swizzle(this,(1) | (3<<2) | (1<<4) | (0<<6)); }
        public function        get ywyy() : float4               { return _swizzle(this,(1) | (3<<2) | (1<<4) | (1<<6)); }
        public function        get ywyz() : float4               { return _swizzle(this,(1) | (3<<2) | (1<<4) | (2<<6)); }
        public function        get ywyw() : float4               { return _swizzle(this,(1) | (3<<2) | (1<<4) | (3<<6)); }
        public function        get ywzx() : float4               { return _swizzle(this,(1) | (3<<2) | (2<<4) | (0<<6)); }
        public function        get ywzy() : float4               { return _swizzle(this,(1) | (3<<2) | (2<<4) | (1<<6)); }
        public function        get ywzz() : float4               { return _swizzle(this,(1) | (3<<2) | (2<<4) | (2<<6)); }
        public function        get ywzw() : float4               { return _swizzle(this,(1) | (3<<2) | (2<<4) | (3<<6)); }
        public function        get ywwx() : float4               { return _swizzle(this,(1) | (3<<2) | (3<<4) | (0<<6)); }
        public function        get ywwy() : float4               { return _swizzle(this,(1) | (3<<2) | (3<<4) | (1<<6)); }
        public function        get ywwz() : float4               { return _swizzle(this,(1) | (3<<2) | (3<<4) | (2<<6)); }
        public function        get ywww() : float4               { return _swizzle(this,(1) | (3<<2) | (3<<4) | (3<<6)); }
        //////////////////////////////////////////////////////////////////////////////////////
        public function        get zxxx() : float4               { return _swizzle(this,(2) | (0<<2) | (0<<4) | (0<<6)); }
        public function        get zxxy() : float4               { return _swizzle(this,(2) | (0<<2) | (0<<4) | (1<<6)); }
        public function        get zxxz() : float4               { return _swizzle(this,(2) | (0<<2) | (0<<4) | (2<<6)); }
        public function        get zxxw() : float4               { return _swizzle(this,(2) | (0<<2) | (0<<4) | (3<<6)); }
        public function        get zxyx() : float4               { return _swizzle(this,(2) | (0<<2) | (1<<4) | (0<<6)); }
        public function        get zxyy() : float4               { return _swizzle(this,(2) | (0<<2) | (1<<4) | (1<<6)); }
        public function        get zxyz() : float4               { return _swizzle(this,(2) | (0<<2) | (1<<4) | (2<<6)); }
        public function        get zxyw() : float4               { return _swizzle(this,(2) | (0<<2) | (1<<4) | (3<<6)); }
        public function        get zxzx() : float4               { return _swizzle(this,(2) | (0<<2) | (2<<4) | (0<<6)); }
        public function        get zxzy() : float4               { return _swizzle(this,(2) | (0<<2) | (2<<4) | (1<<6)); }
        public function        get zxzz() : float4               { return _swizzle(this,(2) | (0<<2) | (2<<4) | (2<<6)); }
        public function        get zxzw() : float4               { return _swizzle(this,(2) | (0<<2) | (2<<4) | (3<<6)); }
        public function        get zxwx() : float4               { return _swizzle(this,(2) | (0<<2) | (3<<4) | (0<<6)); }
        public function        get zxwy() : float4               { return _swizzle(this,(2) | (0<<2) | (3<<4) | (1<<6)); }
        public function        get zxwz() : float4               { return _swizzle(this,(2) | (0<<2) | (3<<4) | (2<<6)); }
        public function        get zxww() : float4               { return _swizzle(this,(2) | (0<<2) | (3<<4) | (3<<6)); }
                                                                                    
        public function        get zyxx() : float4               { return _swizzle(this,(2) | (1<<2) | (0<<4) | (0<<6)); }
        public function        get zyxy() : float4               { return _swizzle(this,(2) | (1<<2) | (0<<4) | (1<<6)); }
        public function        get zyxz() : float4               { return _swizzle(this,(2) | (1<<2) | (0<<4) | (2<<6)); }
        public function        get zyxw() : float4               { return _swizzle(this,(2) | (1<<2) | (0<<4) | (3<<6)); }
        public function        get zyyx() : float4               { return _swizzle(this,(2) | (1<<2) | (1<<4) | (0<<6)); }
        public function        get zyyy() : float4               { return _swizzle(this,(2) | (1<<2) | (1<<4) | (1<<6)); }
        public function        get zyyz() : float4               { return _swizzle(this,(2) | (1<<2) | (1<<4) | (2<<6)); }
        public function        get zyyw() : float4               { return _swizzle(this,(2) | (1<<2) | (1<<4) | (3<<6)); }
        public function        get zyzx() : float4               { return _swizzle(this,(2) | (1<<2) | (2<<4) | (0<<6)); }
        public function        get zyzy() : float4               { return _swizzle(this,(2) | (1<<2) | (2<<4) | (1<<6)); }
        public function        get zyzz() : float4               { return _swizzle(this,(2) | (1<<2) | (2<<4) | (2<<6)); }
        public function        get zyzw() : float4               { return _swizzle(this,(2) | (1<<2) | (2<<4) | (3<<6)); }
        public function        get zywx() : float4               { return _swizzle(this,(2) | (1<<2) | (3<<4) | (0<<6)); }
        public function        get zywy() : float4               { return _swizzle(this,(2) | (1<<2) | (3<<4) | (1<<6)); }
        public function        get zywz() : float4               { return _swizzle(this,(2) | (1<<2) | (3<<4) | (2<<6)); }
        public function        get zyww() : float4               { return _swizzle(this,(2) | (1<<2) | (3<<4) | (3<<6)); }
                                                                                    
        public function        get zzxx() : float4               { return _swizzle(this,(2) | (2<<2) | (0<<4) | (0<<6)); }
        public function        get zzxy() : float4               { return _swizzle(this,(2) | (2<<2) | (0<<4) | (1<<6)); }
        public function        get zzxz() : float4               { return _swizzle(this,(2) | (2<<2) | (0<<4) | (2<<6)); }
        public function        get zzxw() : float4               { return _swizzle(this,(2) | (2<<2) | (0<<4) | (3<<6)); }
        public function        get zzyx() : float4               { return _swizzle(this,(2) | (2<<2) | (1<<4) | (0<<6)); }
        public function        get zzyy() : float4               { return _swizzle(this,(2) | (2<<2) | (1<<4) | (1<<6)); }
        public function        get zzyz() : float4               { return _swizzle(this,(2) | (2<<2) | (1<<4) | (2<<6)); }
        public function        get zzyw() : float4               { return _swizzle(this,(2) | (2<<2) | (1<<4) | (3<<6)); }
        public function        get zzzx() : float4               { return _swizzle(this,(2) | (2<<2) | (2<<4) | (0<<6)); }
        public function        get zzzy() : float4               { return _swizzle(this,(2) | (2<<2) | (2<<4) | (1<<6)); }
        public function        get zzzz() : float4               { return _swizzle(this,(2) | (2<<2) | (2<<4) | (2<<6)); }
        public function        get zzzw() : float4               { return _swizzle(this,(2) | (2<<2) | (2<<4) | (3<<6)); }
        public function        get zzwx() : float4               { return _swizzle(this,(2) | (2<<2) | (3<<4) | (0<<6)); }
        public function        get zzwy() : float4               { return _swizzle(this,(2) | (2<<2) | (3<<4) | (1<<6)); }
        public function        get zzwz() : float4               { return _swizzle(this,(2) | (2<<2) | (3<<4) | (2<<6)); }
        public function        get zzww() : float4               { return _swizzle(this,(2) | (2<<2) | (3<<4) | (3<<6)); }

        public function        get zwxx() : float4               { return _swizzle(this,(2) | (3<<2) | (0<<4) | (0<<6)); }
        public function        get zwxy() : float4               { return _swizzle(this,(2) | (3<<2) | (0<<4) | (1<<6)); }
        public function        get zwxz() : float4               { return _swizzle(this,(2) | (3<<2) | (0<<4) | (2<<6)); }
        public function        get zwxw() : float4               { return _swizzle(this,(2) | (3<<2) | (0<<4) | (3<<6)); }
        public function        get zwyx() : float4               { return _swizzle(this,(2) | (3<<2) | (1<<4) | (0<<6)); }
        public function        get zwyy() : float4               { return _swizzle(this,(2) | (3<<2) | (1<<4) | (1<<6)); }
        public function        get zwyz() : float4               { return _swizzle(this,(2) | (3<<2) | (1<<4) | (2<<6)); }
        public function        get zwyw() : float4               { return _swizzle(this,(2) | (3<<2) | (1<<4) | (3<<6)); }
        public function        get zwzx() : float4               { return _swizzle(this,(2) | (3<<2) | (2<<4) | (0<<6)); }
        public function        get zwzy() : float4               { return _swizzle(this,(2) | (3<<2) | (2<<4) | (1<<6)); }
        public function        get zwzz() : float4               { return _swizzle(this,(2) | (3<<2) | (2<<4) | (2<<6)); }
        public function        get zwzw() : float4               { return _swizzle(this,(2) | (3<<2) | (2<<4) | (3<<6)); }
        public function        get zwwx() : float4               { return _swizzle(this,(2) | (3<<2) | (3<<4) | (0<<6)); }
        public function        get zwwy() : float4               { return _swizzle(this,(2) | (3<<2) | (3<<4) | (1<<6)); }
        public function        get zwwz() : float4               { return _swizzle(this,(2) | (3<<2) | (3<<4) | (2<<6)); }
        public function        get zwww() : float4               { return _swizzle(this,(2) | (3<<2) | (3<<4) | (3<<6)); }
        //////////////////////////////////////////////////////////////////////////////////////
        public function        get wxxx() : float4               { return _swizzle(this,(3) | (0<<2) | (0<<4) | (0<<6)); }
        public function        get wxxy() : float4               { return _swizzle(this,(3) | (0<<2) | (0<<4) | (1<<6)); }
        public function        get wxxz() : float4               { return _swizzle(this,(3) | (0<<2) | (0<<4) | (2<<6)); }
        public function        get wxxw() : float4               { return _swizzle(this,(3) | (0<<2) | (0<<4) | (3<<6)); }
        public function        get wxyx() : float4               { return _swizzle(this,(3) | (0<<2) | (1<<4) | (0<<6)); }
        public function        get wxyy() : float4               { return _swizzle(this,(3) | (0<<2) | (1<<4) | (1<<6)); }
        public function        get wxyz() : float4               { return _swizzle(this,(3) | (0<<2) | (1<<4) | (2<<6)); }
        public function        get wxyw() : float4               { return _swizzle(this,(3) | (0<<2) | (1<<4) | (3<<6)); }
        public function        get wxzx() : float4               { return _swizzle(this,(3) | (0<<2) | (2<<4) | (0<<6)); }
        public function        get wxzy() : float4               { return _swizzle(this,(3) | (0<<2) | (2<<4) | (1<<6)); }
        public function        get wxzz() : float4               { return _swizzle(this,(3) | (0<<2) | (2<<4) | (2<<6)); }
        public function        get wxzw() : float4               { return _swizzle(this,(3) | (0<<2) | (2<<4) | (3<<6)); }
        public function        get wxwx() : float4               { return _swizzle(this,(3) | (0<<2) | (3<<4) | (0<<6)); }
        public function        get wxwy() : float4               { return _swizzle(this,(3) | (0<<2) | (3<<4) | (1<<6)); }
        public function        get wxwz() : float4               { return _swizzle(this,(3) | (0<<2) | (3<<4) | (2<<6)); }
        public function        get wxww() : float4               { return _swizzle(this,(3) | (0<<2) | (3<<4) | (3<<6)); }

        public function        get wyxx() : float4               { return _swizzle(this,(3) | (1<<2) | (0<<4) | (0<<6)); }
        public function        get wyxy() : float4               { return _swizzle(this,(3) | (1<<2) | (0<<4) | (1<<6)); }
        public function        get wyxz() : float4               { return _swizzle(this,(3) | (1<<2) | (0<<4) | (2<<6)); }
        public function        get wyxw() : float4               { return _swizzle(this,(3) | (1<<2) | (0<<4) | (3<<6)); }
        public function        get wyyx() : float4               { return _swizzle(this,(3) | (1<<2) | (1<<4) | (0<<6)); }
        public function        get wyyy() : float4               { return _swizzle(this,(3) | (1<<2) | (1<<4) | (1<<6)); }
        public function        get wyyz() : float4               { return _swizzle(this,(3) | (1<<2) | (1<<4) | (2<<6)); }
        public function        get wyyw() : float4               { return _swizzle(this,(3) | (1<<2) | (1<<4) | (3<<6)); }
        public function        get wyzx() : float4               { return _swizzle(this,(3) | (1<<2) | (2<<4) | (0<<6)); }
        public function        get wyzy() : float4               { return _swizzle(this,(3) | (1<<2) | (2<<4) | (1<<6)); }
        public function        get wyzz() : float4               { return _swizzle(this,(3) | (1<<2) | (2<<4) | (2<<6)); }
        public function        get wyzw() : float4               { return _swizzle(this,(3) | (1<<2) | (2<<4) | (3<<6)); }
        public function        get wywx() : float4               { return _swizzle(this,(3) | (1<<2) | (3<<4) | (0<<6)); }
        public function        get wywy() : float4               { return _swizzle(this,(3) | (1<<2) | (3<<4) | (1<<6)); }
        public function        get wywz() : float4               { return _swizzle(this,(3) | (1<<2) | (3<<4) | (2<<6)); }
        public function        get wyww() : float4               { return _swizzle(this,(3) | (1<<2) | (3<<4) | (3<<6)); }

        public function        get wzxx() : float4               { return _swizzle(this,(3) | (2<<2) | (0<<4) | (0<<6)); }
        public function        get wzxy() : float4               { return _swizzle(this,(3) | (2<<2) | (0<<4) | (1<<6)); }
        public function        get wzxz() : float4               { return _swizzle(this,(3) | (2<<2) | (0<<4) | (2<<6)); }
        public function        get wzxw() : float4               { return _swizzle(this,(3) | (2<<2) | (0<<4) | (3<<6)); }
        public function        get wzyx() : float4               { return _swizzle(this,(3) | (2<<2) | (1<<4) | (0<<6)); }
        public function        get wzyy() : float4               { return _swizzle(this,(3) | (2<<2) | (1<<4) | (1<<6)); }
        public function        get wzyz() : float4               { return _swizzle(this,(3) | (2<<2) | (1<<4) | (2<<6)); }
        public function        get wzyw() : float4               { return _swizzle(this,(3) | (2<<2) | (1<<4) | (3<<6)); }
        public function        get wzzx() : float4               { return _swizzle(this,(3) | (2<<2) | (2<<4) | (0<<6)); }
        public function        get wzzy() : float4               { return _swizzle(this,(3) | (2<<2) | (2<<4) | (1<<6)); }
        public function        get wzzz() : float4               { return _swizzle(this,(3) | (2<<2) | (2<<4) | (2<<6)); }
        public function        get wzzw() : float4               { return _swizzle(this,(3) | (2<<2) | (2<<4) | (3<<6)); }
        public function        get wzwx() : float4               { return _swizzle(this,(3) | (2<<2) | (3<<4) | (0<<6)); }
        public function        get wzwy() : float4               { return _swizzle(this,(3) | (2<<2) | (3<<4) | (1<<6)); }
        public function        get wzwz() : float4               { return _swizzle(this,(3) | (2<<2) | (3<<4) | (2<<6)); }
        public function        get wzww() : float4               { return _swizzle(this,(3) | (2<<2) | (3<<4) | (3<<6)); }

        public function        get wwxx() : float4               { return _swizzle(this,(3) | (3<<2) | (0<<4) | (0<<6)); }
        public function        get wwxy() : float4               { return _swizzle(this,(3) | (3<<2) | (0<<4) | (1<<6)); }
        public function        get wwxz() : float4               { return _swizzle(this,(3) | (3<<2) | (0<<4) | (2<<6)); }
        public function        get wwxw() : float4               { return _swizzle(this,(3) | (3<<2) | (0<<4) | (3<<6)); }
        public function        get wwyx() : float4               { return _swizzle(this,(3) | (3<<2) | (1<<4) | (0<<6)); }
        public function        get wwyy() : float4               { return _swizzle(this,(3) | (3<<2) | (1<<4) | (1<<6)); }
        public function        get wwyz() : float4               { return _swizzle(this,(3) | (3<<2) | (1<<4) | (2<<6)); }
        public function        get wwyw() : float4               { return _swizzle(this,(3) | (3<<2) | (1<<4) | (3<<6)); }
        public function        get wwzx() : float4               { return _swizzle(this,(3) | (3<<2) | (2<<4) | (0<<6)); }
        public function        get wwzy() : float4               { return _swizzle(this,(3) | (3<<2) | (2<<4) | (1<<6)); }
        public function        get wwzz() : float4               { return _swizzle(this,(3) | (3<<2) | (2<<4) | (2<<6)); }
        public function        get wwzw() : float4               { return _swizzle(this,(3) | (3<<2) | (2<<4) | (3<<6)); }
        public function        get wwwx() : float4               { return _swizzle(this,(3) | (3<<2) | (3<<4) | (0<<6)); }
        public function        get wwwy() : float4               { return _swizzle(this,(3) | (3<<2) | (3<<4) | (1<<6)); }
        public function        get wwwz() : float4               { return _swizzle(this,(3) | (3<<2) | (3<<4) | (2<<6)); }
        public function        get wwww() : float4               { return _swizzle(this,(3) | (3<<2) | (3<<4) | (3<<6)); }
        //////////////////////////////////////////////////////////////////////////////////////

        public function get length(): uint { return 4; }

        AS3 function toString(radix=10):String {
            return this.x.toString(radix) + "," + this.y.toString(radix) + "," + this.z.toString(radix) + "," + this.w.toString(radix);
        }
        AS3 function valueOf():float4                  { return this }

        prototype.toLocaleString =
        prototype.toString = function (radix=10):String
        {
            if (this === prototype) return "0"

            if (!(this is float4))
                Error.throwError( TypeError, 1004 /*kInvokeOnIncompatibleObjectError*/, "float4.prototype.toString" );

            return this.AS3::toString(radix)
        }

        prototype.valueOf = function()
        {
            if (this === prototype) return 0
            if (!(this is float4))
                Error.throwError( TypeError, 1004 /*kInvokeOnIncompatibleObjectError*/, "float4.prototype.valueOf" );
            return this
        }

        _dontEnumPrototype(prototype);
    }
}
