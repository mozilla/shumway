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
  import flash = Shumway.AVM2.AS.flash;
  import asCoerceString = Shumway.AVMX.asCoerceString;

  export class AVM1TextFormat extends flash.text.TextFormat {
    static createAVM1Class(): typeof AVM1TextFormat {
      return AVM1Proxy.wrap(AVM1TextFormat, {
        methods: ['getTextExtent']
      });
    }

    constructor(font?: string, size?: number, color?: number, bold?: boolean,
                italic?: boolean, underline?: boolean, url?: string, target?: string,
                align?: string, leftMargin?: number, rightMargin?: number,
                indent?: number, leading?: number) {
      false && super(font, size, color, bold, italic, underline, url, target, align, leftMargin, rightMargin, indent, leading);
      flash.text.TextFormat.apply(this, arguments);
    }

    private static _measureTextField: flash.text.TextField;

    public getTextExtent(text: string, width?: number) {
      text = asCoerceString(text);
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
      measureTextField.defaultTextFormat = this;
      measureTextField.text = text;
      var result = {};
      var textWidth = measureTextField.textWidth;
      var textHeight = measureTextField.textHeight;
      result.axSetPublicProperty('width', textWidth);
      result.axSetPublicProperty('height', textHeight);
      result.axSetPublicProperty('textFieldWidth', textWidth + 4);
      result.axSetPublicProperty('textFieldHeight', textHeight + 4);
      var metrics = measureTextField.getLineMetrics(0);
      result.axSetPublicProperty('ascent',
        metrics.asGetPublicProperty('ascent'));
      result.axSetPublicProperty('descent',
        metrics.asGetPublicProperty('descent'));
      return result;
    }
  }
}