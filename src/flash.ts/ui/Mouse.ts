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
  import Point = flash.geom.Point;

  /**
   * Dispatches AS3 mouse events.
   */
  export class MouseEventDispatcher {
    stage: flash.display.Stage;

    /**
     * Finds the interactive object on which the event is dispatched.
     */
    private _findTarget(point: Point): InteractiveObject {
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
        target = object.getOldestInteractiveAncestorOrSelf();
        if (!target) {
          continue;
        }
        if (target.mouseEnabled) {
          break;
        }
        if (flash.display.Sprite.isType(target)) {
          var hitTarget = (<flash.display.Sprite>target)._hitTarget;
          if (hitTarget && hitTarget.mouseEnabled) {
            break;
          }
        }
      }
      return target;
    }

    /**
     * Converts JS mouse events into AS3 mouse events.
     */
    public dispatchMouseEvent(e: MouseEvent, point: Point) {
      if (!this.stage) {
        return;
      }
      var target = this._findTarget(point);
      if (target) {
        var type = flash.events.MouseEvent.typeFromDOMType(e.type);
        if (type === "click") {
          target.alpha = target.alpha === 1 ? 0.5 : 1.0;
        }
        // TODO: Create proper event objects.
        var event = new flash.events.MouseEvent (
          type
        );
        target.dispatchEvent(event);
      }
    }
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

    private static _currentPosition: Point;

    public static set currentPosition(value: Point) {
      this._currentPosition = value;
    }

    public static get currentPosition(): Point {
      return this._currentPosition;
    }
  }
}
