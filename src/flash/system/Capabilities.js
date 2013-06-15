/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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
/*global toKeyValueArray */

var CapabilitiesDefinition = (function () {
  var def = {};

  var os;
  var userAgent = window.navigator.userAgent;
  if (userAgent.indexOf("Macintosh") > 0) {
    os = "Mac OS 10.5.2";
  } else if (userAgent.indexOf("Windows") > 0) {
    os = "Windows XP";
  } else if (userAgent.indexOf("Linux") > 0) {
    os = "Linux";
  } else {
    notImplemented();
  }

  def.__glue__ = {
    native: {
      static: {
        version: {
          get: function version() {
            return 'SHUMWAY 10,0,0,0';
          },
          enumerable: true
        },
        os: {
          get: function () {
            return os;
          },
          enumerable: true
        },
        serverString: {
          get: function () {
            var str = toKeyValueArray({OS: os}).map(function (pair) {
              return pair[0] + "=" + encodeURIComponent(pair[1]);
            }).join("&");
            somewhatImplemented("Capabilities.serverString: " + str);
            return str;
          }
        },
        hasAccessibility: {
          get: function hasAccessibility() { // (void) -> Boolean
            somewhatImplemented("Capabilities.hasAccessibility");
            return false;
          }
        },
        screenResolutionX: {
          get: function screenResolutionX() { // (void) -> Number
            return window.screen.width;
          }
        },
        screenResolutionY: {
          get: function screenResolutionY() { // (void) -> Number
            return window.screen.height;
          }
        },
      }
    },
    script: {
      static: scriptProperties("public", [
        "version",
        "os",
      ])
    }
  };

  return def;
}).call(this);
