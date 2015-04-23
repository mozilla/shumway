/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Shumway.AVMX.AS {
  export class ASDate extends ASObject {
    value: Date;

    static classInitializer: any = function() {
      var proto: any = this.dPrototype;
      var asProto: any = ASDate.prototype;
      addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);

      addPrototypeFunctionAlias(proto, '$BgtoDateString', asProto.toDateString);
      addPrototypeFunctionAlias(proto, '$BgtoTimeString', asProto.toTimeString);
      addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.toLocaleString);
      addPrototypeFunctionAlias(proto, '$BgtoLocaleDateString', asProto.toLocaleDateString);
      addPrototypeFunctionAlias(proto, '$BgtoLocaleTimeString', asProto.toLocaleTimeString);
      addPrototypeFunctionAlias(proto, '$BgtoUTCString', asProto.toUTCString);

      // NB: The default AS implementation of |toJSON| is not ES5-compliant, but
      // the native JS one obviously is.
      addPrototypeFunctionAlias(proto, '$BgtoJSON', asProto.toJSON);

      addPrototypeFunctionAlias(proto, '$BggetUTCFullYear', asProto.getUTCFullYear);
      addPrototypeFunctionAlias(proto, '$BggetUTCMonth', asProto.getUTCMonth);
      addPrototypeFunctionAlias(proto, '$BggetUTCDate', asProto.getUTCDate);
      addPrototypeFunctionAlias(proto, '$BggetUTCDay', asProto.getUTCDay);
      addPrototypeFunctionAlias(proto, '$BggetUTCHours', asProto.getUTCHours);
      addPrototypeFunctionAlias(proto, '$BggetUTCMinutes', asProto.getUTCMinutes);
      addPrototypeFunctionAlias(proto, '$BggetUTCSeconds', asProto.getUTCSeconds);
      addPrototypeFunctionAlias(proto, '$BggetUTCMilliseconds', asProto.getUTCMilliseconds);
      addPrototypeFunctionAlias(proto, '$BggetFullYear', asProto.getFullYear);
      addPrototypeFunctionAlias(proto, '$BggetMonth', asProto.getMonth);
      addPrototypeFunctionAlias(proto, '$BggetDate', asProto.getDate);
      addPrototypeFunctionAlias(proto, '$BggetDay', asProto.getDay);
      addPrototypeFunctionAlias(proto, '$BggetHours', asProto.getHours);
      addPrototypeFunctionAlias(proto, '$BggetMinutes', asProto.getMinutes);
      addPrototypeFunctionAlias(proto, '$BggetSeconds', asProto.getSeconds);
      addPrototypeFunctionAlias(proto, '$BggetMilliseconds', asProto.getMilliseconds);
      addPrototypeFunctionAlias(proto, '$BggetTimezoneOffset', asProto.getTimezoneOffset);
      addPrototypeFunctionAlias(proto, '$BggetTime', asProto.getTime);
      addPrototypeFunctionAlias(proto, '$BgsetFullYear', asProto.setFullYear);
      addPrototypeFunctionAlias(proto, '$BgsetMonth', asProto.setMonth);
      addPrototypeFunctionAlias(proto, '$BgsetDate', asProto.setDate);
      addPrototypeFunctionAlias(proto, '$BgsetHours', proto.setHours);
      addPrototypeFunctionAlias(proto, '$BgsetMinutes', asProto.setMinutes);
      addPrototypeFunctionAlias(proto, '$BgsetSeconds', asProto.setSeconds);
      addPrototypeFunctionAlias(proto, '$BgsetMilliseconds', asProto.setMilliseconds);
      addPrototypeFunctionAlias(proto, '$BgsetUTCFullYear', asProto.setUTCFullYear);
      addPrototypeFunctionAlias(proto, '$BgsetUTCMonth', asProto.setUTCMonth);
      addPrototypeFunctionAlias(proto, '$BgsetUTCDate', asProto.setUTCDate);
      addPrototypeFunctionAlias(proto, '$BgsetUTCHours', asProto.setUTCHours);
      addPrototypeFunctionAlias(proto, '$BgsetUTCMinutes', asProto.setUTCMinutes);
      addPrototypeFunctionAlias(proto, '$BgsetUTCSeconds', asProto.setUTCSeconds);
      addPrototypeFunctionAlias(proto, '$BgsetUTCMilliseconds', asProto.setUTCMilliseconds);
    };

    static parse(date: string): number {
      return Date.parse(date);
    }

    static UTC(year: number, month: number, date: number = 1, hour: number = 0, minute: number = 0, second: number = 0, millisecond: number = 0) {
      return Date.parse.apply(null, arguments);
    }

    static axCoerce(value) {
      return this.axConstruct([value]);
    }

    constructor(yearOrTimevalue: any, month: number, date: number = 1, hour: number = 0, minute: number = 0, second: number = 0, millisecond: number = 0) {
      super();
      switch (arguments.length) {
        case  0: this.value = new Date(); break;
        case  1: this.value = new Date(yearOrTimevalue); break;
        case  2: this.value = new Date(yearOrTimevalue, month); break;
        case  3: this.value = new Date(yearOrTimevalue, month, date); break;
        case  4: this.value = new Date(yearOrTimevalue, month, date, hour); break;
        case  5: this.value = new Date(yearOrTimevalue, month, date, hour, minute); break;
        case  6: this.value = new Date(yearOrTimevalue, month, date, hour, minute, second); break;
        default: this.value = new Date(yearOrTimevalue, month, date, hour, minute, second, millisecond); break;
      }
    }

    toString() {
      if (!(this.value instanceof Date)) {
        return 'Invalid Date';
      }
      // JS formats dates differently, so a little surgery is required here:
      // We need to move the year to the end, get rid of the timezone name, and remove leading 0
      // from the day.
      var dateStr = this.value.toString();
      var parts = dateStr.split(' ');
      // Detect invalid dates. Not 100% sure all JS engines always print 'Invalid Date' here,
      // so we just check how many parts the resulting string has, with some margin for error.
      if (parts.length < 4) {
        return 'Invalid Date';
      }
      parts.length = 6; // Get rid of the timezone, which might contain spaces.
      parts.push(parts.splice(3, 1)[0]); // Move Year to the end.
      if (parts[2][0] === '0') {
        parts[2] = parts[2][1];
      }
      return parts.join(' ');
    }
    toDateString()
    {
      if (!(this.value instanceof Date)) {
        return 'Invalid Date';
      }
      var dateStr = this.value.toDateString();
      var parts = dateStr.split(' ');
      // Detect invalid dates. Not 100% sure all JS engines always print 'Invalid Date' here,
      // so we just check how many parts the resulting string has, with some margin for error.
      if (parts.length < 4) {
        return 'Invalid Date';
      }
      if (parts[2][0] === '0') {
        parts[2] = parts[2][1];
      }
      return parts.join(' ');
    }
    toJSON()                { return !(this.value instanceof Date) ? 'Invalid Date' : this.value.toString(); }
    valueOf()               { return !(this.value instanceof Date) ? NaN : this.value.valueOf(); }
    setTime(value = 0)      { return !(this.value instanceof Date) ? NaN : this.value.setTime(value); }
    toTimeString()          { return !(this.value instanceof Date) ? 'Invalid Date' : this.value.toTimeString(); }
    toLocaleString()        { return !(this.value instanceof Date) ? 'Invalid Date' : this.value.toLocaleString(); }
    toLocaleDateString()    { return !(this.value instanceof Date) ? 'Invalid Date' : this.value.toLocaleDateString(); }
    toLocaleTimeString()    { return !(this.value instanceof Date) ? 'Invalid Date' : this.value.toLocaleTimeString(); }
    toUTCString()           { return !(this.value instanceof Date) ? 'Invalid Date' : this.value.toUTCString(); }

    getUTCFullYear()        { return !(this.value instanceof Date) ? NaN : this.value.getUTCFullYear(); }
    getUTCMonth()           { return !(this.value instanceof Date) ? NaN : this.value.getUTCMonth(); }
    getUTCDate()            { return !(this.value instanceof Date) ? NaN : this.value.getUTCDate(); }
    getUTCDay()             { return !(this.value instanceof Date) ? NaN : this.value.getUTCDay(); }
    getUTCHours()           { return !(this.value instanceof Date) ? NaN : this.value.getUTCHours(); }
    getUTCMinutes()         { return !(this.value instanceof Date) ? NaN : this.value.getUTCMinutes(); }
    getUTCSeconds()         { return !(this.value instanceof Date) ? NaN : this.value.getUTCSeconds(); }
    getUTCMilliseconds()    { return !(this.value instanceof Date) ? NaN : this.value.getUTCMilliseconds(); }
    getFullYear()           { return !(this.value instanceof Date) ? NaN : this.value.getFullYear(); }
    getMonth()              { return !(this.value instanceof Date) ? NaN : this.value.getMonth(); }
    getDate()               { return !(this.value instanceof Date) ? NaN : this.value.getDate(); }
    getDay()                { return !(this.value instanceof Date) ? NaN : this.value.getDay(); }
    getHours()              { return !(this.value instanceof Date) ? NaN : this.value.getHours(); }
    getMinutes()            { return !(this.value instanceof Date) ? NaN : this.value.getMinutes(); }
    getSeconds()            { return !(this.value instanceof Date) ? NaN : this.value.getSeconds(); }
    getMilliseconds()       { return !(this.value instanceof Date) ? NaN : this.value.getMilliseconds(); }
    getTimezoneOffset()     { return !(this.value instanceof Date) ? NaN : this.value.getTimezoneOffset(); }
    getTime()               { return !(this.value instanceof Date) ? NaN : this.value.getTime(); }

    setFullYear(year: number, month: number, date: number) {
      return !(this.value instanceof Date) ? NaN : this.value.setFullYear.apply(this.value, arguments);
    }
    setMonth(month: number, date: number) {
      return !(this.value instanceof Date) ? NaN : this.value.setMonth.apply(this.value, arguments);
    }
    setDate(date: number) {
      return !(this.value instanceof Date) ? NaN : this.value.setDate.apply(this.value, arguments);
    }
    setHours(hour: number, minutes: number, seconds: number, milliseconds: number) {
      return !(this.value instanceof Date) ? NaN : this.value.setHours.apply(this.value, arguments);
    }
    setMinutes(minutes: number, seconds: number, milliseconds: number) {
      return !(this.value instanceof Date) ? NaN : this.value.setMinutes.apply(this.value, arguments);
    }
    setSeconds(seconds: number, milliseconds: number) {
      return !(this.value instanceof Date) ? NaN : this.value.setSeconds.apply(this.value, arguments);
    }
    setMilliseconds(milliseconds: number) {
      return !(this.value instanceof Date) ? NaN : this.value.setMilliseconds.apply(this.value, arguments);
    }
    setUTCFullYear(year: number, month: number, date: number) {
      return !(this.value instanceof Date) ? NaN : this.value.setUTCFullYear.apply(this.value, arguments);
    }
    setUTCMonth(month: number, date: number) {
      return !(this.value instanceof Date) ? NaN : this.value.setUTCMonth.apply(this.value, arguments);
    }
    setUTCDate(date: number) {
      return !(this.value instanceof Date) ? NaN : this.value.setUTCDate.apply(this.value, arguments);
    }
    setUTCHours(hour: number, minutes: number, seconds: number, milliseconds: number) {
      return !(this.value instanceof Date) ? NaN : this.value.setUTCHours.apply(this.value, arguments);
    }
    setUTCMinutes(minutes: number, seconds: number, milliseconds: number) {
      return !(this.value instanceof Date) ? NaN : this.value.setUTCMinutes.apply(this.value, arguments);
    }
    setUTCSeconds(seconds: number, milliseconds: number) {
      return !(this.value instanceof Date) ? NaN : this.value.setUTCSeconds.apply(this.value, arguments);
    }
    setUTCMilliseconds(milliseconds: number) {
      return !(this.value instanceof Date) ? NaN : this.value.setUTCMilliseconds.apply(this.value, arguments);
    }

    get fullYear(): number {
      return this.value.getFullYear();
    }
    set fullYear(value: number) {
      this.value.setFullYear(value);
    }

    get month(): number {
      return this.value.getMonth();
    }
    set month(value: number) {
      this.value.setMonth(value);
    }

    get date(): number {
      return this.value.getDate();
    }
    set date(value: number) {
      this.value.setDate(value);
    }

    get hours(): number {
      return this.value.getHours();
    }
    set hours(value: number) {
      this.value.setHours(value);
    }

    get minutes(): number {
      return this.value.getMinutes();
    }
    set minutes(value: number) {
      this.value.setMinutes(value);
    }

    get seconds(): number {
      return this.value.getSeconds();
    }
    set seconds(value: number) {
      this.value.setSeconds(value);
    }

    get milliseconds(): number {
      return this.value.getMilliseconds();
    }
    set milliseconds(value: number) {
      this.value.setMilliseconds(value);
    }

    get fullYearUTC(): number {
      return this.value.getUTCFullYear();
    }
    set fullYearUTC(value: number) {
      this.value.setUTCFullYear(value);
    }

    get monthUTC(): number {
      return this.value.getUTCMonth();
    }
    set monthUTC(value: number) {
      this.value.setUTCMonth(value);
    }

    get dateUTC(): number {
      return this.value.getUTCDate();
    }
    set dateUTC(value: number) {
      this.value.setUTCDate(value);
    }

    get hoursUTC(): number {
      return this.value.getUTCHours();
    }
    set hoursUTC(value: number) {
      this.value.setUTCHours(value);
    }

    get minutesUTC(): number {
      return this.value.getUTCMinutes();
    }
    set minutesUTC(value: number) {
      this.value.setUTCMinutes(value);
    }

    get secondsUTC(): number {
      return this.value.getUTCSeconds();
    }
    set secondsUTC(value: number) {
      this.value.setUTCSeconds(value);
    }

    get millisecondsUTC(): number {
      return this.value.getUTCMilliseconds();
    }
    set millisecondsUTC(value: number) {
      this.value.setUTCMilliseconds(value);
    }

    get time(): number {
      return this.value.getTime();
    }
    set time(value: number) {
      this.value.setTime(value);
    }

    get timezoneOffset(): number {
      return this.value.getTimezoneOffset();
    }
    get day(): number {
      return this.value.getDay();
    }
    get dayUTC(): number {
      return this.value.getUTCDay();
    }
  }
}
