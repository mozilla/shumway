/**
 * Copyright 2014 Mozilla Foundation
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
// Class: TouchEvent
module Shumway.AVMX.AS.flash.events {
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  export class TouchEvent extends flash.events.Event {

    static classInitializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor(type: string, bubbles: boolean = true, cancelable: boolean = false,
                touchPointID: number /*int*/ = 0, isPrimaryTouchPoint: boolean = false,
                localX: number = NaN, localY: number = NaN, sizeX: number = NaN,
                sizeY: number = NaN, pressure: number = NaN,
                relatedObject: flash.display.InteractiveObject = null, ctrlKey: boolean = false,
                altKey: boolean = false, shiftKey: boolean = false) {
      super(type, bubbles, cancelable);
    }

    // JS -> AS Bindings
    static TOUCH_BEGIN: string = "touchBegin";
    static TOUCH_END: string = "touchEnd";
    static TOUCH_MOVE: string = "touchMove";
    static TOUCH_OVER: string = "touchOver";
    static TOUCH_OUT: string = "touchOut";
    static TOUCH_ROLL_OVER: string = "touchRollOver";
    static TOUCH_ROLL_OUT: string = "touchRollOut";
    static TOUCH_TAP: string = "touchTap";
    static PROXIMITY_BEGIN: string = "proximityBegin";
    static PROXIMITY_END: string = "proximityEnd";
    static PROXIMITY_MOVE: string = "proximityMove";
    static PROXIMITY_OUT: string = "proximityOut";
    static PROXIMITY_OVER: string = "proximityOver";
    static PROXIMITY_ROLL_OUT: string = "proximityRollOut";
    static PROXIMITY_ROLL_OVER: string = "proximityRollOver";

    private _touchPointID:  number;
    private _isPrimaryTouchPoint: boolean;
    private _localX: number;
    private _localY: number;
    private _sizeX: number;
    private _sizeY: number;
    private _pressure: number;
    private _relatedObject: display.InteractiveObject;
    private _ctrlKey: boolean;
    private _altKey: boolean;
    private _shiftKey: boolean;
    private _isRelatedObjectInaccessible: boolean;


    get touchPointID() {
      return this._touchPointID;
    }
    set touchPointID(value: number) {
      this._touchPointID = +value;
    }
    get isPrimaryTouchPoint(): boolean {
      return this._isPrimaryTouchPoint;
    }
    set isPrimaryTouchPoint(value: boolean) {
      this._isPrimaryTouchPoint = !!value;
    }
    get localX(): number {
      return this._localX;
    }
    set localX(value: number) {
      this._localX = +value;
    }
    get localY(): number {
      return this._localY;
    }
    set localY(value: number) {
      this._localY = +value;
    }
    get sizeX(): number {
      return this._sizeX;
    }
    set sizeX(value: number) {
      this._sizeX = +value;
    }
    get sizeY(): number {
      return this._sizeY;
    }
    set sizeY(value: number) {
      this._sizeY = +value;
    }
    get pressure(): number {
      return this._pressure;
    }
    set pressure(value: number) {
      this._pressure = +value;
    }
    get relatedObject(): display.InteractiveObject {
      return this._relatedObject;
    }
    set relatedObject(value: display.InteractiveObject) {
      this._relatedObject = value;
    }
    get ctrlKey(): boolean {
      return this._ctrlKey;
    }
    set ctrlKey(value: boolean) {
      this._ctrlKey = !!value;
    }
    get altKey(): boolean {
      return this._altKey;
    }
    set altKey(value: boolean) {
      this._altKey = !!value;
    }
    get shiftKey(): boolean {
      return this._shiftKey;
    }
    set shiftKey(value: boolean) {
      this._shiftKey = !!value;
    }

    get stageX(): number {
      somewhatImplemented('TouchEvent::get stageX');
      return this._localX;
    }
    get stageY(): number {
      somewhatImplemented('TouchEvent::get stageY');
      return this._localY;
    }

    get isRelatedObjectInaccessible(): boolean {
      return this._isRelatedObjectInaccessible;
    }
    set isRelatedObjectInaccessible(value: boolean) {
      this._isRelatedObjectInaccessible = value;
    }

    clone(): Event {
      return new this.sec.flash.events.TouchEvent(this.type, this.bubbles,
                                                             this.cancelable, this.touchPointID,
                                                             this.isPrimaryTouchPoint, this.localX,
                                                             this.localY, this.sizeX, this.sizeY,
                                                             this.pressure, this.relatedObject,
                                                             this.ctrlKey, this.altKey,
                                                             this.shiftKey);
    }
    toString(): string {
      return this.formatToString('TouchEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                                 'touchPointID', 'isPrimaryTouchPoint', 'localX', 'localY', 'sizeX',
                                 'sizeY', 'pressure', 'relatedObject', 'ctrlKey', 'altKey',
                                 'shiftKey');
    }

    updateAfterEvent(): void {
      this.sec.player.requestRendering();
    }
  }
}
