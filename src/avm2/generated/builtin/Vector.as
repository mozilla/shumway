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

  [native(cls="VectorClass")]
  dynamic final public class Vector
  {
  }

  [native(cls="ObjectVectorClass")]
  dynamic final class Vector$object
  {
    public native function Vector$object(length:uint=0, fixed:Boolean=false);

    public native function get length():uint;
    public native function set length(value:uint);

    public native function set fixed(f:Boolean);
    public native function get fixed():Boolean;

    native AS3 function toString() : String;

    native AS3 function toLocaleString() : String;

    native AS3 function join(separator: String=","): String;

    native AS3 function every(checker:Function, thisObj: Object=null): Boolean;

    native AS3 function forEach(eacher:Function, thisObj: Object=null): void;

    native AS3 function map(mapper:Function, thisObj:Object=null);

    AS3 native function push(...items:Array): uint;

    native AS3 function some(checker, thisObj: Object=null): Boolean;

    // Methods with the specific type in their sig.  Can't be in the impl file since it doesn't
    // know what "type" vector this is (int, uint, Number, Object)
    // Most of these just call generic versions in impl, but some small ones are implemented here.
    AS3 native function concat(...items) : Vector$object;

    AS3 native function filter(checker : Function, thisObj: Object=null): Vector$object;

    AS3 native function pop();

    AS3 native function reverse() : Vector$object;

    AS3 native function shift():*;

    AS3 native function slice(start:Number=0, end:Number=0x7fffffff): Vector$object;

    AS3 native function sort(sortBehavior: *): Vector$object;
    AS3 native function splice(start: Number, deleteCount: Number, ...items): Vector$object;

    AS3 native function indexOf(value:Object, from:Number=0): Number;

    AS3 native function lastIndexOf(value:Object, from: Number=0x7fffffff): Number;

    AS3 native function unshift();

  }

  [native(cls="IntVectorClass")]
  dynamic final class Vector$int
  {
    public native function Vector$int(length:uint=0, fixed:Boolean=false);

    public native function get length():uint;
    public native function set length(value:uint);

    public native function set fixed(f:Boolean);
    public native function get fixed():Boolean;

    native AS3 function toString() : String;

    native AS3 function toLocaleString() : String;

    native AS3 function join(separator: String=","): String;

    native AS3 function every(checker:Function, thisObj: Object=null): Boolean;

    native AS3 function forEach(eacher:Function, thisObj: Object=null): void;

    native AS3 function map(mapper:Function, thisObj:Object=null);

    AS3 native function push(...items:Array): uint;

    native AS3 function some(checker, thisObj: Object=null): Boolean;

    // Methods with the specific type in their sig.  Can't be in the impl file since it doesn't
    // know what "type" vector this is (int, uint, Number, Object)
    // Most of these just call generic versions in impl, but some small ones are implemented here.
    AS3 native function concat(...items) : Vector$int;

    native AS3 function filter(checker:Function, thisObj: Object=null): Vector$int;

    AS3 native function pop(): int ;

    AS3 native function reverse() : Vector$int;
    AS3 native function shift():int;

    AS3 native function slice(start:Number=0, end:Number=0x7fffffff): Vector$int;

    AS3 native function sort(sortBehavior: *): Vector$int;

    AS3 native function splice(start: Number, deleteCount: Number, ...items): Vector$int;

    AS3 native function indexOf(value:int, from:Number=0): Number;

    AS3 native function lastIndexOf(value:int, from: Number=0x7fffffff): Number;

    AS3 native function unshift();

  }


  [native(cls="UIntVectorClass")]
  dynamic final class Vector$uint
  {
    public native function Vector$uint(length:uint=0, fixed:Boolean=false);

    public native function get length():uint;
    public native function set length(value:uint);

    public native function set fixed(f:Boolean);
    public native function get fixed():Boolean;

    native AS3 function toString() : String;

    native AS3 function toLocaleString() : String;

    native AS3 function join(separator: String=","): String;

    native AS3 function every(checker:Function, thisObj: Object=null): Boolean;

    native AS3 function forEach(eacher:Function, thisObj: Object=null): void;

    native AS3 function map(mapper:Function, thisObj:Object=null);

    AS3 native function push(...items:Array): uint;

    native AS3 function some(checker, thisObj: Object=null): Boolean;

    // Methods with the specific type in their sig.  Can't be in the impl file since it doesn't
    // know what "type" vector this is (int, uint, Number, Object)
    // Most of these just call generic versions in impl, but some small ones are implemented here.
    AS3 native function concat(...items) : Vector$uint;

    native AS3 function filter(checker:Function, thisObj: Object=null): Vector$uint;

    AS3 native function pop(): uint ;

    AS3 native function reverse() : Vector$uint;

    AS3 native function shift():uint;

    AS3 native function slice(start:Number=0, end:Number=0x7fffffff): Vector$uint;

    AS3 native function sort(sortBehavior: *): Vector$uint;

    AS3 native function splice(start: Number, deleteCount: Number, ...items): Vector$uint;

    AS3 native function indexOf(value:uint, from:Number=0): Number;

    AS3 native function lastIndexOf(value:uint, from: Number=0x7fffffff): Number;

    AS3 native function unshift();

  }

  [native(cls="DoubleVectorClass")]
  dynamic final class Vector$double
  {
    public native function Vector$double(length:uint=0, fixed:Boolean=false);

    public native function get length():uint;
    public native function set length(value:uint);

    public native function set fixed(f:Boolean);
    public native function get fixed():Boolean;

    native AS3 function toString() : String;

    native AS3 function toLocaleString() : String;

    native AS3 function join(separator: String=","): String;

    native AS3 function every(checker:Function, thisObj: Object=null): Boolean;

    native AS3 function forEach(eacher:Function, thisObj: Object=null): void;

    native AS3 function map(mapper:Function, thisObj:Object=null);

    AS3 native function push(...items:Array): uint;

    native AS3 function some(checker, thisObj: Object=null): Boolean;

    // Methods with the specific type in their sig.  Can't be in the impl file since it doesn't
    // know what "type" vector this is (int, uint, Number, Object)
    // Most of these just call generic versions in impl, but some small ones are implemented here.
    AS3 native function concat(...items) : Vector$double;

    native AS3 function filter(checker:Function, thisObj: Object=null): Vector$double;

    AS3 native function pop(): Number ;

    AS3 native function reverse() : Vector$double;

    AS3 native function shift():Number;

    AS3 native function slice(start:Number=0, end:Number=0x7fffffff): Vector$double;

    AS3 native function sort(sortBehavior: *): Vector$double;

    AS3 native function splice(start: Number, deleteCount: Number, ...items): Vector$double

    AS3 native function indexOf(value:Number, from:Number=0): Number;

    AS3 native function lastIndexOf(value:Number, from: Number=0x7fffffff): Number;

    AS3 native function unshift();
  }

}
