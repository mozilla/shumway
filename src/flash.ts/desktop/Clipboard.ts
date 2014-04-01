/**
 * Copyright 2013 Mozilla Foundation
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
 * limitations undxr the License.
 */
// Class: Clipboard
module Shumway.AVM2.AS.flash.desktop {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Clipboard extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.desktop.Clipboard");
    }
    // Static   JS -> AS Bindings
    static isSystemFormat: (format: string) => boolean;
    static initFormatMap: () => void;
    static addFormatMapping: (flashFormat: string, exportFromFlash: ASFunction, importToFlash: ASFunction) => any;
    static _fromFlash: flash.utils.Dictionary;
    static _toFlash: flash.utils.Dictionary;
    static _wasFormatMapInitialized: boolean;
    // Static   AS -> JS Bindings
    get generalClipboard(): flash.desktop.Clipboard {
      notImplemented("public flash.desktop.Clipboard::get generalClipboard"); return;
    }
    // Instance JS -> AS Bindings
    setData: (format: string, data: ASObject, serializable: boolean = true) => boolean;
    setDataHandler: (format: string, handler: ASFunction, serializable: boolean = true) => boolean;
    getData: (format: string, transferMode: string = "originalPreferred") => ASObject;
    hasFormat: (format: string) => boolean;
    getOriginal: (format: string) => ASObject;
    getClone: (format: string) => ASObject;
    checkAccess: (requestRead: boolean, requestWrite: boolean) => void;
    getDeserialization: (format: string) => ASObject;
    putSerialization: (format: string, data: ASObject) => void;
    convertNativeFormat: (format: string) => ASObject;
    convertFlashFormat: (flashFormat: string, data: ASObject, serializable: boolean) => boolean;
    // Instance AS -> JS Bindings
    get formats(): any [] {
      notImplemented("public flash.desktop.Clipboard::get formats"); return;
    }
    clear(): void {
      notImplemented("public flash.desktop.Clipboard::clear"); return;
    }
    clearData(format: string): void {
      format = "" + format;
      notImplemented("public flash.desktop.Clipboard::clearData"); return;
    }
    get alive(): boolean {
      notImplemented("public flash.desktop.Clipboard::get alive"); return;
    }
    get canReadContents(): boolean {
      notImplemented("public flash.desktop.Clipboard::get canReadContents"); return;
    }
    get canWriteContents(): boolean {
      notImplemented("public flash.desktop.Clipboard::get canWriteContents"); return;
    }
    nativeSetHandler(format: string, handler: ASFunction): void {
      format = "" + format; handler = handler;
      notImplemented("public flash.desktop.Clipboard::nativeSetHandler"); return;
    }
    getObjectReference(format: string): ASObject {
      format = "" + format;
      notImplemented("public flash.desktop.Clipboard::getObjectReference"); return;
    }
    putObjectReference(format: string, data: ASObject): void {
      format = "" + format; data = data;
      notImplemented("public flash.desktop.Clipboard::putObjectReference"); return;
    }
    getString(): string {
      notImplemented("public flash.desktop.Clipboard::getString"); return;
    }
    putString(s: string): void {
      s = "" + s;
      notImplemented("public flash.desktop.Clipboard::putString"); return;
    }
    getHTML(): string {
      notImplemented("public flash.desktop.Clipboard::getHTML"); return;
    }
    putHTML(html: string): void {
      html = "" + html;
      notImplemented("public flash.desktop.Clipboard::putHTML"); return;
    }
    getRTF(): flash.utils.ByteArray {
      notImplemented("public flash.desktop.Clipboard::getRTF"); return;
    }
    putRTF(rtf: flash.utils.ByteArray): void {
      rtf = rtf;
      notImplemented("public flash.desktop.Clipboard::putRTF"); return;
    }
    getByteArray(format: string): flash.utils.ByteArray {
      format = "" + format;
      notImplemented("public flash.desktop.Clipboard::getByteArray"); return;
    }
    putByteArray(format: string, bytes: flash.utils.ByteArray): void {
      format = "" + format; bytes = bytes;
      notImplemented("public flash.desktop.Clipboard::putByteArray"); return;
    }
    get swfVersion(): number /*int*/ {
      notImplemented("public flash.desktop.Clipboard::get swfVersion"); return;
    }
    setHandlerStoringData(status: boolean): void {
      status = !!status;
      notImplemented("public flash.desktop.Clipboard::setHandlerStoringData"); return;
    }
  }
}
