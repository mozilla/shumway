/*
 * Copyright 2013 Mozilla Foundation
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

var jsGlobal = (function() { return this || (1, eval)('this'); })();
var inBrowser = typeof console != "undefined";

interface JSGlobal {
  Object: any;
  String: Function;
  Number: Function;
  Boolean: Function;
  Function: Function;
  Math: Function;
  Array: Function;
  performance: any;
  print: any;
}


// declare var print;
// declare var console;
// declare var performance;
// declare var XMLHttpRequest;
// declare var document;
// declare var getComputedStyle;

/** @const */ var release: boolean = false;
/** @const */ var debug: boolean = !release;

declare function assert(condition: any, ...args);
declare var dateNow: () => number;

if (!jsGlobal.performance) {
  jsGlobal.performance = {};
}

if (!jsGlobal.performance.now) {
  jsGlobal.performance.now = dateNow;
}
