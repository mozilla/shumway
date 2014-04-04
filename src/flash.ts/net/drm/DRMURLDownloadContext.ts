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
// Class: DRMURLDownloadContext
module Shumway.AVM2.AS.flash.net.drm {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DRMURLDownloadContext extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: packageInternal flash.net.drm.DRMURLDownloadContext");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    httpPostAndReceiveASync: (url: string, headerName: string, headerValue: string, data: flash.utils.ByteArray) => void;
    httpGetASync: (url: string) => void;
    doURLDownload: (urlRequest: flash.net.URLRequest) => void;
    onTimer: (ev: flash.events.TimerEvent) => any;
    onAsyncDownloadComplete: (event: flash.events.Event) => void;
    onAsyncIOError: (event: flash.events.Event) => void;
    onAsyncSecurityError: (event: flash.events.Event) => void;
    onHTTPStatus: (event: flash.events.Event) => void;
    cleanUp: () => void;
    httpStatus: number /*uint*/;
    urlLoader: flash.net.URLLoader;
    networkTimeOutTimer: flash.utils.Timer;
    isDownloading: boolean;
    // Instance AS -> JS Bindings
    iOnDownloadComplete(result: flash.utils.ByteArray): void {
      result = result;
      notImplemented("packageInternal flash.net.drm.DRMURLDownloadContext::iOnDownloadComplete"); return;
    }
    iOnIOError(errorCode: number /*uint*/, msg: string): void {
      errorCode = errorCode >>> 0; msg = "" + msg;
      notImplemented("packageInternal flash.net.drm.DRMURLDownloadContext::iOnIOError"); return;
    }
    iOnSecurityError(msg: string): void {
      msg = "" + msg;
      notImplemented("packageInternal flash.net.drm.DRMURLDownloadContext::iOnSecurityError"); return;
    }
  }
}
