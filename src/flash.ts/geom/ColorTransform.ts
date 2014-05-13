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
// Class: ColorTransform
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class ColorTransform extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["redMultiplier", "greenMultiplier", "blueMultiplier", "alphaMultiplier", "redOffset", "greenOffset", "blueOffset", "alphaOffset", "color", "color", "concat", "toString"];
    
    constructor (redMultiplier: number = 1, greenMultiplier: number = 1, blueMultiplier: number = 1, alphaMultiplier: number = 1, redOffset: number = 0, greenOffset: number = 0, blueOffset: number = 0, alphaOffset: number = 0) {
      false && super();
      this.redMultiplier = +redMultiplier;
      this.greenMultiplier = +greenMultiplier;
      this.blueMultiplier = +blueMultiplier;
      this.alphaMultiplier = +alphaMultiplier;
      this.redOffset = +redOffset;
      this.greenOffset = +greenOffset;
      this.blueOffset = +blueOffset;
      this.alphaOffset = +alphaOffset;
    }

    public static fromCXForm(cxform) {
      return new ColorTransform(
        cxform.redMultiplier / 256,
        cxform.greenMultiplier / 256,
        cxform.blueMultiplier / 256,
        cxform.alphaMultiplier / 256,
        cxform.redOffset,
        cxform.greenOffset,
        cxform.blueOffset,
        cxform.alphaOffset
      );
    }

    public redMultiplier: number;
    public greenMultiplier: number;
    public blueMultiplier: number;
    public alphaMultiplier: number;
    public redOffset: number;
    public greenOffset: number;
    public blueOffset: number;
    public alphaOffset: number;

    public set native_redMultiplier(redMultiplier: number) {
      this.redMultiplier = +redMultiplier;
    }

    public get native_redMultiplier(): number {
      return this.redMultiplier;
    }

    public set native_greenMultiplier(greenMultiplier: number) {
      this.greenMultiplier = +greenMultiplier;
    }

    public get native_greenMultiplier(): number {
      return this.greenMultiplier;
    }

    public set native_blueMultiplier(blueMultiplier: number) {
      this.blueMultiplier = +blueMultiplier;
    }

    public get native_blueMultiplier(): number {
      return this.blueMultiplier;
    }

    public set native_alphaMultiplier(alphaMultiplier: number) {
      this.alphaMultiplier = +alphaMultiplier;
    }

    public get native_alphaMultiplier(): number {
      return this.alphaMultiplier;
    }

    public set native_redOffset(redOffset: number) {
      this.redOffset = +redOffset;
    }

    public get native_redOffset(): number {
      return this.redOffset;
    }

    public set native_greenOffset(greenOffset: number) {
      this.greenOffset = +greenOffset;
    }

    public get native_greenOffset(): number {
      return this.greenOffset;
    }

    public set native_blueOffset(blueOffset: number) {
      this.blueOffset = +blueOffset;
    }

    public get native_blueOffset(): number {
      return this.blueOffset;
    }

    public set native_alphaOffset(alphaOffset: number) {
      this.alphaOffset = +alphaOffset;
    }

    public get native_alphaOffset(): number {
      return this.alphaOffset;
    }

    public ColorTransform(redMultiplier: number = 1, greenMultiplier: number = 1, blueMultiplier: number = 1, alphaMultiplier: number = 1, redOffset: number = 0, greenOffset: number = 0, blueOffset: number = 0, alphaOffset: number = 0) {
      this.redMultiplier = redMultiplier;
      this.greenMultiplier = greenMultiplier;
      this.blueMultiplier = blueMultiplier;
      this.alphaMultiplier = alphaMultiplier;
      this.redOffset = redOffset;
      this.greenOffset = greenOffset;
      this.blueOffset = blueOffset;
      this.alphaOffset = alphaOffset;
    }

    public get color(): number {
      return (this.redOffset << 16) | (this.greenOffset << 8) | this.blueOffset;
    }

    public set color(newColor: number) {
      this.redOffset = (newColor >> 16) & 0xff;
      this.greenOffset = (newColor >> 8) & 0xff;
      this.blueOffset = newColor & 0xff;
      this.redMultiplier = this.greenMultiplier = this.blueMultiplier = 1;
    }

    public concat(second:ColorTransform): void {
      this.redMultiplier *= second.redMultiplier;
      this.greenMultiplier *= second.greenMultiplier;
      this.blueMultiplier *= second.blueMultiplier;
      this.alphaMultiplier *= second.alphaMultiplier;
      this.redOffset += second.redOffset;
      this.greenOffset += second.greenOffset;
      this.blueOffset += second.blueOffset;
      this.alphaOffset += second.alphaOffset;
    }

    public preMultiply(second:ColorTransform): void {
      this.redOffset += second.redOffset * this.redMultiplier;
      this.greenOffset += second.greenOffset * this.greenMultiplier;
      this.blueOffset += second.blueOffset * this.blueMultiplier;
      this.alphaOffset += second.alphaOffset * this.alphaMultiplier;
      this.redMultiplier *= second.redMultiplier;
      this.greenMultiplier *= second.greenMultiplier;
      this.blueMultiplier *= second.blueMultiplier;
      this.alphaMultiplier *= second.alphaMultiplier;
    }

    public copyFrom(sourceColorTransform: ColorTransform): void {
      this.redMultiplier = sourceColorTransform.redMultiplier;
      this.greenMultiplier = sourceColorTransform.greenMultiplier;
      this.blueMultiplier = sourceColorTransform.blueMultiplier;
      this.alphaMultiplier = sourceColorTransform.alphaMultiplier;
      this.redOffset = sourceColorTransform.redOffset;
      this.greenOffset = sourceColorTransform.greenOffset;
      this.blueOffset = sourceColorTransform.blueOffset;
      this.alphaOffset = sourceColorTransform.alphaOffset;
    }

    public setTo(redMultiplier: number, greenMultiplier: number, blueMultiplier: number, alphaMultiplier: number, redOffset: number, greenOffset: number, blueOffset: number, alphaOffset: number): void {
      this.redMultiplier = redMultiplier;
      this.greenMultiplier = greenMultiplier;
      this.blueMultiplier = blueMultiplier;
      this.alphaMultiplier = alphaMultiplier;
      this.redOffset = redOffset;
      this.greenOffset = greenOffset;
      this.blueOffset = blueOffset;
      this.alphaOffset = alphaOffset;
    }

    public clone(): ColorTransform {
      return new ColorTransform(
        this.redMultiplier,
        this.greenMultiplier,
        this.blueMultiplier,
        this.alphaMultiplier,
        this.redOffset,
        this.greenOffset,
        this.blueOffset,
        this.alphaOffset
      );
    }

    public convertToFixedPoint(): ColorTransform {
      function fp_si8_ui8(value: number): number {
        // convert number to si8.ui8 fixed point
        return (((value << 24) >>> 0) >> 24) + ((value * 256) & 0xff) / 256;
      }
      function fp_si16(value: number): number {
        // convert number to si16
        return ((value << 16) >>> 0) >> 16;
      }
      this.redMultiplier = fp_si8_ui8(this.redMultiplier);
      this.greenMultiplier = fp_si8_ui8(this.greenMultiplier);
      this.blueMultiplier = fp_si8_ui8(this.blueMultiplier);
      this.alphaMultiplier = fp_si8_ui8(this.alphaMultiplier);
      this.redOffset = fp_si16(this.redOffset);
      this.greenOffset = fp_si16(this.greenOffset);
      this.blueOffset = fp_si16(this.blueOffset);
      this.alphaOffset = fp_si16(this.alphaOffset);
      return this;
    }

    public toString(): string {
      return "(redMultiplier=" + this.redMultiplier +
        ", greenMultiplier=" + this.greenMultiplier +
        ", blueMultiplier=" + this.blueMultiplier +
        ", alphaMultiplier=" + this.alphaMultiplier +
        ", redOffset=" + this.redOffset +
        ", greenOffset=" + this.greenOffset +
        ", blueOffset=" + this.blueOffset +
        ", alphaOffset=" + this.alphaOffset +
        ")";
    }
  }
}
