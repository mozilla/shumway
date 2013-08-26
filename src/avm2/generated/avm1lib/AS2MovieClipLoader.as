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
  import avm1lib.AS2Broadcaster;
  import avm1lib.AS2Utils;
  import flash.display.Loader;
  import flash.net.URLRequest;

  [native(cls="AS2MovieClipLoader")]
  public dynamic class AS2MovieClipLoader extends Object {
    public var _broadcastEventsRegistrationNeeded: Boolean = true;
    public var _broadcastEvents : Array = ['onLoadComplete', 'onLoadError', 'onLoadError', 'onLoadInit', 'onLoadProgress', 'onLoadStart'];

    public function AS2MovieClipLoader()
    {
      AS2Broadcaster.initialize(this);
      $nativeObject = new flash.display.Loader();
    }

    public var $nativeObject: flash.display.Loader;

    public function loadClip(url: String, target: Object) : Boolean
    {
      var nativeObject = this.$nativeObject;
      var nativeTarget = AS2Utils.resolveTarget(target);
      nativeTarget.$nativeObject.addChild(nativeObject);
      nativeObject.load(new flash.net.URLRequest(url));
    }

    private native function get _bytesLoaded() : Number;

    public function getProgress(target: Object) : Object
    {
      return _bytesLoaded;
    }

    public function unloadClip(target: Object) : Boolean
    {
      var nativeObject = this.$nativeObject;
      var nativeTarget = AS2Utils.resolveTarget(target);
      nativeTarget.$nativeObject.removeChild(nativeObject);
    }

    {
      AS2Utils.addEventHandlerProxy(prototype, 'onLoadComplete', 'complete', function (e) { return [e.target, 200]; }); // HTTP code ?
      AS2Utils.addEventHandlerProxy(prototype, 'onLoadError', 'ioError', function (e) { return [e.target, 1, 501]; }); // Error and HTTP code ?
      AS2Utils.addEventHandlerProxy(prototype, 'onLoadInit', 'init', function (e) { return [e.target]; });
      AS2Utils.addEventHandlerProxy(prototype, 'onLoadProgress', 'progress', function (e) { return [e.target, e.bytesLoaded, e.bytesTotal]; });
      AS2Utils.addEventHandlerProxy(prototype, 'onLoadStart', 'open', function (e) { return [e.target]; });
    }
  }
}
