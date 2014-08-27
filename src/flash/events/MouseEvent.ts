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
// Class: MouseEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  export class MouseEvent extends flash.events.Event {

    static classInitializer: any = null;
    static initializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = ["clone!"];

    constructor(type: string, bubbles: boolean = true, cancelable: boolean = false,
                localX: number = undefined, localY: number = undefined,
                relatedObject: flash.display.InteractiveObject = null, ctrlKey: boolean = false,
                altKey: boolean = false, shiftKey: boolean = false, buttonDown: boolean = false,
                delta: number /*int*/ = 0) {
      super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.MouseEvent");
    }

    // JS -> AS Bindings
    static CLICK: string = "click";
    static DOUBLE_CLICK: string = "doubleClick";
    static MOUSE_DOWN: string = "mouseDown";
    static MOUSE_MOVE: string = "mouseMove";
    static MOUSE_OUT: string = "mouseOut";
    static MOUSE_OVER: string = "mouseOver";
    static MOUSE_UP: string = "mouseUp";
    static RELEASE_OUTSIDE: string = "releaseOutside";
    static MOUSE_WHEEL: string = "mouseWheel";
    static ROLL_OUT: string = "rollOut";
    static ROLL_OVER: string = "rollOver";
    static MIDDLE_CLICK: string = "middleClick";
    static MIDDLE_MOUSE_DOWN: string = "middleMouseDown";
    static MIDDLE_MOUSE_UP: string = "middleMouseUp";
    static RIGHT_CLICK: string = "rightClick";
    static RIGHT_MOUSE_DOWN: string = "rightMouseDown";
    static RIGHT_MOUSE_UP: string = "rightMouseUp";
    static CONTEXT_MENU: string = "contextMenu";

    /**
     * AS3 mouse event names don't match DOM even names, so map them here.
     */
    static typeFromDOMType(name: string): string {
      switch (name) {
        case "click":
          return MouseEvent.CLICK;
        case "dblclick":
          return MouseEvent.DOUBLE_CLICK;
        case "mousedown":
          return MouseEvent.MOUSE_DOWN;
        case "mousemove":
          return MouseEvent.MOUSE_MOVE;
        //case "mouseout":
        //  return MouseEvent.MOUSE_OUT;
        //case "mouseover":
        //  return MouseEvent.MOUSE_OVER;
        case "mouseup":
          return MouseEvent.MOUSE_UP;
        default:
          notImplemented(name);
          // return MouseEvent.RELEASE_OUTSIDE;
          // return MouseEvent.MOUSE_WHEEL;
          // return MouseEvent.ROLL_OUT;
          // return MouseEvent.ROLL_OVER;
          // return MouseEvent.MIDDLE_CLICK;
          // return MouseEvent.MIDDLE_MOUSE_DOWN;
          // return MouseEvent.MIDDLE_MOUSE_UP;
          // return MouseEvent.RIGHT_CLICK;
          // return MouseEvent.RIGHT_MOUSE_DOWN;
          // return MouseEvent.RIGHT_MOUSE_UP;
          // return MouseEvent.CONTEXT_MENU;
      }
    }
    clone: () => flash.events.Event;

    // AS -> JS Bindings
    private _localX: number;
    private _localY: number;
    private _movementX: number;
    private _movementY: number;

    private _position: flash.geom.Point;

    get localX(): number {
      return (this._localX / 20) | 0;
    }

    set localX(value: number) {
      this._localX = (value * 20) | 0;
    }

    get localY(): number {
      return (this._localY / 20) | 0;
    }

    set localY(value: number) {
      this._localY = (value * 20) | 0;
    }

    get movementX(): number {
      somewhatImplemented("public flash.events.MouseEvent::set movementX");
      return this._movementX || 0;
    }

    set movementX(value: number) {
      this._movementX = +value;
    }

    get movementY(): number {
      somewhatImplemented("public flash.events.MouseEvent::set movementY");
      return this._movementY || 0;
    }

    set movementY(value: number) {
      this._movementY = +value;
    }

    updateAfterEvent(): void {
      Shumway.AVM2.Runtime.AVM2.instance.globals['Shumway.Player.Utils'].requestRendering();
    }

    private _getGlobalPoint(): flash.geom.Point {
      var point = this._position;
      if (!point) {
        point = this._position = new flash.geom.Point();
      }
      if (this.target) {
        point.setTo(this._localX, this._localY);
        var m = (<flash.display.DisplayObject>this._target)._getConcatenatedMatrix();
        m.transformPointInPlace(point);
      } else {
        point.setTo(0, 0);
      }
      return point;
    }

    getStageX(): number {
      return (this._getGlobalPoint().x / 20) | 0;
    }

    getStageY(): number {
      return (this._getGlobalPoint().y / 20) | 0;
    }
  }
}
