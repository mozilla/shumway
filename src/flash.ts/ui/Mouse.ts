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
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
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
    private _findTarget(point: flash.geom.Point): InteractiveObject {
      var objects = this.stage.getObjectsUnderMouse(point);
      var target: InteractiveObject;
      var i = objects.length;
      while (i--) {
        var object = objects[i];
        if (!flash.display.InteractiveObject.isType(object)) {
          var j = i;
          while (j--) {
            var sibling = objects[j];
            if (sibling._parent === object._parent && InteractiveObject.isType(sibling)) {
              object = sibling;
              i = j;
            }
          }
        }
        target = object.findFurthestInteractiveAncestorOrSelf();
        if (!target) {
          continue;
        }
        if (target.mouseEnabled) {
          break;
        }
        if (flash.display.Sprite.isType(target)) {
          var hitTarget = (<flash.display.Sprite>target)._hitTarget;
          if (hitTarget && hitTarget.mouseEnabled) {
            target = hitTarget;
            break;
          }
        }
      }
      return target;
    }

    /**
     * Converts DOM mouse event data into AS3 mouse events.
     */
    private _dispatchMouseEvent(target: flash.display.InteractiveObject, type: string, data: MouseEventAndPointData, relatedObject: flash.display.InteractiveObject = null) {
      var localPoint = target.globalToLocal(data.point).toTwips();
      var event = new events.MouseEvent (
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

    // TODO: handle MOUSE_WHEEL and MOUSE_RELEASE_OUTSIDE
    public handleMouseEvent(data: MouseEventAndPointData) {
      var stage = this.stage;
      if (!stage) {
        return;
      }

      var globalPoint = data.point;
      var currentTarget = this.currentTarget;

      if (globalPoint.x < 0 || globalPoint.x > stage.stageWidth ||
          globalPoint.y < 0 || globalPoint.y > stage.stageHeight)
      {
        if (currentTarget) {
          this._dispatchMouseEvent(stage, events.MouseEvent.MOUSE_LEAVE, data);
        }
        this.currentTarget = null;
        return;
      }

      var target = this._findTarget(globalPoint) || stage;
      var type = flash.events.MouseEvent.typeFromDOMType(data.type);
      switch (type) {
        //case events.MouseEvent.MOUSE_OVER:
        //case events.MouseEvent.MOUSE_OUT:
        //  return;
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
          var commonAncestor = target.findNearestCommonAncestor(currentTarget) || stage;
          if (currentTarget && currentTarget !== stage) {
            this._dispatchMouseEvent(currentTarget, events.MouseEvent.MOUSE_OUT, data, target);
            var nodeLeft = currentTarget;
            while (nodeLeft !== commonAncestor) {
              this._dispatchMouseEvent(nodeLeft, events.MouseEvent.ROLL_OUT, data, target);
              nodeLeft = nodeLeft.parent;
            }
          }
          if (target === stage) {
            break;
          }
          var nodeEntered = target;
          while (nodeEntered !== commonAncestor) {
            this._dispatchMouseEvent(nodeEntered, events.MouseEvent.ROLL_OVER, data, currentTarget);
            nodeEntered = nodeEntered.parent;
          }
          this._dispatchMouseEvent(target, events.MouseEvent.MOUSE_OVER, data, currentTarget);
          return;
      }
      this._dispatchMouseEvent(target, type, data);
    }
  }

  export enum MouseButtonFlags {
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

  export class Mouse extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.ui.Mouse");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    // static _supportsCursor: boolean;
    // static _cursor: string;
    // static _supportsNativeCursor: boolean;
    get supportsCursor(): boolean {
      notImplemented("public flash.ui.Mouse::get supportsCursor"); return;
      // return this._supportsCursor;
    }
    get cursor(): string {
      notImplemented("public flash.ui.Mouse::get cursor"); return;
      // return this._cursor;
    }
    set cursor(value: string) {
      value = asCoerceString(value);
      notImplemented("public flash.ui.Mouse::set cursor"); return;
      // this._cursor = value;
    }
    get supportsNativeCursor(): boolean {
      notImplemented("public flash.ui.Mouse::get supportsNativeCursor"); return;
      // return this._supportsNativeCursor;
    }
    static hide(): void {
      notImplemented("public flash.ui.Mouse::static hide"); return;
    }
    static show(): void {
      notImplemented("public flash.ui.Mouse::static show"); return;
    }
    static registerCursor(name: string, cursor: flash.ui.MouseCursorData): void {
      name = asCoerceString(name); cursor = cursor;
      notImplemented("public flash.ui.Mouse::static registerCursor"); return;
    }
    static unregisterCursor(name: string): void {
      name = asCoerceString(name);
      notImplemented("public flash.ui.Mouse::static unregisterCursor"); return;
    }

    private static _currentPosition: flash.geom.Point;

    public static set currentPosition(value: flash.geom.Point) {
      this._currentPosition = value;
    }

    public static get currentPosition(): flash.geom.Point {
      return this._currentPosition;
    }
  }
}
