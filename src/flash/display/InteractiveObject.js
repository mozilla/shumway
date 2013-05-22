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

var InteractiveObjectDefinition = (function () {
  var def = {
    initialize: function () {
      this._doubleClickEnabled = false;
      this._hitArea = null;
      this._mouseEnabled = true;

      this._tabEnabled = false;
      this._focusRect = null;
      this._contextMenu = null;
    },

    get accessibilityImplementation() {
      return null;
    },
    set accessibilityImplementation(val) {
      somewhatImplemented("accessibilityImplementation");
    },
    get contextMenu() {
      somewhatImplemented("contextMenu");
      return this._contextMenu;
    },
    set contextMenu(val) {
      somewhatImplemented("contextMenu");
      this._contextMenu = val;
    },
    get doubleClickEnabled() {
      return this._doubleClickEnabled;
    },
    set doubleClickEnabled(val) {
      this._doubleClickEnabled = val;
    },
    get focusRect() {
      return this._focusRect;
    },
    set focusRect(val) {
      this._focusRect = val;
    },
    get mouseEnabled() {
      return this._mouseEnabled;
    },
    set mouseEnabled(val) {
      this._mouseEnabled = val;
    },
    get needsSoftKeyboard() {
      return false;
    },
    set needsSoftKeyboard(val) {
      notImplemented();
    },
    get softKeyboardInputAreaOfInterest() {
      return null;
    },
    set softKeyboardInputAreaOfInterest(val) {
      notImplemented();
    },
    get tabEnabled() {
      return this._tabEnabled;
    },
    set tabEnabled(val) {
      var old = this._tabEnabled;
      this._tabEnabled = val;
      if (old !== val) {
        var Event = flash.events.Event;
        this._dispatchEvent(new Event('tabEnabledChange', false, false));
      }
    },
    requestSoftKeyboard: function () {
      notImplemented();
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        tabEnabled: desc(def, "tabEnabled"),
        tabIndex: {
          get: function tabIndex() { // (void) -> int
            return this._tabIndex;
          },
          set: function tabIndex(index) { // (index:int) -> void
            this._tabIndex = index;
          }
        },
        focusRect: desc(def, "focusRect"),
        mouseEnabled: desc(def, "mouseEnabled"),
        doubleClickEnabled: desc(def, "doubleClickEnabled"),
        accessibilityImplementation: desc(def, "accessibilityImplementation"),
        softKeyboardInputAreaOfInterest: desc(def, "softKeyboardInputAreaOfInterest"),
        needsSoftKeyboard: desc(def, "needsSoftKeyboard"),
        contextMenu: desc(def, "contextMenu"),
        requestSoftKeyboard: def.requestSoftKeyboard
      }
    }
  };

  return def;
}).call(this);
