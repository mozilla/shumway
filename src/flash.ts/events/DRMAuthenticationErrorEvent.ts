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
// Class: DRMAuthenticationErrorEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DRMAuthenticationErrorEvent extends flash.events.ErrorEvent {
    static initializer: any = null;
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, inDetail: string = "", inErrorID: number /*int*/ = 0, inSubErrorID: number /*int*/ = 0, inServerURL: string = null, inDomain: string = null) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; inDetail = "" + inDetail; inErrorID = inErrorID | 0; inSubErrorID = inSubErrorID | 0; inServerURL = "" + inServerURL; inDomain = "" + inDomain;
      false && super(undefined, undefined, undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.DRMAuthenticationErrorEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.events.Event;
    subErrorID: number /*int*/;
    serverURL: string;
    domain: string;
    m_subErrorID: number /*int*/;
    m_serverURL: string;
    m_domain: string;
    // Instance AS -> JS Bindings
  }
}
