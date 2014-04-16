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
 * limitations under the License.
 */
// Class: DRMAuthenticateEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DRMAuthenticateEvent extends flash.events.Event {
    static initializer: any = null;
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, header: string = "", userPrompt: string = "", passPrompt: string = "", urlPrompt: string = "", authenticationType: string = "", netstream: flash.net.NetStream = null) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; header = "" + header; userPrompt = "" + userPrompt; passPrompt = "" + passPrompt; urlPrompt = "" + urlPrompt; authenticationType = "" + authenticationType; netstream = netstream;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.DRMAuthenticateEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_header: string;
    m_userPrompt: string;
    m_passPrompt: string;
    m_urlPrompt: string;
    m_authenticationType: string;
    m_netstream: flash.net.NetStream;
    clone: () => flash.events.Event;
    header: string;
    usernamePrompt: string;
    passwordPrompt: string;
    urlPrompt: string;
    authenticationType: string;
    netstream: flash.net.NetStream;
    // Instance AS -> JS Bindings
  }
}
