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

var StageDefinition = (function () {
  var COLOR_CORRECTION_DEFAULT     = 'default';
  var COLOR_CORRECTION_OFF         = 'on';
  var COLOR_CORRECTION_ON          = 'off';

  var COLOR_CORRECTION_DEFAULT_OFF = 'defaultOff';
  var COLOR_CORRECTION_DEFAULT_ON  = 'defaultOn';
  var COLOR_CORRECTION_UNSUPPORTED = 'unsuported';

  var STAGE_ALIGN_BOTTOM           = 'B';
  var STAGE_ALIGN_BOTTOM_LEFT      = 'BL';
  var STAGE_ALIGN_BOTTOM_RIGHT     = 'BR';
  var STAGE_ALIGN_LEFT             = 'L';
  var STAGE_ALIGN_RIGHT            = 'R';
  var STAGE_ALIGN_TOP              = 'T';
  var STAGE_ALIGN_TOP_LEFT         = 'TL';
  var STAGE_ALIGN_TOP_RIGHT        = 'TR';

  var STAGE_SCALE_MODE_EXACT_FIT   = 'exactFit';
  var STAGE_SCALE_MODE_NO_BORDER   = 'noBorder';
  var STAGE_SCALE_MODE_NO_SCALE    = 'noScale';
  var STAGE_SCALE_MODE_SHOW_ALL    = 'showAll';

  var STAGE_QUALITY_BEST           = 'best';
  var STAGE_QUALITY_HIGH           = 'high';
  var STAGE_QUALITY_LOW            = 'low';
  var STAGE_QUALITY_MEDIUM         = 'medium';

  var def = {
    __class__: 'flash.display.Stage',

    initialize: function () {
      this._color = 0xFFFFFFFF;
      this._focus = null;
      this._clickTarget = null;
      this._showRedrawRegions = false;
      this._stage = this;
      this._stageHeight = 0;
      this._stageWidth = 0;
      this._transform = { };
      this._mouseJustLeft = false;
      this._quality = STAGE_QUALITY_HIGH;
      this._pendingScripts = [];
      this._align = "";
      this._scaleMode = STAGE_SCALE_MODE_SHOW_ALL;
      this._contentsScaleFactor = 1;
      this._displayState = "normal";
    },

    _flushPendingScripts: function () {
      var MAX_PENDING_SCRIPTS_EXECUTED = 100;
      var executed = 0;
      while (this._pendingScripts.length > 0) {
        var fn = this._pendingScripts.shift();
        fn();
        if (++executed > MAX_PENDING_SCRIPTS_EXECUTED) {
          console.error('ERROR: pending script limit was reached');
          this._pendingScripts = [];
          return;
        }
      }
    },

    get allowsFullScreen() {
      return false;
    },
    get colorCorrection() {
      return COLOR_CORRECTION_DEFAULT;
    },
    set colorCorrection(val) {
      notImplemented();
    },
    get colorCorrectionSupport() {
      return COLOR_CORRECTION_UNSUPPORTED;
    },
    get displayState() {
      return null;
    },
    get frameRate() {
      return this._frameRate;
    },
    set frameRate(val) {
      this._frameRate = val;
    },
    get fullScreenHeight() {
      notImplemented();
    },
    get fullScreenSourceRect() {
        return null;
    },
    set fullScreenSourceRect(val) {
      notImplemented();
    },
    get fullScreenWidth() {
      notImplemented();
    },
    get quality() {
      return this._quality;
    },
    set quality(val) {
      this._quality = val;
    },
    get scaleMode() {
      return this._scaleMode;
    },
    set scaleMode(val) {
      this._scaleMode = val;
      this._invalidate = true;
    },
    get showDefaultContextMenu() {
      return true;
    },
    set showDefaultContextMenu(val) {
      notImplemented();
    },
    get stageFocusRect() {
      return false;
    },
    set stageFocusRect(val) {
      notImplemented();
    },
    get stageHeight() {
      return this._stageHeight;
    },
    set stageHeight(val) {
      notImplemented();
    },
    get stageWidth() {
      return this._stageWidth;
    },
    set stageWidth(val) {
      notImplemented();
    },
    get stageVideos() {
      notImplemented();
    },
    get wmodeGPU() {
      return false;
    },

    invalidate: function () {
      notImplemented();
    },
    isFocusInaccessible: function() {
      notImplemented();
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  // TODO
  def.__glue__  = {
    native: {
      instance: {
        stageHeight: desc(def, "stageHeight"),
        stageWidth: desc(def, "stageWidth"),
        frameRate: desc(def, "frameRate"),
        scaleMode: desc(def, "scaleMode"),
        contentsScaleFactor: {
          get: function contentsScaleFactor() { // (void) -> Number
            return this._contentsScaleFactor;
          }
        },
        align: {
          get: function align() { // (void) -> String
            return this._align;
          },
          set: function align(value) { // (value:String) -> void
            this._align = value;
            this._invalidate = true;
          }
        },
        focus: {
          get: function focus() { // (void) -> InteractiveObject
            somewhatImplemented("Stage.focus");
            return this._focus;
          },
          set: function focus(newFocus) { // (newFocus:InteractiveObject) -> void
            somewhatImplemented("Stage.focus");
            this._focus = newFocus;
          }
        },
        requireOwnerPermissions: function () {
          // private undocumented
        },
        displayState: {
          get: function displayState() { // (void) -> String
            return this._displayState;
          },
          set: function displayState(value) { // (value:String) -> void
            somewhatImplemented("Stage.displayState");
            this._displayState = value;
          }
        }
      }
    }
  };

  return def;
}).call(this);
