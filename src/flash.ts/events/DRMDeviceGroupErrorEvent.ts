/**
 * Copyright 2013 Mozilla Foundation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations undxr the License.
 */
// Class: DRMDeviceGroupErrorEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DRMDeviceGroupErrorEvent extends flash.events.ErrorEvent {
    static initializer: any = null;
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, errorDetail: string = "", errorCode: number /*int*/ = 0, subErrorID: number /*int*/ = 0, deviceGroup: flash.net.drm.DRMDeviceGroup = null, systemUpdateNeeded: boolean = false, drmUpdateNeeded: boolean = false) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; errorDetail = "" + errorDetail; errorCode = errorCode | 0; subErrorID = subErrorID | 0; deviceGroup = deviceGroup; systemUpdateNeeded = !!systemUpdateNeeded; drmUpdateNeeded = !!drmUpdateNeeded;
      false && super(undefined, undefined, undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.DRMDeviceGroupErrorEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    subErrorID: number /*int*/;
    deviceGroup: flash.net.drm.DRMDeviceGroup;
    clone: () => flash.events.Event;
    systemUpdateNeeded: boolean;
    drmUpdateNeeded: boolean;
    m_deviceGroup: flash.net.drm.DRMDeviceGroup;
    m_subErrorID: number /*int*/;
    m_systemUpdateNeeded: boolean;
    m_drmUpdateNeeded: boolean;
    // Instance AS -> JS Bindings
  }
}
