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
  [native(cls="DateClass")]
  public dynamic class Date
  {
    // Date.length = 7 per ES3
    // E262 {ReadOnly, DontDelete, DontEnum }
    public static const length:int = 7;

    public native static function parse(s):Number;
    public native static function UTC(year, month, date=1, hours=0, minutes=0, seconds=0, ms=0, ... rest):Number;

    AS3 native function valueOf():Number;

    [compat]
    private native function _toString(index:int):String;
    [compat]
    private native function _setTime(value:Number):Number;
    [compat]
    private native function _get(index:int):Number;

    AS3 native function setTime(t=void 0):Number;

    prototype.setTime = unsafeJSNative("Date.prototype.setTime");
    prototype.valueOf = unsafeJSNative("Date.prototype.valueOf");

    AS3 native function toString():String;
    AS3 native function toDateString():String;
    AS3 native function toTimeString():String;
    AS3 native function toLocaleString():String;
    AS3 native function toLocaleDateString():String;
    AS3 native function toLocaleTimeString():String;
    AS3 native function toUTCString():String;

    AS3 native function getUTCFullYear():Number;
    AS3 native function getUTCMonth():Number;
    AS3 native function getUTCDate():Number;
    AS3 native function getUTCDay():Number;
    AS3 native function getUTCHours():Number;
    AS3 native function getUTCMinutes():Number;
    AS3 native function getUTCSeconds():Number;
    AS3 native function getUTCMilliseconds():Number;
    AS3 native function getFullYear():Number;
    AS3 native function getMonth():Number;
    AS3 native function getDate():Number;
    AS3 native function getDay():Number;
    AS3 native function getHours():Number;
    AS3 native function getMinutes():Number;
    AS3 native function getSeconds():Number;
    AS3 native function getMilliseconds():Number;
    AS3 native function getTimezoneOffset():Number;
    AS3 native function getTime():Number;

    [compat]
    private native function _setFullYear(...rest):Number;
    [compat]
    private native function _setMonth(...rest):Number;
    [compat]
    private native function _setDate(...rest):Number;
    [compat]
    private native function _setHours(...rest):Number;
    [compat]
    private native function _setMinutes(...rest):Number;
    [compat]
    private native function _setSeconds(...rest):Number;
    [compat]
    private native function _setMilliseconds(...rest):Number;

    [compat]
    private native function _setUTCFullYear(...rest0):Number;
    [compat]
    private native function _setUTCMonth(...rest):Number;
    [compat]
    private native function _setUTCDate(...rest):Number;
    [compat]
    private native function _setUTCHours(...rest):Number;
    [compat]
    private native function _setUTCMinutes(...rest):Number;
    [compat]
    private native function _setUTCSeconds(...rest):Number;
    [compat]
    private native function _setUTCMilliseconds(...rest):Number;

    AS3 native function setFullYear(year=void 0, month=void 0, date=void 0):Number;
    AS3 native function setMonth(month=void 0, date=void 0):Number;
    AS3 native function setDate(date=void 0):Number;
    AS3 native function setHours(hour=void 0, min=void 0, sec=void 0, ms=void 0):Number;
    AS3 native function setMinutes(min=void 0, sec=void 0, ms=void 0):Number;
    AS3 native function setSeconds(sec=void 0, ms=void 0):Number;
    AS3 native function setMilliseconds(ms=void 0):Number;
    AS3 native function setUTCFullYear(year=void 0, month=void 0, date=void 0):Number;
    AS3 native function setUTCMonth(month=void 0, date=void 0):Number;
    AS3 native function setUTCDate(date=void 0):Number;
    AS3 native function setUTCHours(hour=void 0, min=void 0, sec=void 0, ms=void 0):Number;
    AS3 native function setUTCMinutes(min=void 0, sec=void 0, ms=void 0):Number;
    AS3 native function setUTCSeconds(sec=void 0, ms=void 0):Number;
    AS3 native function setUTCMilliseconds(ms=void 0):Number;

    prototype.toString = unsafeJSNative("Date.prototype.toString");
    prototype.toDateString = unsafeJSNative("Date.prototype.toDateString");
    prototype.toTimeString = unsafeJSNative("Date.prototype.toTimeString");
    prototype.toLocaleString = unsafeJSNative("Date.prototype.toLocaleString");
    prototype.toLocaleDateString = unsafeJSNative("Date.prototype.toLocaleDateString");
    prototype.toLocaleTimeString = unsafeJSNative("Date.prototype.toLocaleTimeString");
    prototype.toUTCString = unsafeJSNative("Date.prototype.toUTCString");
    // NB: The default AS implementation of |toJSON| is not ES5-compliant, but
    // the native JS one obviously is.
    prototype.toJSON = unsafeJSNative("Date.prototype.toJSON");
    prototype.getUTCFullYear = unsafeJSNative("Date.prototype.getUTCFullYear");
    prototype.getUTCMonth = unsafeJSNative("Date.prototype.getUTCMonth");
    prototype.getUTCDate = unsafeJSNative("Date.prototype.getUTCDate");
    prototype.getUTCDay = unsafeJSNative("Date.prototype.getUTCDay");
    prototype.getUTCHours = unsafeJSNative("Date.prototype.getUTCHours");
    prototype.getUTCMinutes = unsafeJSNative("Date.prototype.getUTCMinutes");
    prototype.getUTCSeconds = unsafeJSNative("Date.prototype.getUTCSeconds");
    prototype.getUTCMilliseconds = unsafeJSNative("Date.prototype.getUTCMilliseconds");
    prototype.getFullYear = unsafeJSNative("Date.prototype.getFullYear");
    prototype.getMonth = unsafeJSNative("Date.prototype.getMonth");
    prototype.getDate = unsafeJSNative("Date.prototype.getDate");
    prototype.getDay = unsafeJSNative("Date.prototype.getDay");
    prototype.getHours = unsafeJSNative("Date.prototype.getHours");
    prototype.getMinutes = unsafeJSNative("Date.prototype.getMinutes");
    prototype.getSeconds = unsafeJSNative("Date.prototype.getSeconds");
    prototype.getMilliseconds = unsafeJSNative("Date.prototype.getMilliseconds");
    prototype.getTimezoneOffset = unsafeJSNative("Date.prototype.getTimezoneOffset");
    prototype.getTime = unsafeJSNative("Date.prototype.getTime");
    prototype.setFullYear = unsafeJSNative("Date.prototype.setFullYear");
    prototype.setMonth = unsafeJSNative("Date.prototype.setMonth");
    prototype.setDate = unsafeJSNative("Date.prototype.setDate");
    prototype.setHours = unsafeJSNative("Date.prototype.setHours");
    prototype.setMinutes = unsafeJSNative("Date.prototype.setMinutes");
    prototype.setSeconds = unsafeJSNative("Date.prototype.setSeconds");
    prototype.setMilliseconds = unsafeJSNative("Date.prototype.setMilliseconds");
    prototype.setUTCFullYear = unsafeJSNative("Date.prototype.setUTCFullYear");
    prototype.setUTCMonth = unsafeJSNative("Date.prototype.setUTCMonth");
    prototype.setUTCDate = unsafeJSNative("Date.prototype.setUTCDate");
    prototype.setUTCHours = unsafeJSNative("Date.prototype.setUTCHours");
    prototype.setUTCMinutes = unsafeJSNative("Date.prototype.setUTCMinutes");
    prototype.setUTCSeconds = unsafeJSNative("Date.prototype.setUTCSeconds");
    prototype.setUTCMilliseconds = unsafeJSNative("Date.prototype.setUTCMilliseconds");

    public function get fullYear():Number { return AS3::getFullYear(); }
    public function set fullYear(value:Number) { AS3::setFullYear(value); }

    public function get month():Number { return AS3::getMonth(); }
    public function set month(value:Number) { AS3::setMonth(value); }

    public function get date():Number { return AS3::getDate(); }
    public function set date(value:Number) { AS3::setDate(value); }

    public function get hours():Number { return AS3::getHours(); }
    public function set hours(value:Number) { AS3::setHours(value); }

    public function get minutes():Number { return AS3::getMinutes(); }
    public function set minutes(value:Number) { AS3::setMinutes(value); }

    public function get seconds():Number { return AS3::getSeconds(); }
    public function set seconds(value:Number) { AS3::setSeconds(value); }

    public function get milliseconds():Number { return AS3::getMilliseconds(); }
    public function set milliseconds(value:Number) { AS3::setMilliseconds(value); }

    public function get fullYearUTC():Number { return AS3::getUTCFullYear(); }
    public function set fullYearUTC(value:Number) { AS3::setUTCFullYear(value); }

    public function get monthUTC():Number { return AS3::getUTCMonth(); }
    public function set monthUTC(value:Number) { AS3::setUTCMonth(value); }

    public function get dateUTC():Number { return AS3::getUTCDate(); }
    public function set dateUTC(value:Number) { AS3::setUTCDate(value); }

    public function get hoursUTC():Number { return AS3::getUTCHours(); }
    public function set hoursUTC(value:Number) { AS3::setUTCHours(value); }

    public function get minutesUTC():Number { return AS3::getUTCMinutes(); }
    public function set minutesUTC(value:Number) { AS3::setUTCMinutes(value); }

    public function get secondsUTC():Number { return AS3::getUTCSeconds(); }
    public function set secondsUTC(value:Number) { AS3::setUTCSeconds(value); }

    public function get millisecondsUTC():Number { return AS3::getUTCMilliseconds(); }
    public function set millisecondsUTC(value:Number) { AS3::setUTCMilliseconds(value); }

    public function get time():Number { return AS3::getTime(); }
    public function set time(value:Number) { AS3::setTime(value); }

    public function get timezoneOffset():Number { return AS3::getTimezoneOffset(); }
    public function get day():Number { return AS3::getDay(); }
    public function get dayUTC():Number { return AS3::getUTCDay(); }


    // Dummy constructor
    public function Date(year = void 0, month = void 0, date = void 0, hours = void 0, minutes = void 0, seconds = void 0, ms = void 0) {}

    _dontEnumPrototype(prototype);
  }
}
