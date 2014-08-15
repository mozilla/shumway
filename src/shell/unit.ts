/**
 * Copyright 2014 Mozilla Foundation
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
 * limitations under the License.
 */

module Shumway.Unit {

  export var everFailed = false;
  export var testNumber = 0;
  
  export var writer: IndentingWriter;

  export function fail(message) {
    everFailed = true;
    writer.errorLn(message);
  }

  export function eqFloat(a, b, test, tolerance) {
    tolerance = typeof tolerance === "undefined" ? 0.1 : tolerance;
    test = description(test);
    var d = Math.abs(a - b);
    if (isNaN(d) || d >= tolerance) {
      return fail("FAIL" + test + ". Got " + a + ", expected " + b + failedLocation());
    }
    writer.debugLn("PASS" + test);
  }

  export function neq(a, b, test) {
    test = description(test);
    if (a === b) {
      return fail("FAIL " + test + ". Got " + a + ", expected different (!==) value" +
        failedLocation());
    }
    writer.debugLn("PASS" + test);
  }

  export function eq(a, b, test) {
    test = description(test);
    if (a !== b) {
      return fail("FAIL" + test + ". Got " + a + ", expected " + b + failedLocation());
    }
    writer.debugLn("PASS" + test);
  }

  export function eqArray(a, b, test) {
    test = description(test);
    if (a == undefined && b) {
      return fail("FAIL" + test + " Null Array: a" + failedLocation());
    }
    if (a && b == undefined) {
      return fail("FAIL" + test + " Null Array: b" + failedLocation());
    }
    if (a.length !== b.length) {
      return fail("FAIL" + test + " Array Length Mismatch, got " + a.length + ", expected " +
        b.length + failedLocation());
    }
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        if (!(typeof a[i] == "number" && typeof b[i] == "number" && isNaN(a[i]) && isNaN(b[i]))) {
          return fail("FAIL" + test + " Array Element " + i + ": got " + a[i] + ", expected " +
            b[i] + failedLocation());
        }
      }
    }
    writer.debugLn("PASS" + test);
  }

  export function structEq(a, b, test) {
    test = description(test);
    if (a == undefined && b) {
      return fail("FAIL" + test + " Expected neither or both objects to be null/undefined, " +
        "but only `a` was" + failedLocation());
    }
    if (a && b == undefined) {
      return fail("FAIL" + test + " Expected neither or both objects to be null/undefined, " +
        "but only `b` was" + failedLocation());
    }
    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);
    for (var i = 0; i < aKeys.length; i++) {
      var key = aKeys[i];
      if (a[key] !== b[key]) {
        return fail("FAIL" + test + " properties differ. a." + key + " = " + a[key] +
          ", b." + key + " = " + b[key] + failedLocation());
      }
    }
    for (i = 0; i < bKeys.length; i++) {
      key = bKeys[i];
      if (a[key] !== b[key]) {
        return fail("FAIL" + test + " properties differ. a." + key + " = " + a[key] +
          ", b." + key + " = " + b[key] + failedLocation());
      }
    }
    writer.debugLn("PASS" + test);
  }

  export function check(condition, test) {
    test = description(test);
    if (!condition) {
      return fail("FAIL" + test + ". Got " + condition + ", expected truthy value" +
        failedLocation());
    }
    writer.debugLn("PASS" + test);
  }

  export function assertThrowsInstanceOf(f, ctor, test) {
    test = description(test);
    var msg;
    try {
      f();
    } catch (exc) {
      if (exc instanceof ctor) {
        return;
      }
      msg = "Expected exception " + ctor.name + ", got " + exc;
    }
    if (msg === undefined) {
      msg = "Expected exception " + ctor.name + ", no exception thrown";
    }
    return fail("FAIL " + test + ". " + msg + failedLocation());
  }

  export function description(test) {
    testNumber++;
    return test ? ": " + test : " #" + testNumber;
  }

  export function failedLocation() {
    return " (" + new Error().stack.split('\n')[2] + ")";
  }

  export function info(s: string) {
    writer.infoLn("INFO: " + s);
  }

  export function warn(s: string) {
    writer.warnLn("WARN: " + s);
  }

  export function error(s: string) {
    writer.errorLn("ERROR: " + s);
  }
}

/**
 * Exported on the global object since unit tests don't import them explicitly.
 */

import check = Shumway.Unit.check;
import fail = Shumway.Unit.fail;
import eqFloat = Shumway.Unit.eqFloat;
import neq = Shumway.Unit.neq;
import eq = Shumway.Unit.eq;
import eqArray = Shumway.Unit.eqArray;
import structEq = Shumway.Unit.structEq;
import assertThrowsInstanceOf = Shumway.Unit.assertThrowsInstanceOf;
import info = Shumway.Unit.info;
import warn = Shumway.Unit.warn;
import error = Shumway.Unit.error;
