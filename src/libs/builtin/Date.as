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
    public native static function parse(s):Number;
    public native static function UTC(year, month, date=1, hours=0, minutes=0, seconds=0, ms=0, ... rest):Number;

    AS3 native function valueOf():Number;
    AS3 native function setTime(t=void 0):Number;

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

    public native function get fullYear():Number;
    public native function set fullYear(value:Number);

    public native function get month():Number;
    public native function set month(value:Number);

    public native function get date():Number;
    public native function set date(value:Number);

    public native function get hours():Number;
    public native function set hours(value:Number);

    public native function get minutes():Number;
    public native function set minutes(value:Number);

    public native function get seconds():Number;
    public native function set seconds(value:Number);

    public native function get milliseconds():Number;
    public native function set milliseconds(value:Number);

    public native function get fullYearUTC():Number;
    public native function set fullYearUTC(value:Number);

    public native function get monthUTC():Number;
    public native function set monthUTC(value:Number);

    public native function get dateUTC():Number;
    public native function set dateUTC(value:Number);

    public native function get hoursUTC():Number;
    public native function set hoursUTC(value:Number);

    public native function get minutesUTC():Number;
    public native function set minutesUTC(value:Number);

    public native function get secondsUTC():Number;
    public native function set secondsUTC(value:Number);

    public native function get millisecondsUTC():Number;
    public native function set millisecondsUTC(value:Number);

    public native function get time():Number;
    public native function set time(value:Number);

    public native function get timezoneOffset():Number;
    public native function get day():Number;
    public native function get dayUTC():Number;

    public native function Date(year = void 0, month = void 0, date = void 0, hours = void 0, minutes = void 0, seconds = void 0, ms = void 0);
  }
}
