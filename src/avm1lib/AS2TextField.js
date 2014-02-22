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
/*global initDefaultListeners */
var AS2TextFieldDefinition = (function () {
  var def = {
    __class__: 'avm1lib.AS2TextField',

    initialize: function () {
      this._variable = '';
    },
  };

  def.__glue__ = {
    native: {
      instance: {
        variable: {
          get: function() {
            return this._variable;
          },
          set: function(name) {
            if (name === this._variable) {
              return;
            }
            this._variable = name;
            var instance = this.$nativeObject;
            var hasPath = name.indexOf('.') >= 0 || name.indexOf(':') >= 0;
            var clip;
            if (hasPath) {
              var targetPath = name.split(/[.:\/]/g);
              name = targetPath.pop();
              if (targetPath[0] == '_root' || targetPath[0] === '') {
                clip = instance.root._getAS2Object();
                targetPath.shift();
                if (targetPath[0] === '') {
                  targetPath.shift();
                }
              } else {
                clip = instance._parent._getAS2Object();
              }
              while (targetPath.length > 0) {
                var childName = targetPath.shift();
                clip = clip.asGetPublicProperty(childName) || clip[childName];
                if (!clip) {
                  throw new Error('Cannot find ' + childName + ' variable');
                }
              }
            } else {
              clip = instance._parent._getAS2Object();
            }
            if (!clip.asHasProperty(undefined, name, 0)) {
              clip.asSetPublicProperty(name, instance.text);
            }
            instance._addEventListener('advanceFrame', function() {
              instance.text = '' + clip.asGetPublicProperty(name);
            });
          }
        },
        _as3Object: {
          get: function () {
            return this.$nativeObject;
          }
        },
        _init: function init(nativeTextField) {
          Object.defineProperty(this, '$nativeObject', {value: nativeTextField});
          nativeTextField.$as2Object = this;
          initDefaultListeners(this);
        },
      }
    },
    script: {
      instance: Glue.ALL
    }
  };

  return def;
}).call(this);
