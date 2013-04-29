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

var URLVariablesDefinition = (function () {
  var def = {
    initialize: function() {
    },

    ctor : function ctor(str) {
      str && decode(str);
    },

    decode : function decode(str) {
      trace("URLVars.decode");
      var parts = str.split('&');

      for (var i = 0; i < parts.length; i++) {
        var keyVal = parts[i].split('=');
        this[Multiname.getPublicQualifiedName(keyVal[0])] =
            decodeURIComponent(keyVal[1]);
      }
    },

    toString : function toString() {
      trace("URLVars.toString");
      return Object.keys(this).map(function(key) {
        return Multiname.fromQualifiedName(key).name + '=' + this[key]
      }).join('&');
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        ctor : def.ctor,
        decode: def.decode,
        toString : def.toString
      }
    }
  };

  return def;
}).call(this);
