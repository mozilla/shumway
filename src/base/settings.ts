/*
 * Copyright 2014 Mozilla Foundation
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

///<reference path='references.ts' />
module Shumway.Settings {
  declare var window;

  export var ROOT: string = "Shumway Options";
  export var shumwayOptions = new Shumway.Options.OptionSet(ROOT, load());

  export function isStorageSupported() {
    try {
      return typeof window !== 'undefined' &&
             "localStorage" in window &&
             window["localStorage"] !== null;
    } catch (e) {
      return false;
    }
  }

  export function load(key: string = ROOT) {
    var settings: any = {};
    if (isStorageSupported()) {
      var lsValue: string = window.localStorage[key];
      if (lsValue) {
        try {
          settings = JSON.parse(lsValue);
        } catch (e) {
            //...
        }
      }
    }
    return settings;
  }

  export function save(settings: any = null, key: string = ROOT) {
    if (isStorageSupported()) {
      try {
        window.localStorage[key] = JSON.stringify(settings ? settings : shumwayOptions.getSettings());
      } catch (e) {
          //...
      }
    }
  }

  export function setSettings(settings: any) {
    shumwayOptions.setSettings(settings);
  }

  export function getSettings(settings: any) {
    return shumwayOptions.getSettings();
  }
}
