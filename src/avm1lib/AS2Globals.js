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
/*global AS2Context, Multiname, Stubs, TextFormatDefinition */
var AS2GlobalsDefinition = (function () {
  var def = {
    __class__: 'avm1lib.AS2Globals',

    initialize: function () {
      // The AS2 version of TextFormat has an additional method "getTextExtent".
      // We install that here so we don't need to have a full AS2 version of
      // TextFormat and take care to return that everywhere when in AS2 mode.
      flash.text.TextFormat.prototype.asDefinePublicProperty('getTextExtent', {
        value: TextFormatDefinition.as2GetTextExtent,
        writable: false,
        enumerable: false,
        configurable: false
      });
    },

  };

  def.__glue__ = {
    native: {
      instance: {
        ASSetPropFlags: function ASSetPropFlags(obj, children, flags, allowFalse) {
          // flags (from bit 0): dontenum, dontdelete, readonly, ....
          // TODO
        },
        _addToPendingScripts: function _addToPendingScripts(subject, fn, args) {
          assert(fn, 'invalid function in _addToPendingScripts');
          AS2Context.instance.addToPendingScripts(function () {
            fn.apply(subject, args);
          });
        },
        _setLevel: function _setLevel(level, loader) {
          AS2Context.instance.stage._as2SetLevel(level, loader);
        },
        trace: function (expression) {
          var trace = avm2.applicationDomain.getProperty(
            Multiname.fromSimpleName('trace'), true, true);
          trace(expression);
        }
      },
      static: {
        _addInternalClasses: function _addInternalClasses(proto) {
          proto.asSetPublicProperty('Object', Stubs.Object);
          proto.asSetPublicProperty('Function', Stubs.Function);
          proto.asSetPublicProperty('Array', Stubs.Array);
          proto.asSetPublicProperty('Number', Stubs.Number);
          proto.asSetPublicProperty('Math', avm2.systemDomain.getClass('Math')); // Cannot create a stub for Math
          proto.asSetPublicProperty('Boolean', Stubs.Boolean);
          proto.asSetPublicProperty('Date', Stubs.Date);
          proto.asSetPublicProperty('RegExp', Stubs.RegExp);
          proto.asSetPublicProperty('String', Stubs.String);
        }
      }
    },
    script: {
      instance: Glue.ALL
    }
  };

  return def;
}).call(this);
