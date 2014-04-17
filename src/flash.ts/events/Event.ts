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
// Class: Event
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class Event extends ASNative {

    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["formatToString", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false) {
      type = asCoerceString(type); bubbles = !!bubbles; cancelable = !!cancelable;
      false && super();
      this._type = type;
      this._bubbles = bubbles;
      this._cancelable = cancelable;

      this._target = null;
      this._currentTarget = null;
      this._eventPhase = EventPhase.AT_TARGET;

      this._stopPropagation = false;
      this._stopImmediatePropagation = false;
      this._isDefaultPrevented = false;
    }
    
    // JS -> AS Bindings
    static ACTIVATE: string = "activate";
    static ADDED: string = "added";
    static ADDED_TO_STAGE: string = "addedToStage";
    static CANCEL: string = "cancel";
    static CHANGE: string = "change";
    static CLEAR: string = "clear";
    static CLOSE: string = "close";
    static COMPLETE: string = "complete";
    static CONNECT: string = "connect";
    static COPY: string = "copy";
    static CUT: string = "cut";
    static DEACTIVATE: string = "deactivate";
    static ENTER_FRAME: string = "enterFrame";
    static FRAME_CONSTRUCTED: string = "frameConstructed";
    static EXIT_FRAME: string = "exitFrame";
    static FRAME_LABEL: string = "frameLabel";
    static ID3: string = "id3";
    static INIT: string = "init";
    static MOUSE_LEAVE: string = "mouseLeave";
    static OPEN: string = "open";
    static PASTE: string = "paste";
    static REMOVED: string = "removed";
    static REMOVED_FROM_STAGE: string = "removedFromStage";
    static RENDER: string = "render";
    static RESIZE: string = "resize";
    static SCROLL: string = "scroll";
    static TEXT_INTERACTION_MODE_CHANGE: string = "textInteractionModeChange";
    static SELECT: string = "select";
    static SELECT_ALL: string = "selectAll";
    static SOUND_COMPLETE: string = "soundComplete";
    static TAB_CHILDREN_CHANGE: string = "tabChildrenChange";
    static TAB_ENABLED_CHANGE: string = "tabEnabledChange";
    static TAB_INDEX_CHANGE: string = "tabIndexChange";
    static UNLOAD: string = "unload";
    static FULLSCREEN: string = "fullScreen";
    static CONTEXT3D_CREATE: string = "context3DCreate";
    static TEXTURE_READY: string = "textureReady";
    static VIDEO_FRAME: string = "videoFrame";
    static SUSPEND: string = "suspend";
    static CHANNEL_MESSAGE: string = "channelMessage";
    static CHANNEL_STATE: string = "channelState";
    static WORKER_STATE: string = "workerState";
    
    formatToString: (className: string) => string;
    clone: () => flash.events.Event;

    // AS -> JS Bindings
    
    _type: string;
    _bubbles: boolean;
    _cancelable: boolean;

    _target: Object;
    _currentTarget: Object;
    _eventPhase: number /*uint*/;

    _stopPropagation: boolean;
    _stopImmediatePropagation: boolean;
    _isDefaultPrevented: boolean;

    get type(): string {
      return this._type;
    }
    get bubbles(): boolean {
      return this._bubbles;
    }
    get cancelable(): boolean {
      return this._cancelable;
    }
    get target(): Object {
      return this._target;
    }
    get currentTarget(): Object {
      return this._currentTarget;
    }
    get eventPhase(): number /*uint*/ {
      return this._eventPhase;
    }
    stopPropagation(): void {
      this._stopPropagation = true;
    }
    stopImmediatePropagation(): void {
      this._stopImmediatePropagation = this._stopPropagation = true;
    }
    preventDefault(): void {
      if (this._cancelable) {
        this._isDefaultPrevented = true;
      }
    }
    isDefaultPrevented(): boolean {
      return this._isDefaultPrevented;
    }
  }
}
