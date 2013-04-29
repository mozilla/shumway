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

var KeyboardEventDefinition = (function () {
  var def = {
    __class__: 'flash.events.KeyboardEvent',

    updateAfterEvent: function () {
      notImplemented();
    },
    get keyCode() {
      var keyCodePropertyName = new Multiname(ShumwayNamespace.fromSimpleName(
        'private flash.events:KeyboardEvent'), 'm_keyCode');
      return getProperty(this, keyCodePropertyName);
    }
  };

  def.__glue__ = {
    script: {
      instance: scriptProperties("private", ["m_keyCode",
                                             "m_keyLocation"]),
      static: scriptProperties("public", ["KEY_DOWN",
                                          "KEY_UP"])
    },

    native: {
      instance: {
        charCode: {
          get: function () { return this.charCode; },
          set: function (v) { this.charCode = v; }
        },
        ctrlKey: {
          get: function () { return this.ctrlKey; },
          set: function (v) { this.ctrlKey = v; }
        },
        altKey: {
          get: function () { return this.altKey; },
          set: function (v) { this.altKey = v; }
        },
        shiftKey: {
          get: function () { return this.shiftKey; },
          set: function (v) { this.shiftKey = v; }
        },
        updateAfterEvent: def.updateAfterEvent
      }
    }
  };

  return def;
}).call(this);
