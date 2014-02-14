/*
 * Copyright 2014 Mozilla Foundation
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

package flash.text.engine {
import flash.display.DisplayObject;
import flash.display.DisplayObjectContainer;
import flash.errors.IllegalOperationError;
import flash.events.EventDispatcher;
import flash.geom.Rectangle;
import flash.ui.ContextMenu;

[native(cls='TextLineClass')]
public final class TextLine extends DisplayObjectContainer {
  public static const MAX_LINE_WIDTH: int = 1000000;
  public function TextLine() {}
  public var userData: *;
  public override function set focusRect(focusRect: Object): void {
    Error.throwError(IllegalOperationError, 2181);
  }
  public override function set tabChildren(enable: Boolean): void {
    Error.throwError(IllegalOperationError, 2181);
  }
  public override function set tabEnabled(enabled: Boolean): void {
    Error.throwError(IllegalOperationError, 2181);
  }
  public override function set tabIndex(index: int): void {
    Error.throwError(IllegalOperationError, 2181);
  }
  public override function set contextMenu(value: ContextMenu): void {
    Error.throwError(IllegalOperationError, 2181);
  }
  public native function get textBlock(): TextBlock;
  public native function get hasGraphicElement(): Boolean;
  public native function get hasTabs(): Boolean;
  public native function get nextLine(): TextLine;
  public native function get previousLine(): TextLine;
  public native function get ascent(): Number;
  public native function get descent(): Number;
  public native function get textHeight(): Number;
  public native function get textWidth(): Number;
  public native function get totalAscent(): Number;
  public native function get totalDescent(): Number;
  public native function get totalHeight(): Number;
  public native function get textBlockBeginIndex(): int;
  public native function get rawTextLength(): int;
  public native function get specifiedWidth(): Number;
  public native function get unjustifiedTextWidth(): Number;
  public native function get validity(): String;
  public native function set validity(value: String): void;
  public native function get atomCount(): int;
  public native function get mirrorRegions(): Vector.<TextLineMirrorRegion>;
  public function getMirrorRegion(mirror: EventDispatcher): TextLineMirrorRegion {
    var regions: Vector.<TextLineMirrorRegion> = this.mirrorRegions;
    for (var i: int = 0; i < regions.length; i++) {
      if (regions[i].mirror === mirror) {
        return regions[i];
      }
    }
    return null;
  }
  public function flushAtomData(): void {
    // This space intentionally left blank.
  }
  public native function getAtomIndexAtPoint(stageX: Number, stageY: Number): int;
  public native function getAtomIndexAtCharIndex(charIndex: int): int;
  public native function getAtomBounds(atomIndex: int): Rectangle;
  public native function getAtomBidiLevel(atomIndex: int): int;
  public native function getAtomTextRotation(atomIndex: int): String;
  public native function getAtomTextBlockBeginIndex(atomIndex: int): int;
  public native function getAtomTextBlockEndIndex(atomIndex: int): int;
  public native function getAtomCenter(atomIndex: int): Number;
  public native function getAtomWordBoundaryOnLeft(atomIndex: int): Boolean;
  public native function getAtomGraphic(atomIndex: int): DisplayObject;
  public native function getBaselinePosition(baseline: String): Number;
  public native function dump(): String;
}
}
