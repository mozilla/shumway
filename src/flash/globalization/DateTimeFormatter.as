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

package flash.globalization {

[native(cls='DateTimeFormatterClass')]
public final class DateTimeFormatter {
  public static native function getAvailableLocaleIDNames(): Vector;
  public function DateTimeFormatter(requestedLocaleIDName: String, dateStyle: String = "long",
                                    timeStyle: String = "long")
  {
    ctor(requestedLocaleIDName, dateStyle, timeStyle);
  }
  public native function get lastOperationStatus(): String;
  public native function get requestedLocaleIDName(): String;
  public native function get actualLocaleIDName(): String;
  public native function setDateTimeStyles(dateStyle: String, timeStyle: String): void;
  public native function getTimeStyle(): String;
  public native function getDateStyle(): String;
  public function format(dateTime: Date): String {
    return formatImplementation(dateTime, false);
  }
  public function formatUTC(dateTime: Date): String {
    return formatImplementation(dateTime, true);
  }
  public native function getMonthNames(nameStyle: String = "full",
                                       context: String = "standalone"): Vector;
  public native function getWeekdayNames(nameStyle: String = "full",
                                         context: String = "standalone"): Vector;
  public native function getFirstWeekday(): int;
  public native function getDateTimePattern(): String;
  public native function setDateTimePattern(pattern: String): void;
  private native function ctor(requestedLocaleIDName: String, dateStyle: String,
                               timeStyle: String): void;
  private native function formatImplementation(dateTime: Date, utc: Boolean): String;
}
}
