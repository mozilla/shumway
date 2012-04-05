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

package __AS3__.vec
{
    [native(cls="VectorClass", gc="exact", instance="ObjectVectorObject", methods="auto", construct="override")]
    dynamic final public class Vector
    {
    }

    [native(cls="ObjectVectorClass", gc="exact", instance="ObjectVectorObject", methods="auto", construct="override")]
    dynamic final class Vector$object
    {
        // Dummy constructor -- actual code is in construct()
        public function Vector$object(length:uint=0, fixed:Boolean=false)
        {
        }

        // Private helper methods.  These allow most of the implementation to be abstracted into
        // a file that is included from the implementation of the different Vector types.
        private static function castToThisType(item) : Vector$object {
            return item;
        }

        private native function newThisType() : Vector$object;
        
        // Bugzilla 573452, Type-specialized Vector methods: specialize Push.
        //
        // NOTE SIX ALMOST-DUPLICATED COPIES OF THIS FUNCTION IN THE FILE.

        prototype.push = function (...args) // rest args are efficient
        {
            // Type check - Vector methods are not generic.
            castToThisType(this);

            // making it type specialized, otherwise compiler treats 'this' as untyped
            var v:Vector$object = this;
            
            // FP 10.1 throws this error specifically, the setting of the element in the
            // loop below will generate error 1125 instead.
            if (v.fixed)
                Error.throwError(RangeError, 1126);

            // The loop is correct because Tamarin (as of June 2010) has a 4GB object limit.
            // Thus at most 1G elements can be accommodated in a Vector, and the index never
            // wraps around.
            var n:uint = v.length;
            var i:uint=0;
            var argc:uint=args.length;
            while (i < argc) 
            {
                v[n] = args[i];
                i++;
                n++;
            }
            v.length = n;
            return n;
        }

        // Include most of the vector implementation.
        include "VectorImpl.as";

        // Methods with the specific type in their sig.  Can't be in the impl file since it doesn't
        // know what "type" vector this is (int, uint, Number, Object)
        // Most of these just call generic versions in impl, but some small ones are implemented here.
        AS3 function concat(...items) : Vector$object {
            return _concat(items);
        }

        AS3 function filter(checker : Function, thisObj: Object=null): Vector$object {
            return _filter(checker, thisObj);
        }

        AS3 native function pop();

        AS3 function reverse() : Vector$object {
            this._reverse();
            return this;
        }

        AS3 native function shift():*;

        AS3 function slice(start:Number=0, end:Number=0x7fffffff): Vector$object {
            return this._slice(start, end);
        }

        AS3 function sort(comparefn): Vector$object {
            var a : Array = [comparefn];
            _sort(this, a);
            return this;
        }
        AS3 function splice(start: Number, deleteCount: Number, ...items): Vector$object {
            return this._splice(start, deleteCount, items);
        }

        AS3 function indexOf(value:Object, from:Number=0): Number {
            var start:uint = clamp( from, length );
            for ( var i:uint=start, limit:uint=length ; i < limit ; i++ )
                if (this[i] === value)
                    return i;
            return -1;
        }

        AS3 function lastIndexOf(value:Object, from: Number=0x7fffffff): Number {
            var start:uint = clamp( from, length );
            if( start == length )
                --start;
            for ( var i:int=start ; i >= 0 ; i-- ) {
                if (this[i] === value)
                    return i;
            }
            return -1;
        }

    }

    [native(cls="IntVectorClass", gc="exact", instance="IntVectorObject", methods="auto", construct="override")]
    dynamic final class Vector$int
    {

        // Dummy constructor -- actual code is in construct()
        public function Vector$int(length:uint=0, fixed:Boolean=false)
        {
        }

        // Private helper methods.  These allow most of the implementation to be abstracted into
        // a file that is included from the implementation of the different Vector types.
        private static function castToThisType(item) : Vector$int {
            return item;
        }

        private native function newThisType() : Vector$int;

        // Bugzilla 573452, Type-specialized Vector methods: specialize Push.
        //
        // NOTE SIX ALMOST-DUPLICATED COPIES OF THIS FUNCTION IN THE FILE.

        prototype.push = function (...args)  // rest args are efficient
        {
            // Type check - Vector methods are not generic.
            castToThisType(this);

            // making it type specialized, otherwise compiler treats 'this' as untyped
            var v:Vector$int = this;
            
            // FP 10.1 throws this error specifically, the setting of the element in the
            // loop below will generate error 1125 instead.
            if (v.fixed)
                Error.throwError(RangeError, 1126);
            
            // The loop is correct because Tamarin (as of June 2010) has a 4GB object limit.
            // Thus at most 1G elements can be accommodated in a Vector, and the index never
            // wraps around.
            var n:uint = v.length;
            var i:uint=0;
            var argc:uint=args.length;
            while (i < argc) 
            {
                v[n] = args[i];
                i++;
                n++;
            }
            v.length = n;
            return n;
        }
        
        // Include most of the vector implementation.
        include "VectorImpl.as";

        // Methods with the specific type in their sig.  Can't be in the impl file since it doesn't
        // know what "type" vector this is (int, uint, Number, Object)
        // Most of these just call generic versions in impl, but some small ones are implemented here.
        AS3 function concat(...items) : Vector$int {
            return _concat(items);
        }

        AS3 function filter(checker:Function, thisObj: Object=null): Vector$int {
            return _filter(checker, thisObj);
        }

        AS3 native function pop(): int ;

        AS3 function reverse() : Vector$int {
            this._reverse();
            return this;
        }
        AS3 native function shift():int;

        AS3 function slice(start:Number=0, end:Number=0x7fffffff): Vector$int {
            return this._slice(start, end);
        }

        AS3 function sort(comparefn): Vector$int {
            var a : Array = [comparefn];
            _sort(this, a);
            return this;
        }
        AS3 function splice(start: Number, deleteCount: Number, ...items): Vector$int {
            return this._splice(start, deleteCount, items);
        }

        AS3 function indexOf(value:int, from:Number=0): Number {
            var start:uint = clamp( from, length );
            for ( var i:uint=start, limit:uint=length ; i < limit ; i++ )
                if (this[i] === value)
                    return i;
            return -1;
        }

        AS3 function lastIndexOf(value:int, from: Number=0x7fffffff): Number {
            var start:uint = clamp( from, length );
            if( start == length )
                --start;
            for ( var i:int=start ; i >= 0 ; i-- ) {
                if (this[i] === value)
                    return i;
            }
            return -1;
        }

    }


    [native(cls="UIntVectorClass", gc="exact", instance="UIntVectorObject", methods="auto", construct="override")]
    dynamic final class Vector$uint
    {
        // Dummy constructor -- actual code is in construct()
        public function Vector$uint(length:uint=0, fixed:Boolean=false)
        {
        }

        // Private helper methods.  These allow most of the implementation to be abstracted into
        // a file that is included from the implementation of the different Vector types.
        private static function castToThisType(item) : Vector$uint {
            return item;
        }

        private native function newThisType() : Vector$uint;

        // Bugzilla 573452, Type-specialized Vector methods: specialize Push.
        //
        // NOTE SIX ALMOST-DUPLICATED COPIES OF THIS FUNCTION IN THE FILE.

        prototype.push = function (...args)  // rest args are efficient
        {
            // Type check - Vector methods are not generic.
            castToThisType(this);

            // making it type specialized, otherwise compiler treats 'this' as untyped
            var v:Vector$uint = this;
            
            // FP 10.1 throws this error specifically, the setting of the element in the
            // loop below will generate error 1125 instead.
            if (v.fixed)
                Error.throwError(RangeError, 1126);

            // The loop is correct because Tamarin (as of June 2010) has a 4GB object limit.
            // Thus at most 1G elements can be accommodated in a Vector, and the index never
            // wraps around.
            var n:uint = v.length;
            var i:uint=0;
            var argc:uint=args.length;
            while (i < argc) 
            {
                v[n] = args[i];
                i++;
                n++;
            }
            v.length = n;
            return n;
        }

        // Include most of the vector implementation.
        include "VectorImpl.as";

        // Methods with the specific type in their sig.  Can't be in the impl file since it doesn't
        // know what "type" vector this is (int, uint, Number, Object)
        // Most of these just call generic versions in impl, but some small ones are implemented here.
        AS3 function concat(...items) : Vector$uint {
            return _concat(items);
        }

        AS3 function filter(checker:Function, thisObj: Object=null): Vector$uint {
            return _filter(checker, thisObj);
        }

        AS3 native function pop(): uint ;

        AS3 function reverse() : Vector$uint {
            this._reverse();
            return this;
        }

        AS3 native function shift():uint;

        AS3 function slice(start:Number=0, end:Number=0x7fffffff): Vector$uint {
            return this._slice(start, end);
        }

        AS3 function sort(comparefn): Vector$uint {
            var a : Array = [comparefn];
            _sort(this, a);
            return this;
        }
        AS3 function splice(start: Number, deleteCount: Number, ...items): Vector$uint {
            return this._splice(start, deleteCount, items);
        }

        AS3 function indexOf(value:uint, from:Number=0): Number {
            var start:uint = clamp( from, length );
            for ( var i:uint=start, limit:uint=length ; i < limit ; i++ )
                if (this[i] === value)
                    return i;
            return -1;
        }

        AS3 function lastIndexOf(value:uint, from: Number=0x7fffffff): Number {
            var start:uint = clamp( from, length );
            if( start == length )
                --start;
            for ( var i:int=start ; i >= 0 ; i-- ) {
                if (this[i] === value)
                    return i;
            }
            return -1;
        }

    }

    [native(cls="DoubleVectorClass", gc="exact", instance="DoubleVectorObject", methods="auto", construct="override")]
    dynamic final class Vector$double
    {
        // Dummy constructor -- actual code is in construct()
        public function Vector$double(length:uint=0, fixed:Boolean=false)
        {
        }

        // Private helper methods.  These allow most of the implementation to be abstracted into
        // a file that is included from the implementation of the different Vector types.
        private static function castToThisType(item) : Vector$double {
            return item;
        }

        private native function newThisType() : Vector$double;

        // Bugzilla 573452, Type-specialized Vector methods: specialize Push.
        //
        // NOTE SIX ALMOST-DUPLICATED COPIES OF THIS FUNCTION IN THE FILE.

        prototype.push = function (...args)  // rest args are efficient
        {
            // Type check - Vector methods are not generic.
            castToThisType(this);

            // making it type specialized, otherwise compiler treats 'this' as untyped
            var v:Vector$double = this;

            // FP 10.1 throws this error specifically, the setting of the element in the
            // loop below will generate error 1125 instead.
            if (v.fixed)
                Error.throwError(RangeError, 1126);

            // The loop is correct because Tamarin (as of June 2010) has a 4GB object limit.
            // Thus at most 1G elements can be accommodated in a Vector, and the index never
            // wraps around.
            var n:uint = v.length;
            var i:uint=0;
            var argc:uint=args.length;
            while (i < argc) 
            {
                v[n] = args[i];
                i++;
                n++;
            }
            v.length = n;
            return n;
        }        

        // Include most of the vector implementation.
        include "VectorImpl.as";

        // Methods with the specific type in their sig.  Can't be in the impl file since it doesn't
        // know what "type" vector this is (int, uint, Number, Object)
        // Most of these just call generic versions in impl, but some small ones are implemented here.
        AS3 function concat(...items) : Vector$double {
            return _concat(items);
        }

        AS3 function filter(checker:Function, thisObj: Object=null): Vector$double {
            return _filter(checker, thisObj);
        }

        AS3 native function pop(): Number ;

        AS3 function reverse() : Vector$double {
            this._reverse();
            return this;
        }

        AS3 native function shift():Number;

        AS3 function slice(start:Number=0, end:Number=0x7fffffff): Vector$double {
            return this._slice(start, end);
        }

        AS3 function sort(comparefn): Vector$double {
            var a : Array = [comparefn];
            _sort(this, a);
            return this;
        }
        AS3 function splice(start: Number, deleteCount: Number, ...items): Vector$double {
            return this._splice(start, deleteCount, items);
        }

        AS3 function indexOf(value:Number, from:Number=0): Number {
            var start:uint = clamp( from, length );
            for ( var i:uint=start, limit:uint=length ; i < limit ; i++ )
                if (this[i] === value)
                    return i;
            return -1;
        }

        AS3 function lastIndexOf(value:Number, from: Number=0x7fffffff): Number {
            var start:uint = clamp( from, length );
            if( start == length )
                --start;
            for ( var i:int=start ; i >= 0 ; i-- ) {
                if (this[i] === value)
                    return i;
            }
            return -1;
        }
    }

    [native(cls="FloatVectorClass", gc="exact", instance="FloatVectorObject", methods="auto", construct="override")]
    [API(CONFIG::SWF_16)]
    CONFIG::VMCFG_FLOAT
    dynamic final class Vector$float
    {
        // Dummy constructor -- actual code is in construct()
        public function Vector$float(length:uint=0, fixed:Boolean=false)
        {
        }

        // Private helper methods.  These allow most of the implementation to be abstracted into
        // a file that is included from the implementation of the different Vector types.
        private static function castToThisType(item) : Vector$float {
            return item;
        }

        private native function newThisType() : Vector$float;

        // Bugzilla 573452, Type-specialized Vector methods: specialize Push.
        //
        // NOTE SIX ALMOST-DUPLICATED COPIES OF THIS FUNCTION IN THE FILE.

        prototype.push = function (...args)  // rest args are efficient
        {
            // Type check - Vector methods are not generic.
            castToThisType(this);

            // making it type specialized, otherwise compiler treats 'this' as untyped
            var v:Vector$float = this;

            // FP 10.1 throws this error specifically, the setting of the element in the
            // loop below will generate error 1125 instead.
            if (v.fixed)
                Error.throwError(RangeError, 1126);

            // The loop is correct because Tamarin (as of June 2010) has a 4GB object limit.
            // Thus at most 1G elements can be accommodated in a Vector, and the index never
            // wraps around.
            var n:uint = v.length;
            var i:uint=0;
            var argc:uint=args.length;
            while (i < argc) 
            {
                v[n] = args[i];
                i++;
                n++;
            }
            v.length = n;
            return n;
        }        

        // Include most of the vector implementation.
        include "VectorImpl.as";

        // Methods with the specific type in their sig.  Can't be in the impl file since it doesn't
        // know what "type" vector this is (int, uint, Number, Object)
        // Most of these just call generic versions in impl, but some small ones are implemented here.
        AS3 function concat(...items) : Vector$float {
            return _concat(items);
        }

        AS3 function filter(checker:Function, thisObj: Object=null): Vector$float {
            return _filter(checker, thisObj);
        }

        AS3 native function pop(): float ;

        AS3 function reverse() : Vector$float {
            this._reverse();
            return this;
        }

        AS3 native function shift():float;

        AS3 function slice(start:int=0, end:int=0x7fffffff): Vector$float {
            return this._slice(start, end);
        }

        AS3 function sort(comparefn): Vector$float {
            var a : Array = [comparefn];
            _sort(this, a);
            return this;
        }
        AS3 function splice(start: int, deleteCount: uint, ...items): Vector$float {
            return this._splice(start, deleteCount, items);
        }

        AS3 function indexOf(value:float, from:int=0): Number {
            var start:uint = clamp( from, length );
            for ( var i:uint=start, limit:uint=length ; i < limit ; i++ )
                if (this[i] === value)
                    return i;
            return -1;
        }

        AS3 function lastIndexOf(value:float, from: int=0x7fffffff): Number {
            var start:uint = clamp( from, length );
            if( start == length )
                --start;
            for ( var i:int=start ; i >= 0 ; i-- ) {
                if (this[i] === value)
                    return i;
            }
            return -1;
        }
    }

    [native(cls="Float4VectorClass", gc="exact", instance="Float4VectorObject", methods="auto", construct="override")]
    [API(CONFIG::SWF_16)]
    CONFIG::VMCFG_FLOAT
    dynamic final class Vector$float4
    {
        // Dummy constructor -- actual code is in construct()
        public function Vector$float4(length:uint=0, fixed:Boolean=false)
        {
        }

        // Private helper methods.  These allow most of the implementation to be abstracted into
        // a file that is included from the implementation of the different Vector types.
        private static function castToThisType(item) : Vector$float4 {
            return item;
        }

        private native function newThisType() : Vector$float4;

        // Bugzilla 573452, Type-specialized Vector methods: specialize Push.
        //
        // NOTE SIX ALMOST-DUPLICATED COPIES OF THIS FUNCTION IN THE FILE.

        prototype.push = function (...args)  // rest args are efficient
        {
            // Type check - Vector methods are not generic.
            castToThisType(this);

            // making it type specialized, otherwise compiler treats 'this' as untyped
            var v:Vector$float4 = this;

            // FP 10.1 throws this error specifically, the setting of the element in the
            // loop below will generate error 1125 instead.
            if (v.fixed)
                Error.throwError(RangeError, 1126);

            // The loop is correct because Tamarin (as of June 2010) has a 4GB object limit.
            // Thus at most 1G elements can be accommodated in a Vector, and the index never
            // wraps around.
            var n:uint = v.length;
            var i:uint=0;
            var argc:uint=args.length;
            while (i < argc) 
            {
                v[n] = args[i];
                i++;
                n++;
            }
            v.length = n;
            return n;
        }        

        // Include most of the vector implementation.
        include "VectorImpl.as";

        // Methods with the specific type in their sig.  Can't be in the impl file since it doesn't
        // know what "type" vector this is (int, uint, Number, Object)
        // Most of these just call generic versions in impl, but some small ones are implemented here.
        AS3 function concat(...items) : Vector$float4 {
            return _concat(items);
        }

        AS3 function filter(checker:Function, thisObj: Object=null): Vector$float4 {
            return _filter(checker, thisObj);
        }

        AS3 native function pop(): float4 ;

        AS3 function reverse() : Vector$float4 {
            this._reverse();
            return this;
        }

        AS3 native function shift():float4;

        AS3 function slice(start:int=0, end:int=0x7fffffff): Vector$float4 {
            return this._slice(start, end);
        }

        AS3 function sort(comparefn): Vector$float4 {
            var a : Array = [comparefn];
            _sort(this, a);
            return this;
        }
        AS3 function splice(start: int, deleteCount: uint, ...items): Vector$float4 {
            return this._splice(start, deleteCount, items);
        }

        AS3 function indexOf(value:float4, from:int=0): Number {
            var start:uint = clamp( from, length );
            for ( var i:uint=start, limit:uint=length ; i < limit ; i++ )
                if (this[i] === value)
                    return i;
            return -1;
        }

        AS3 function lastIndexOf(value:float4, from: int=0x7fffffff): Number {
            var start:uint = clamp( from, length );
            if( start == length )
                --start;
            for ( var i:int=start ; i >= 0 ; i-- ) {
                if (this[i] === value)
                    return i;
            }
            return -1;
        }
    }
}
