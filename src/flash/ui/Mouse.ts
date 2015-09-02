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
// Class: Mouse
module Shumway.AVMX.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import assert = Shumway.Debug.assert;

  import axCoerceString = Shumway.AVMX.axCoerceString;
  import InteractiveObject = flash.display.InteractiveObject;

  import events = flash.events;

  /**
   * Dispatches AS3 mouse events.
   */
  export class MouseEventDispatcher {
    stage: flash.display.Stage = null;
    currentTarget: flash.display.InteractiveObject = null;

    /**
     * Finds the interactive object on which the event is dispatched.
     */
    private _findTarget(point: flash.geom.Point,
                        testingType: flash.display.HitTestingType): flash.display.DisplayObject {
      var globalX = point.x * 20 | 0;
      var globalY = point.y * 20 | 0;
      var objects = [];
      this.stage._containsGlobalPoint(globalX, globalY, testingType, objects);
      release || assert(objects.length < 2);
      if (objects.length) {
        return objects[0];
      }
      return objects.length ? objects[0] : null;
    }

    /**
     * Converts DOM mouse event data into AS3 mouse events.
     */
    private _dispatchMouseEvent(target: flash.display.InteractiveObject, type: string,
                                data: MouseEventAndPointData,
                                relatedObject: flash.display.InteractiveObject = null) {
      var localPoint = target.globalToLocal(data.point);
      var event = new this.stage.sec.flash.events.MouseEvent (
        type,
        type !== events.MouseEvent.ROLL_OVER &&
        type !== events.MouseEvent.ROLL_OUT &&
        type !== events.MouseEvent.MOUSE_LEAVE,
        false,
        localPoint.x,
        localPoint.y,
        relatedObject,
        data.ctrlKey,
        data.altKey,
        data.shiftKey,
        !!data.buttons
      );
      target.dispatchEvent(event);
    }

    /**
     * Handles the mouse event and returns the target on which the event was dispatched.
     */
    public handleMouseEvent(data: MouseEventAndPointData): InteractiveObject {
      var stage = this.stage;
      if (!stage) {
        return stage;
      }

      var globalPoint = data.point;
      var mouseClass = this.stage.sec.flash.ui.Mouse.axClass;
      mouseClass.updateCurrentPosition(globalPoint);

      var currentTarget = this.currentTarget;
      var target: InteractiveObject = null;

      var type = flash.events.MouseEvent.typeFromDOMType(data.type);

      if (globalPoint.x >= 0 && globalPoint.x < stage.stageWidth &&
          globalPoint.y >= 0 && globalPoint.y < stage.stageHeight) {
        target = <InteractiveObject>this._findTarget(globalPoint, flash.display.HitTestingType.Mouse) || this.stage;
      } else {
        if (!currentTarget) {
          return stage;
        }
        this._dispatchMouseEvent(stage, events.MouseEvent.MOUSE_LEAVE, data);
        if (type !== events.MouseEvent.MOUSE_MOVE) {
          return stage;
        }
      }

      if (mouseClass.draggableObject) {
        var dropTarget = this._findTarget(globalPoint, flash.display.HitTestingType.Drop);
        mouseClass.draggableObject._updateDragState(dropTarget);
      }

      switch (type) {
        case events.MouseEvent.MOUSE_DOWN:
          if (data.buttons & MouseButtonFlags.Left) {
            data.buttons = MouseButtonFlags.Left;
          } else if (data.buttons & MouseButtonFlags.Middle) {
            type = events.MouseEvent.MIDDLE_MOUSE_DOWN;
            data.buttons = MouseButtonFlags.Middle;
          } else if (data.buttons & MouseButtonFlags.Right) {
            type = events.MouseEvent.RIGHT_MOUSE_DOWN;
            data.buttons = MouseButtonFlags.Right;
          }
          target._mouseDown = true;
          break;
        case events.MouseEvent.MOUSE_UP:
          if (data.buttons & MouseButtonFlags.Left) {
            data.buttons = MouseButtonFlags.Left;
          } else if (data.buttons & MouseButtonFlags.Middle) {
            type = events.MouseEvent.MIDDLE_MOUSE_UP;
            data.buttons = MouseButtonFlags.Middle;
          } else if (data.buttons & MouseButtonFlags.Right) {
            type = events.MouseEvent.RIGHT_MOUSE_UP;
            data.buttons = MouseButtonFlags.Right;
          }
          target._mouseDown = false;
          break;
        case events.MouseEvent.CLICK:
          if (!(data.buttons & MouseButtonFlags.Left)) {
            if (data.buttons & MouseButtonFlags.Middle) {
              type = events.MouseEvent.MIDDLE_CLICK;
            } else if (data.buttons & MouseButtonFlags.Right) {
              type = events.MouseEvent.RIGHT_CLICK;
            }
          }
          data.buttons = 0;
          break;
        case events.MouseEvent.DOUBLE_CLICK:
          if (!target.doubleClickEnabled) {
            return;
          }
          data.buttons = 0;
          break;
        case events.MouseEvent.MOUSE_MOVE:
          this.currentTarget = target;
          data.buttons &= MouseButtonFlags.Left;
          if (target === currentTarget) {
            break;
          }
          var commonAncestor = target ? target.findNearestCommonAncestor(currentTarget) : stage;
          if (currentTarget && currentTarget !== stage) {
            currentTarget._mouseOver = false;
            // TODO: Support track as menu.
            currentTarget._mouseDown = false;
            this._dispatchMouseEvent(currentTarget, events.MouseEvent.MOUSE_OUT, data, target);
            var nodeLeft = currentTarget;
            while (nodeLeft && nodeLeft !== commonAncestor) {
              this._dispatchMouseEvent(nodeLeft, events.MouseEvent.ROLL_OUT, data, target);
              nodeLeft = nodeLeft.parent;
            }
          }
          if (!target) {
            return stage;
          }
          if (target === stage) {
            break;
          }
          var nodeEntered = target;
          while (nodeEntered && nodeEntered !== commonAncestor) {
            this._dispatchMouseEvent(nodeEntered, events.MouseEvent.ROLL_OVER, data, currentTarget);
            nodeEntered = nodeEntered.parent;
          }
          target._mouseOver = true;
          this._dispatchMouseEvent(target, events.MouseEvent.MOUSE_OVER, data, currentTarget);
          return target;
      }
      // TODO: handle MOUSE_WHEEL and MOUSE_RELEASE_OUTSIDE
      this._dispatchMouseEvent(target, type, data);
      return target;
    }
  }

  export const enum MouseButtonFlags {
    Left    = 0x01,
    Middle  = 0x02,
    Right   = 0x04
  }

  export interface MouseEventAndPointData {
    type: string;
    point: flash.geom.Point;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    buttons: MouseButtonFlags;
  }

  export class Mouse extends ASObject {

    static axClass: typeof Mouse;

    // Called whenever the class is initialized.
    static classInitializer() {
      this._currentPosition = new this.sec.flash.geom.Point();
      this._cursor = MouseCursor.AUTO;
      this.draggableObject = null;
    }
    
    constructor () {
      super();
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    //static _supportsCursor: boolean;
    static _cursor: string;
    //static _supportsNativeCursor: boolean;

    static get supportsCursor(): boolean {
      return true;
    }
    static get cursor(): string {
      return this._cursor;
    }
    static set cursor(value: string) {
      value = axCoerceString(value);
      if (MouseCursor.toNumber(value) < 0) {
        this.sec.throwError("ArgumentError", Errors.InvalidParamError, "cursor");
      }
      this._cursor = value;
    }
    static get supportsNativeCursor(): boolean {
      return true;
    }
    static hide(): void {
      somewhatImplemented("public flash.ui.Mouse::static hide"); return;
    }
    static show(): void {
      somewhatImplemented("public flash.ui.Mouse::static show"); return;
    }
    static registerCursor(name: string, cursor: flash.ui.MouseCursorData): void {
      name = axCoerceString(name); cursor = cursor;
      notImplemented("public flash.ui.Mouse::static registerCursor"); return;
    }
    static unregisterCursor(name: string): void {
      name = axCoerceString(name);
      notImplemented("public flash.ui.Mouse::static unregisterCursor"); return;
    }

    static _currentPosition: flash.geom.Point;

    /**
     * Remembers the current mouse position.
     */
    public static updateCurrentPosition(value: flash.geom.Point) {
      this._currentPosition.copyFrom(value);
    }

    static draggableObject: flash.display.Sprite;
  }
}
