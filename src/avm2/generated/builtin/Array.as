/* -*- c-basic-offset: 4; indent-tabs-mode: nil; tab-width: 4 -*- */
/* vi: set ts=4 sw=4 expandtab: (add to ~/.vimrc: set modeline modelines=5) */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


package
{
[native(cls="ArrayClass")]
public dynamic class Array extends Object
{
  // E262 {DontEnum, DontDelete}
  public native function get length():uint;
  public native function set length(newLength:uint);

  // ECMA 15.4.2.2
  public native function Array(...args);

  /**
   15.4.4.5 Array.prototype.join (separator)
   The elements of the array are converted to strings, and these strings are then concatenated, separated by
   occurrences of the separator. If no separator is provided, a single comma is used as the separator.
   The join method takes one argument, separator, and performs the following steps:
   1. Call the [[Get]] method of this object with argument "length".
   2. Call ToUint32(Result(1)).
   3. If separator is undefined, let separator be the single-character string ",".
   4. Call ToString(separator).
   5. If Result(2) is zero, return the empty string.
   6. Call the [[Get]] method of this object with argument "0".
   7. If Result(6) is undefined or null, use the empty string; otherwise, call ToString(Result(6)).
   8. Let R be Result(7).
   9. Let k be 1.
   10. If k equals Result(2), return R.
   11. Let S be a string value produced by concatenating R and Result(4).
   12. Call the [[Get]] method of this object with argument ToString(k).
   13. If Result(12) is undefined or null, use the empty string; otherwise, call ToString(Result(12)).
   14. Let R be a string value produced by concatenating S and Result(13).
   15. Increase k by 1.
   16. Go to step 10.
   */

  native AS3 function join(sep=void 0):String;

  AS3 native function pop();

  /**
   When the push method is called with zero or more arguments item1, item2, etc., the following steps are taken:
   1. Call the [[Get]] method of this object with argument "length".
   2. Let n be the result of calling ToUint32(Result(1)).
   3. Get the next argument in the argument list; if there are no more arguments, go to step 7.
   4. Call the [[Put]] method of this object with arguments ToString(n) and Result(3).
   5. Increase n by 1.
   6. Go to step 3.
   7. Call the [[Put]] method of this object with arguments "length" and n.
   8. Return n.
   The length property of the push method is 1.
   NOTE The push function is intentionally generic; it does not require that its this value be an Array object. Therefore it can be
   transferred to other kinds of objects for use as a method. Whether the push function can be applied successfully to a host object
   is implementation-dependent.
   */
  AS3 native function push(...args):uint

  native AS3 function reverse():Array;

  native AS3 function concat(...args):Array;

  native AS3 function shift();

  native AS3 function slice(A=0, B=0xffffffff):Array;

  /**
   15.4.4.13 Array.prototype.unshift ( [ item1 [ , item2 [ , ... ] ] ] )
   The arguments are prepended to the start of the array, such that their order within the array is the same as the
   order in which they appear in the argument list.
   When the unshift method is called with zero or more arguments item1, item2, etc., the following steps are taken:
   1. Call the [[Get]] method of this object with argument "length".
   2. Call ToUint32(Result(1)).
   3. Compute the number of arguments.
   4. Let k be Result(2).
   5. If k is zero, go to step 15.
   6. Call ToString(k-1).
   7. Call ToString(k+Result(3)-1).
   8. If this object has a property named by Result(6), go to step 9; but if this object has no property named by
   Result(6), then go to step 12.
   9. Call the [[Get]] method of this object with argument Result(6).
   10. Call the [[Put]] method of this object with arguments Result(7) and Result(9).
   11. Go to step 13.
   12. Call the [[Delete]] method of this object with argument Result(7).
   13. Decrease k by 1.
   14. Go to step 5.
   15. Let k be 0.
   16. Get the next argument in the part of the argument list that starts with item1; if there are no more arguments, go
   to step 21.
   17. Call ToString(k).
   18. Call the [[Put]] method of this object with arguments Result(17) and Result(16).
   19. Increase k by 1.
   20. Go to step 16.
   21. Call the [[Put]] method of this object with arguments "length" and (Result(2)+Result(3)).
   22. Return (Result(2)+Result(3)).
   The length property of the unshift method is 1.
   NOTE The unshift function is intentionally generic; it does not require that its this value be an Array object. Therefore it can
   be transferred to other kinds of objects for use as a method. Whether the unshift function can be applied successfully to a
   host object is implementation-dependent.
   */
  native AS3 function unshift(...args):uint;

  // splice with zero args returns undefined. All other cases return Array.
  native AS3 function splice(...args): Array;

  // sort can return an Array or a Number (unique sort option)
  native AS3 function sort(...args);

  native AS3 function sortOn(names, options=0, ...ignored);

  // Array extensions that are in Mozilla...
  // http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array
  //
  // These all work on generic objects (array like objects) as well as arrays

  native AS3 function indexOf(searchElement, fromIndex=0):int;
  native AS3 function lastIndexOf(searchElement, fromIndex=0x7fffffff):int;

  // Returns true if every element in this array satisfies the provided testing function.
  native AS3 function every(callback:Function, thisObject=null):Boolean;

  // Creates a new array with all elements that pass the test implemented by the provided function.
  native AS3 function filter(callback:Function, thisObject=null):Array;

  // Calls a function for each element in the array.
  native AS3 function forEach(callback:Function, thisObject=null):void;

  // Creates a new array with the results of calling a provided function on every element in this array.
  native AS3 function map(callback:Function, thisObject=null):Array;

  // Returns true if at least one element in this array satisfies the provided testing function.
  native AS3 function some(callback:Function, thisObject=null):Boolean;
}
}
