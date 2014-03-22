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
package avm1lib {
  import flash.display.MovieClip;
  import flash.display.Stage;

  [native(cls="AS2Utils")]
  public class AS2Utils {
    public static native function getAS2Object(nativeObject: Object) : Object;
    public static native function addProperty(obj: Object, name: String, getter: Function, setter: Function, enumerable: Boolean = true);
    public static native function resolveTarget(target_mc:* = undefined) : MovieClip;
    public static native function resolveLevel(level: Number) : MovieClip;
    public static native function get currentStage() : Stage;

    public static function getTarget(mc: Object) {
      var nativeObject = mc._as3Object;
      if (nativeObject === nativeObject.root) {
        return '/';
      }
      var path = '';
      do {
        path = '/' + nativeObject.name + path;
        nativeObject = nativeObject.parent;
      } while (nativeObject !== nativeObject.root);
      return path;
    }

    public static function addEventHandlerProxy(obj: Object, propertyName: String, eventName: String, argsConverter: Function = null)
    {
      _addEventHandlerProxy(obj, propertyName, eventName, argsConverter);
    }

    private static native function _installObjectMethods();

    {
      _installObjectMethods();
    }
  }
}

import avm1lib.AS2Utils;

AS2Utils;

function _addEventHandlerProxy(obj: Object, propertyName: String, eventName: String, argsConverter: Function)
{
  var currentHandler: Function = null;
  var handlerRunner: Function = null;
  AS2Utils.addProperty(obj, propertyName,
    function(): Function {
      return currentHandler;
    },
    function setter(newHandler: Function) {
      if (!this._as3Object) { // prototype/class ?
        var defaultListeners = this._as2DefaultListeners ||
          (this._as2DefaultListeners = []);
        defaultListeners.push({setter: setter, value: newHandler});
        // see also initDefaultListeners()
        return;
      }

      if (currentHandler === newHandler) {
        return;
      }
      if (currentHandler != null) {
        this._as3Object.removeEventListener(eventName, handlerRunner);
      }
      currentHandler = newHandler;
      if (currentHandler != null) {
        handlerRunner = (function (obj: Object, handler: Function) {
          return function handlerRunner() {
            var args = argsConverter != null ? argsConverter(arguments) : null;
            return handler.apply(obj, args);
          };
        })(this, currentHandler);
        this._as3Object.addEventListener(eventName, handlerRunner);
      } else {
        handlerRunner = null;
      }
    },
    false);
}
