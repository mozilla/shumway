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
  [native(cls="StringClass")]
  public final class String extends Object
  {
    // String.length = 1 per ES3
    // E262 {ReadOnly, DontDelete, DontEnum }
    public static const length:int = 1;

    AS3 native static function fromCharCode(...charcodes):String;
    String.fromCharCode = unsafeJSNative("String.fromCharCode");

    // E262 {DontEnum, DontDelete, ReadOnly}
    public override native function get length():uint;

    [compat]
    private native function _indexOf(s:String, i:int=0):int;
    AS3 native function indexOf(s:String="undefined", i:Number=0):int;
    prototype.indexOf = unsafeJSNative("String.prototype.indexOf");

    [compat]
    private native function _lastIndexOf(s:String, i:int=0x7fffffff):int;
    AS3 native function lastIndexOf(s:String="undefined", i:Number=0x7FFFFFFF):int;
    prototype.lastIndexOf = unsafeJSNative("String.prototype.lastIndexOf");

    AS3 native function charAt(i:Number=0):String;
    prototype.charAt = unsafeJSNative("String.prototype.charAt");

    AS3 native function charCodeAt(i:Number=0):Number;
    prototype.charCodeAt = unsafeJSNative("String.prototype.charCodeAt");

    AS3 native function concat(...args):String;
    prototype.concat = unsafeJSNative("String.prototype.concat");

    AS3 native function localeCompare(other:*=void 0):int;
    prototype.localeCompare = unsafeJSNative("String.prototype.localeCompare");

    [compat]
    private static native function _match(s:String, p):Array;
    AS3 native function match(p=void 0):Array;
    prototype.match = unsafeJSNative("String.prototype.match");

    [compat]
    private static native function _replace(s:String, p, repl):String;
    AS3 native function replace(p=void 0, repl=void 0):String;
    prototype.replace = unsafeJSNative("String.prototype.replace");

    [compat]
    private static native function _search(s:String, p):int;
    AS3 native function search(p=void 0):int;
    prototype.search = unsafeJSNative("String.prototype.search");

    [compat]
    private native function _slice(start:int=0, end:int=0x7fffffff):String;
    AS3 native function slice(start:Number=0, end:Number=0x7fffffff):String;
    prototype.slice = unsafeJSNative("String.prototype.slice");

    [compat]
    private static native function _split(s:String, delim, limit:uint):Array;
    AS3 native function split(delim=void 0, limit=0xffffffff):Array;
    prototype.split = unsafeJSNative("String.prototype.split");

    [compat]
    private native function _substring(start:int=0, end:int=0x7fffffff):String;
    AS3 native function substring(start:Number=0, end:Number=0x7fffffff):String;
    prototype.substring = unsafeJSNative("String.prototype.substring");

    [compat]
    private native function _substr(start:int=0, end:int=0x7fffffff):String;
    AS3 native function substr(start:Number=0, len:Number=0x7fffffff):String;
    prototype.substr = unsafeJSNative("String.prototype.substr");

    AS3 native function toLowerCase():String;
    AS3 native function toLocaleLowerCase():String;
    prototype.toLowerCase = prototype.toLocaleLowerCase = unsafeJSNative("String.prototype.toLowerCase");

    AS3 native function toUpperCase():String;
    AS3 native function toLocaleUpperCase():String;

    prototype.toUpperCase = prototype.toLocaleUpperCase = unsafeJSNative("String.prototype.toUpperCase");

    AS3 native function toString();
    AS3 native function valueOf();

    prototype.toString = unsafeJSNative("String.prototype.toString");
    prototype.valueOf = unsafeJSNative("String.prototype.valueOf");

    // Dummy constructor
    public function String(value = "") {}

    _dontEnumPrototype(prototype);
  }
}
