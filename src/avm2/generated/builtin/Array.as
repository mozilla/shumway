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
  [native(cls="ArrayClass")]
  public dynamic class Array extends Object
  {
    // option flags for sort and sortOn
    public static const CASEINSENSITIVE:uint = 1;
    public static const DESCENDING:uint = 2;
    public static const UNIQUESORT:uint = 4;
    public static const RETURNINDEXEDARRAY:uint = 8;
    public static const NUMERIC:uint = 16;

    // E262 {DontEnum, DontDelete}
    public native function get length():uint;
    public native function set length(newLength:uint);

    [compat]
    private function set_length(newLength:*, altLength:uint) {}

    // Array.length = 1 per ES3
    public static const length:int = 1;

    // Dummy constructor
    public function Array(...args) {}

    [compat]
    private static native function _join(o, sep):String;
    AS3 native function join(sep=void 0):String;
    prototype.join = unsafeJSNative("Array.prototype.join");

    [compat]
    private static native function _pop(o);
    AS3 native function pop();
    prototype.pop = unsafeJSNative("Array.prototype.pop");

    prototype.toString = unsafeJSNative("Array.prototype.toString");
    prototype.toLocaleString = unsafeJSNative("Array.prototype.toLocaleString");

    AS3 native function push(...args):uint;
    prototype.push = unsafeJSNative("Array.prototype.push");

    [compat]
    private static native function _reverse(o);
    AS3 native function reverse():Array;
    prototype.reverse = unsafeJSNative("Array.prototype.reverse");

    [compat]
    private static native function _concat(o, args:Array):Array;
    AS3 native function concat(...args):Array;
    prototype.concat = unsafeJSNative("Array.prototype.concat");

    [compat]
    private static native function _shift(o);
    AS3 native function shift();
    prototype.shift = unsafeJSNative("Array.prototype.shift");

    [compat]
    private static native function _slice(o, A:Number, B:Number):Array;
    AS3 native function slice(A=0, B=0xffffffff):Array;
    prototype.slice = unsafeJSNative("Array.prototype.slice");

    [compat]
    private static native function _unshift(o, args:Array):uint;
    native AS3 function unshift(...args):uint;
    prototype.unshift = unsafeJSNative("Array.prototype.unshift");

    [compat]
    private static native function _splice(o, args:Array):Array;
    AS3 native function splice(...args);
    prototype.splice = unsafeJSNative("Array.prototype.splice");

    // FIXME: What are AS sort and sortOn?
    [compat]
    private static native function _sort(o, args:Array);
    AS3 function sort(...args)
    {
      return _sort (this, args);
    }
    prototype.sort = function(...args)
    {
      return _sort (this, args);
    };

    [compat]
    private static native function _sortOn(o, names, options);
    AS3 function sortOn(names, options=0, ...ignored)
    {
      // this is our own addition so we don't have to make names be optional
      return _sortOn(this, names, options);
    }
    prototype.sortOn = function(names, options=0, ...ignored)
    {
      return _sortOn(this, names, options)
    };

    [compat]
    private static native function _indexOf (o, searchElement, fromIndex:int):int;
    AS3 native function indexOf(searchElement, fromIndex=0):int;
    prototype.indexOf = unsafeJSNative("Array.prototype.indexOf");

    [compat]
    private static native function _lastIndexOf (o, searchElement, fromIndex:int=0):int;
    AS3 native function lastIndexOf(searchElement, fromIndex=0x7fffffff):int;
    prototype.lastIndexOf = unsafeJSNative("Array.prototype.lastIndexOf");

    [compat]
    private static native function _every(o, callback:Function, thisObject):Boolean;
    AS3 native function every(callback:Function, thisObject=null):Boolean;
    prototype.every = unsafeJSNative("Array.prototype.every");

    [compat]
    private static native function _filter(o, callback:Function, thisObject):Array;
    AS3 native function filter(callback:Function, thisObject=null):Array;
    prototype.filter = unsafeJSNative("Array.prototype.filter");

    [compat]
    private static native function _forEach(o, callback:Function, thisObject):void;
    AS3 native function forEach(callback:Function, thisObject=null):void;
    prototype.forEach = unsafeJSNative("Array.prototype.forEach");

    [compat]
    private native static function _map(o, callback:Function, thisObject):Array;
    AS3 native function map(callback:Function, thisObject=null):Array;
    prototype.map = unsafeJSNative("Array.prototype.map");

    [compat]
    private static native function _some(o, callback:Function, thisObject):Boolean;
    AS3 native function some(callback:Function, thisObject=null):Boolean;
    prototype.some = unsafeJSNative("Array.prototype.some");

    _dontEnumPrototype(prototype);
  }
}
