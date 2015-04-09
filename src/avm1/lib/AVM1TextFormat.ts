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

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import flash = Shumway.AVMX.AS.flash;

  export class AVM1TextFormat extends AVM1Proxy<flash.text.TextFormat> {
    static createAVM1Class(context: AVM1Context): AVM1Object {
      return AVM1Proxy.wrap<flash.text.TextFormat>(context, AVM1TextFormat, [], ['getTextExtent']);
    }

    public avm1Constructor(font?: string, size?: number, color?: number, bold?: boolean,
                italic?: boolean, underline?: boolean, url?: string, target?: string,
                align?: string, leftMargin?: number, rightMargin?: number,
                indent?: number, leading?: number) {
      var as3Object = new this.context.sec.flash.text.TextFormat(); // REDUX parameters
      super.setTarget(as3Object);
    }

    private static _measureTextField: flash.text.TextField; // REDUX security domain

    public getTextExtent(text: string, width?: number) {
      text = alCoerceString(this.context, text);
      width = +width;

      var measureTextField = AVM1TextFormat._measureTextField;
      if (!measureTextField) {
        measureTextField = new flash.text.TextField();
        measureTextField.multiline = true;
        AVM1TextFormat._measureTextField = measureTextField;
      }

      if (!isNaN(width) && width > 0) {
        measureTextField.width = width + 4;
        measureTextField.wordWrap = true;
      } else {
        measureTextField.wordWrap = false;
      }
      measureTextField.defaultTextFormat = undefined; // REDUX this;
      measureTextField.text = text;
      var result: AVM1Object = alNewObject(this.context);
      var textWidth = measureTextField.textWidth;
      var textHeight = measureTextField.textHeight;
      result.alPut('width', textWidth);
      result.alPut('height', textHeight);
      result.alPut('textFieldWidth', textWidth + 4);
      result.alPut('textFieldHeight', textHeight + 4);
      var metrics = measureTextField.getLineMetrics(0);
      result.alPut('ascent',
        metrics.asGetPublicProperty('ascent'));
      result.alPut('descent',
        metrics.asGetPublicProperty('descent'));
      return result;
    }
  }
}
