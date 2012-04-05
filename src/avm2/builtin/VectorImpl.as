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

// This file is the implementation of the common vector methods for each of the different vector classes.
// It is included in the body of the class of each of the different vector types.

public native function get length():uint;
public native function set length(value:uint);

public native function set fixed(f:Boolean);
public native function get fixed():Boolean;

AS3 function toString() : String {
    return this.AS3::join();
}

AS3 function toLocaleString() : String {
    var limit:uint = length;
    var separator:String = ",";
    var s:String = "";
    var i:uint = 0;

    if( limit > 0 ) {
        while (true) {
            var x = this[i];
            if (x !== undefined && x !== null)
                s += x.public::toLocaleString();
            if (++i == limit)
                break;
            s += separator;
        }
    }
    return s;
}

AS3 function join(separator: String=","): String {
    var limit:uint = length;
    var s:String = "";
    var i:int = 0;
    if( limit > 0 ) {
        while (true) {
            var y:uint=i;
            s += this[y];
            y = ++i;
            if (y == limit)
                break;
            s += separator;
        }
    }
    return s;
}

private function _concat(items:Array) {
    var v  = newThisType();
    v.private::_spliceHelper(0, length, 0, this, 0);
    const bug504525:Boolean = bugzilla(504525);
    for ( var j:uint=0, limit=items.length ; j < limit ; j++ ) {
        var item = castToThisType(items[j]);
        const insertPoint:uint = bug504525 ? v.length : length;
        v.private::_spliceHelper(insertPoint, item.length, 0, item, 0);
    }

    return v;
}

AS3 function every(checker:Function, thisObj: Object=null): Boolean {
    return _every(this, checker, thisObj is Object ? thisObj : null);
}

AS3 function forEach(eacher:Function, thisObj: Object=null): void {
    _forEach(this, eacher, (thisObj is Object ? thisObj : null));
}

AS3 function map(mapper:Function, thisObj:Object=null) {
    var result = this.private::_map(mapper, thisObj is Object ? thisObj : null);
    return bugzilla(574600) ? result : undefined;
}

AS3 native function push(...items:Array): uint;

private native function _reverse() : void;

AS3 function some(checker, thisObj: Object=null): Boolean {
    return _some(this, checker, thisObj is Object ? thisObj : null);
}

private function _slice(start: Number=0, end: Number=0x7fffffff) {
    var first:uint = clamp( start, length );
    var limit:uint = clamp( end, length );
    if (limit < first)
        limit = first;
    var result = newThisType();
    result.private::_spliceHelper(0, limit-first, 0, this, first);

    return result;
}

private function _splice(start, deleteCount, items : Array) {
    var first:uint  = clamp( start, length );
    var delcnt:uint = clamp( deleteCount, length-first );

    var result = newThisType();
    result.private::_spliceHelper(0, delcnt, 0, this, first);

    _spliceHelper(first, items.length, delcnt, items, 0);

    return result;
}

// First delete deleteCount entries, starting at insertpoint.
// Then insert insertcount entries starting at insertpoint;
// the insertcount entries are read from args object, starting at offset.
private native function _spliceHelper(insertpoint:uint, insertcount:uint, deleteCount:uint, args:Object, offset:uint):void;

AS3 native function unshift(...items) : uint;

// Prototype Methods
prototype.toString = function() {
    return castToThisType(this).AS3::toString();
}

prototype.toLocaleString = function() {
    return castToThisType(this).AS3::toLocaleString();
}

prototype.join = function(separator=void 0) {
    return castToThisType(this).AS3::join(separator == undefined ? "," : String(separator));
}

prototype.concat = function(...items) {
    return castToThisType(this)._concat(items);
}
private static native function _every(o, callback:Function, thisObject):Boolean;
prototype.every = function(checker, thisObj=void 0) : Boolean {
    return _every(castToThisType(this), checker, thisObj is Object ? thisObj : null);
}

private native function _filter(callback:Function, thisObject):*;
prototype.filter = function(checker, thisObj=void 0) {
    return castToThisType(this).private::_filter(checker, thisObj is Object ? thisObj : null);
}

private static native function _forEach(o, callback:Function, thisObject):void;
prototype.forEach = function(eacher, thisObj=void 0) {
    _forEach(castToThisType(this), eacher, (thisObj is Object ? thisObj : null));
}

prototype.indexOf = function(value, from=void 0) {
    return castToThisType(this).AS3::indexOf(value, Number(from));
}

prototype.lastIndexOf = function (value, from=void 0) {
    return castToThisType(this).AS3::lastIndexOf(value, from == undefined ? Infinity : Number(from));
}

private native function _map(callback:Function, thisObject):*;
prototype.map = function(mapper, thisObj=void 0) {
    return castToThisType(this).private::_map(mapper, thisObj is Object ? thisObj : null);
}

prototype.pop = function() {
    return castToThisType(this).AS3::pop();
}

// Bugzilla 573452, Type-specialized Vector methods, moved the prototype.push method to Vector.as
  
prototype.reverse = function() {
    return castToThisType(this).AS3::reverse();
}

prototype.shift = function() {
    return castToThisType(this).AS3::shift();
}

prototype.slice = function(start=void 0, end=void 0){
    return castToThisType(this)._slice(start == undefined ? 0 : Number(start),
                          end == undefined ? 0x7fffffff : Number(end));
}

private static native function _some(o, callback:Function, thisObject):Boolean;
prototype.some = function(checker, thisObj=void 0):Boolean{
    return _some(castToThisType(this), checker, thisObj is Object ? thisObj : null);
}

// Borrow the sort function from array
private static native function _sort(o, args:Array);
prototype.sort = function(comparefn){
    var a : Array = [comparefn];
    return _sort(castToThisType(this), a);
}

prototype.splice = function(start, deleteCount, ...items){
    return castToThisType(this)._splice(Number(start), Number(deleteCount), items);
}

prototype.unshift = function(...items){
    return castToThisType(this).AS3::unshift.AS3::apply(this, items);
}

private function clamp(val: Number, len: uint): uint {
    var result : uint;
    if (val < 0.0)
    {
        if (val + len < 0.0)
            result = 0;
        else
            result = uint(val + len);
    }
    else if (val > len) {
        result = length;
    }
    else if (val != val) {
        result = 0;
    }
    else {
        result = uint(val);
    }
    return result;
}

_dontEnumPrototype(prototype);
