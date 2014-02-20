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

package flash.display {
public final class GraphicsPath implements IGraphicsPath, IGraphicsData {
  public function GraphicsPath(commands:Vector.<int> = null, data:Vector.<Number> = null,
                               winding:String = "evenOdd")
  {
    this.commands = commands;
    this.data = data;
    if (!(winding === GraphicsPathWinding.EVEN_ODD || winding === GraphicsPathWinding.NON_ZERO)) {
      Error.throwError(ArgumentError, 2008, "winding");
    }
    _winding = winding;
  }
  public var commands:Vector.<int>;
  public var data:Vector.<Number>;
  private var _winding:String;
  public function get winding():String {
    return _winding;
  }
  public function set winding(value:String):void {
    if (!(winding === GraphicsPathWinding.EVEN_ODD || winding === GraphicsPathWinding.NON_ZERO)) {
      Error.throwError(ArgumentError, 2008, "winding");
    }
    _winding = value;
  }
  public function moveTo(x:Number, y:Number):void {
    ensureLists();
    commands.push(GraphicsPathCommand.MOVE_TO);
    data.push(x, y);
  }
  public function lineTo(x:Number, y:Number):void {
    ensureLists();
    commands.push(GraphicsPathCommand.LINE_TO);
    data.push(x, y);
  }
  public function curveTo(controlX:Number, controlY:Number, anchorX:Number,
                          anchorY:Number):void
  {
    ensureLists();
    commands.push(GraphicsPathCommand.CURVE_TO);
    data.push(controlX, controlY, anchorX, anchorY);
  }
  public function cubicCurveTo(controlX1:Number, controlY1:Number, controlX2:Number,
                               controlY2:Number, anchorX:Number,
                               anchorY:Number):void
  {
    ensureLists();
    commands.push(GraphicsPathCommand.CUBIC_CURVE_TO);
    data.push(controlX1, controlY1, controlX2, controlY2, anchorX, anchorY);
  }
  public function wideLineTo(x:Number, y:Number):void {
    ensureLists();
    commands.push(GraphicsPathCommand.WIDE_LINE_TO);
    data.push(.0, .0, x, y);
  }
  public function wideMoveTo(x:Number, y:Number):void {
    ensureLists();
    commands.push(GraphicsPathCommand.WIDE_MOVE_TO);
    data.push(.0, .0, x, y);
  }
  private function ensureLists():void {
    if (!commands) {
      commands = new Vector.<int>();
    }
    if (!data) {
      data = new Vector.<Number>();
    }
  }
}
}
