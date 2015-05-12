/* Copyright 2013 Mozilla Foundation
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
/* jshint esnext:true */

'use strict';

this.EXPORTED_SYMBOLS = ['ShumwayTelemetry'];

const Cu = Components.utils;
Cu.import('resource://gre/modules/Services.jsm');

const ADDON_ID = "shumway@research.mozilla.org";

var Telemetry = Services.telemetry;

var registerAddonHistogram = Telemetry.registerAddonHistogram;
try {
  // Swapping arguments of the registerAddonHistogram for older Firefox versions.
  // See https://bugzilla.mozilla.org/show_bug.cgi?id=1069953.
  var ffVersion = parseInt(Services.appinfo.platformVersion);
  var oldTelemetryAPI = ffVersion < 36;
  if (ffVersion === 36) {
    // Probing FF36 to check if it has new API.
    try {
      Telemetry.registerAddonHistogram(ADDON_ID, "SHUMWAY_36",
        Telemetry.HISTOGRAM_LINEAR, 1, 40, 41);
      var histogram = Telemetry.getAddonHistogram(ADDON_ID, "SHUMWAY_36");
      histogram.add(36);
    } catch (e) {
      oldTelemetryAPI = true;
    }
  }
  if (oldTelemetryAPI) {
    registerAddonHistogram = function (p1, p2, p3, p4, p5, p6) {
      return Telemetry.registerAddonHistogram(p1, p2, p4, p5, p6, p3);
    };
  }
} catch (ex) { }

registerAddonHistogram(ADDON_ID, "SHUMWAY_TIME_TO_VIEW_MS", Telemetry.HISTOGRAM_EXPONENTIAL, 1, 2 * 60 * 1000, 50);
registerAddonHistogram(ADDON_ID, "SHUMWAY_PARSING_MS", Telemetry.HISTOGRAM_EXPONENTIAL, 1, 2 * 60 * 1000, 50);
registerAddonHistogram(ADDON_ID, "SHUMWAY_SWF_INDEX_ON_PAGE", Telemetry.HISTOGRAM_LINEAR, 1, 30, 31);
registerAddonHistogram(ADDON_ID, "SHUMWAY_SWF_SIZE_KB", Telemetry.HISTOGRAM_EXPONENTIAL, 1, 256 * 1024, 50);
registerAddonHistogram(ADDON_ID, "SHUMWAY_SWF_VERSION", Telemetry.HISTOGRAM_LINEAR, 1, 30, 31);
registerAddonHistogram(ADDON_ID, "SHUMWAY_SWF_FRAME_RATE", Telemetry.HISTOGRAM_LINEAR, 1, 256, 50);
registerAddonHistogram(ADDON_ID, "SHUMWAY_SWF_AREA", Telemetry.HISTOGRAM_EXPONENTIAL, 256, 16777216, 50);
registerAddonHistogram(ADDON_ID, "SHUMWAY_SWF_AVM2", Telemetry.HISTOGRAM_BOOLEAN, 1, 2, 3);
registerAddonHistogram(ADDON_ID, "SHUMWAY_SWF_BANNER", Telemetry.HISTOGRAM_LINEAR, 1, 30, 31);
registerAddonHistogram(ADDON_ID, "SHUMWAY_ERROR", Telemetry.HISTOGRAM_LINEAR, 1, 2, 3);
registerAddonHistogram(ADDON_ID, "SHUMWAY_FEATURE_USED", Telemetry.HISTOGRAM_LINEAR, 1, 700, 701);
registerAddonHistogram(ADDON_ID, "SHUMWAY_LOAD_RESOURCE_RESULT", Telemetry.HISTOGRAM_LINEAR, 1, 10, 11);
registerAddonHistogram(ADDON_ID, "SHUMWAY_FALLBACK", Telemetry.HISTOGRAM_BOOLEAN, 1, 2, 3);

const BANNER_SIZES = [
  "88x31", "120x60", "120x90", "120x240", "120x600", "125x125", "160x600",
  "180x150", "234x60", "240x400", "250x250", "300x100", "300x250", "300x600",
  "300x1050", "336x280", "468x60", "550x480", "720x100", "728x90", "970x90",
  "970x250"];

function getBannerType(width, height) {
  return BANNER_SIZES.indexOf(width + 'x' + height) + 1;
}

this.ShumwayTelemetry = {
  onFirstFrame: function (timeToDisplay) {
    var histogram = Telemetry.getAddonHistogram(ADDON_ID, "SHUMWAY_TIME_TO_VIEW_MS");
    histogram.add(timeToDisplay);
  },
  onParseInfo: function (parseInfo) {
    var histogram = Telemetry.getAddonHistogram(ADDON_ID, "SHUMWAY_PARSING_MS");
    histogram.add(parseInfo.parseTime);
    var histogram = Telemetry.getAddonHistogram(ADDON_ID, "SHUMWAY_SWF_SIZE_KB");
    histogram.add(parseInfo.size / 1024);
    var histogram = Telemetry.getAddonHistogram(ADDON_ID, "SHUMWAY_SWF_VERSION");
    histogram.add(parseInfo.swfVersion);
    var histogram = Telemetry.getAddonHistogram(ADDON_ID, "SHUMWAY_SWF_FRAME_RATE");
    histogram.add(parseInfo.frameRate);
    var histogram = Telemetry.getAddonHistogram(ADDON_ID, "SHUMWAY_SWF_AREA");
    histogram.add(parseInfo.width * parseInfo.height);
    var histogram = Telemetry.getAddonHistogram(ADDON_ID, "SHUMWAY_SWF_BANNER");
    histogram.add(getBannerType(parseInfo.width, parseInfo.height));
    var histogram = Telemetry.getAddonHistogram(ADDON_ID, "SHUMWAY_SWF_AVM2");
    histogram.add(parseInfo.isAvm2);
  },
  onError: function (errorType) {
    var histogram = Telemetry.getAddonHistogram(ADDON_ID, "SHUMWAY_ERROR");
    histogram.add(errorType);
  },
  onPageIndex: function (pageIndex) {
    var histogram = Telemetry.getAddonHistogram(ADDON_ID, "SHUMWAY_SWF_INDEX_ON_PAGE");
    histogram.add(pageIndex);
  },
  onFeature: function (featureType) {
    var histogram = Telemetry.getAddonHistogram(ADDON_ID, "SHUMWAY_FEATURE_USED");
    histogram.add(featureType);
  },
  onLoadResource: function (resultType) {
    var histogram = Telemetry.getAddonHistogram(ADDON_ID, "SHUMWAY_LOAD_RESOURCE_RESULT");
    histogram.add(resultType);
  },
  onFallback: function (userAction) {
    var histogram = Telemetry.getAddonHistogram(ADDON_ID, "SHUMWAY_FALLBACK");
    histogram.add(userAction);
  }
};
