/**
 * Copyright 2013 Mozilla Foundation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations undxr the License.
 */
// Class: DateTimeFormatter
module Shumway.AVM2.AS.flash.globalization {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DateTimeFormatter extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["format", "formatUTC"];
    
    constructor (requestedLocaleIDName: string, dateStyle: string = "long", timeStyle: string = "long") {
      requestedLocaleIDName = "" + requestedLocaleIDName; dateStyle = "" + dateStyle; timeStyle = "" + timeStyle;
      false && super();
      notImplemented("Dummy Constructor: public flash.globalization.DateTimeFormatter");
    }
    
    // JS -> AS Bindings
    
    format: (dateTime: ASDate) => string;
    formatUTC: (dateTime: ASDate) => string;
    
    // AS -> JS Bindings
    static getAvailableLocaleIDNames(): ASVector<any> {
      notImplemented("public flash.globalization.DateTimeFormatter::static getAvailableLocaleIDNames"); return;
    }
    
    // _lastOperationStatus: string;
    // _requestedLocaleIDName: string;
    // _actualLocaleIDName: string;
    get lastOperationStatus(): string {
      notImplemented("public flash.globalization.DateTimeFormatter::get lastOperationStatus"); return;
      // return this._lastOperationStatus;
    }
    get requestedLocaleIDName(): string {
      notImplemented("public flash.globalization.DateTimeFormatter::get requestedLocaleIDName"); return;
      // return this._requestedLocaleIDName;
    }
    get actualLocaleIDName(): string {
      notImplemented("public flash.globalization.DateTimeFormatter::get actualLocaleIDName"); return;
      // return this._actualLocaleIDName;
    }
    setDateTimeStyles(dateStyle: string, timeStyle: string): void {
      dateStyle = "" + dateStyle; timeStyle = "" + timeStyle;
      notImplemented("public flash.globalization.DateTimeFormatter::setDateTimeStyles"); return;
    }
    getTimeStyle(): string {
      notImplemented("public flash.globalization.DateTimeFormatter::getTimeStyle"); return;
    }
    getDateStyle(): string {
      notImplemented("public flash.globalization.DateTimeFormatter::getDateStyle"); return;
    }
    getMonthNames(nameStyle: string = "full", context: string = "standalone"): ASVector<any> {
      nameStyle = "" + nameStyle; context = "" + context;
      notImplemented("public flash.globalization.DateTimeFormatter::getMonthNames"); return;
    }
    getWeekdayNames(nameStyle: string = "full", context: string = "standalone"): ASVector<any> {
      nameStyle = "" + nameStyle; context = "" + context;
      notImplemented("public flash.globalization.DateTimeFormatter::getWeekdayNames"); return;
    }
    getFirstWeekday(): number /*int*/ {
      notImplemented("public flash.globalization.DateTimeFormatter::getFirstWeekday"); return;
    }
    getDateTimePattern(): string {
      notImplemented("public flash.globalization.DateTimeFormatter::getDateTimePattern"); return;
    }
    setDateTimePattern(pattern: string): void {
      pattern = "" + pattern;
      notImplemented("public flash.globalization.DateTimeFormatter::setDateTimePattern"); return;
    }
    ctor(requestedLocaleIDName: string, dateStyle: string, timeStyle: string): void {
      requestedLocaleIDName = "" + requestedLocaleIDName; dateStyle = "" + dateStyle; timeStyle = "" + timeStyle;
      notImplemented("public flash.globalization.DateTimeFormatter::ctor"); return;
    }
    formatImplementation(dateTime: ASDate, utc: boolean): string {
      dateTime = dateTime; utc = !!utc;
      notImplemented("public flash.globalization.DateTimeFormatter::formatImplementation"); return;
    }
  }
}
