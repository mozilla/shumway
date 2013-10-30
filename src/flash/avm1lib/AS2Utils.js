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
/*global AS2Context, Stubs */
var AS2UtilsDefinition = (function () {
  var def = {
    __class__: 'avm1lib.AS2Utils',

    initialize: function () {
    }
  };

  function installObjectMethods() {
    var c = Stubs.Object, p = c.asGetPublicProperty('prototype');
    c.asSetPublicProperty('registerClass', function registerClass(name, theClass) {
      var classes = AS2Context.instance.classes ||
        (AS2Context.instance.classes = {});
      classes[name] = theClass;
    });
    p.asDefinePublicProperty('addProperty', {
      value: function addProperty(name, getter, setter) {
        if (typeof name !== 'string' || name === '') {
          return false;
        }
        if (typeof getter !== 'function') {
          return false;
        }
        if (typeof setter !== 'function' && setter !== null) {
          return false;
        }
        this.asDefinePublicProperty(name, {
          get: getter,
          set: setter || undefined,
          configurable: true,
          enumerable: true
        });
        return true;
      },
      writable: false,
      enumerable: false,
      configurable: false
    });
  }

  def.__glue__ = {
    native: {
      static: {
        getAS2Object: function (nativeObject) {
          return nativeObject && nativeObject._getAS2Object
              ? nativeObject._getAS2Object()
              : null;
        },
        addProperty: function (obj, propertyName, getter, setter) {
          obj.asDefinePublicProperty(propertyName, {
            get: getter,
            set: setter || undefined,
            enumerable: true,
            configurable: true
          });
        },
        resolveTarget: function (target_mc) {
          return AS2Context.instance.resolveTarget(target_mc);
        },
        resolveLevel: function (level) {
          return AS2Context.instance.resolveLevel(level);
        },
        currentStage: {
          get: function () {
            return AS2Context.instance.stage;
          }
        },
        _installObjectMethods: installObjectMethods
      }
    }
  };

  return def;
}).call(this);

function initDefaultListeners(thisArg) {
  var defaultListeners = thisArg.asGetPublicProperty('$defaultListeners');
  if (!defaultListeners) {
    return;
  }
  for (var i = 0; i < defaultListeners.length; i++) {
    var p = defaultListeners[i];
    p.asGetPublicProperty('setter').call(thisArg, p.value);
  }
}
