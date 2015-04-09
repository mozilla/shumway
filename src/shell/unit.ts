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

  export function matrixEq(a, b, test) {
    test = description(test);
    if (a == undefined && b) {
      return fail("FAIL" + test + " Expected neither or both objects to be null/undefined, " +
        "but only `a` was" + failedLocation());
    }
    if (a && b == undefined) {
      return fail("FAIL" + test + " Expected neither or both objects to be null/undefined, " +
        "but only `b` was" + failedLocation());
    }
    if (a.a !== b.a || a.b !== b.b ||
        a.c !== b.c || a.d !== b.d ||
        a.tx !== b.tx || a.ty !== b.ty) {
      return fail("FAIL" + test + " matices differ." + failedLocation());
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

  var maxVarianceTime = 1;
  var minElapsedTime = 100;
  var maxElapsedTime = 1000;

  /**
   * Measures several runs of a test case and tries to ensure that the test case is reasonably fast, yet still accurate.
   */
  export function checkTime(fn: any, test: string, threshold: number, iterations: number = 64, help = true) {
    iterations = iterations || 0;
    if (help && iterations < 5) {
      writer.warnLn("Test doesn't have enough iterations to get meaningful timing results: " + test);
    } else if (help && iterations > 1024) {
      writer.warnLn("Test has too many iterations, increase the complexity of the test case: " + test);
    }
    var start = new Date();
    var s = 0;
    var elapsedTimes = [];
    for (var i = 0; i < iterations; i++) {
      var iterationStart = Date.now();
      s += fn();
      elapsedTimes.push(Date.now() - iterationStart);
    }
    var elapsed: number = (<any>new Date() - <any>start);
    // Let's not make the test too short, or too long.
    if (help && elapsed < minElapsedTime) {
      writer.warnLn("Test doesn't run long enough (" + elapsed.toFixed(2) + " ms) to have meaningful timing results: " + test + ", must be at least " + minElapsedTime + " ms long.");
    } else if (help && elapsed > maxElapsedTime) {
      writer.warnLn("Test runs too long (" + elapsed.toFixed(2) + " ms), reduce the number of iterations: " + test + ", keep it below " + maxElapsedTime.toFixed(2) + " ms.");
    }

    var result =  Math.min.apply(null, elapsedTimes);
    // Can we make the test smaller yet get the same result?
    if (help && elapsed > 500 && result === Math.min.apply(null, elapsedTimes.slice(0, elapsedTimes.length / 2 | 0))) {
      writer.warnLn("Test would have had the same result with half as many iterations.");
    }
    if (result > threshold) {
      return fail("FAIL " + test + ". Got " + result.toFixed(2) + " ms, expected less than " + threshold.toFixed(2) + " ms" +
        failedLocation());
    }
    var details = "Iterations: " + iterations + ", Elapsed: " + elapsed.toFixed(2) + " ms (" + result.toFixed(2) + " ms / Iteration)"
    writer.debugLn("PASS " + test + " " + details);
    var min =  Math.min.apply(null, elapsedTimes);
    var max =  Math.max.apply(null, elapsedTimes);
    var maxBarWidth = 32;
    for (var i = 0; i < Math.min(elapsedTimes.length, 8); i++) {
      var j = elapsedTimes.length - i - 1;
      var time = (elapsedTimes[j] - min) / (max - min);
      var ticks = Math.round(time * maxBarWidth);
      writer.debugLn(String(j).padLeft(" ", 4) + ": =" + StringUtilities.repeatString("=", ticks) + " " + elapsedTimes[j].toFixed(2) + " ms");
    }
  }
}

/**
 * Exported on the global object since unit tests don't import them explicitly.
 */

import check = Shumway.Unit.check;
import checkTime = Shumway.Unit.checkTime;
import fail = Shumway.Unit.fail;
import eqFloat = Shumway.Unit.eqFloat;
import neq = Shumway.Unit.neq;
import eq = Shumway.Unit.eq;
import eqArray = Shumway.Unit.eqArray;
import structEq = Shumway.Unit.structEq;
import matrixEq = Shumway.Unit.matrixEq;
import assertThrowsInstanceOf = Shumway.Unit.assertThrowsInstanceOf;
import info = Shumway.Unit.info;
// import warn = Shumway.Unit.warn;
import error = Shumway.Unit.error;
