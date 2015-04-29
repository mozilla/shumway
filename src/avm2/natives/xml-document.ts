/**
 * Copyright 2015 Mozilla Foundation
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

module Shumway.AVMX.AS.flash.xml {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;

  export class XMLNode extends ASObject {
    constructor (type: number /*uint*/, value: string) {
      type = type >>> 0; value = axCoerceString(value);
      super();
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static escapeXML(value: string): string {
      value = axCoerceString(value);
      notImplemented("public flash.xml.XMLNode::static escapeXML"); return;
    }
    // Instance JS -> AS Bindings
    nodeType: number /*uint*/;
    previousSibling: flash.xml.XMLNode;
    nextSibling: flash.xml.XMLNode;
    parentNode: flash.xml.XMLNode;
    firstChild: flash.xml.XMLNode;
    lastChild: flash.xml.XMLNode;
    childNodes: any [];
    _childNodes: any [];
    attributes: ASObject;
    _attributes: ASObject;
    nodeName: string;
    nodeValue: string;
    init: (type: number /*uint*/, value: string) => void;
    hasChildNodes: () => boolean;
    cloneNode: (deep: boolean) => flash.xml.XMLNode;
    removeNode: () => void;
    insertBefore: (node: flash.xml.XMLNode, before: flash.xml.XMLNode) => void;
    appendChild: (node: flash.xml.XMLNode) => void;
    getNamespaceForPrefix: (prefix: string) => string;
    getPrefixForNamespace: (ns: string) => string;
    localName: string;
    prefix: string;
    namespaceURI: string;
    // Instance AS -> JS Bindings
  }

  export class XMLDocument extends flash.xml.XMLNode {
    xmlDecl: ASObject;
    docTypeDecl: ASObject;
    idMap: ASObject;
    ignoreWhite: boolean;
    createElement: (name: string) => flash.xml.XMLNode;
    createTextNode: (text: string) => flash.xml.XMLNode;
    parseXML: (source: string) => void;
  }

  export class XMLTag extends ASObject {
    constructor () {
      super();
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get type(): number /*uint*/ {
      notImplemented("packageInternal flash.xml.XMLTag::get type"); return;
    }
    set type(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("packageInternal flash.xml.XMLTag::set type"); return;
    }
    get empty(): boolean {
      notImplemented("packageInternal flash.xml.XMLTag::get empty"); return;
    }
    set empty(value: boolean) {
      value = !!value;
      notImplemented("packageInternal flash.xml.XMLTag::set empty"); return;
    }
    get value(): string {
      notImplemented("packageInternal flash.xml.XMLTag::get value"); return;
    }
    set value(v: string) {
      v = axCoerceString(v);
      notImplemented("packageInternal flash.xml.XMLTag::set value"); return;
    }
    get attrs(): ASObject {
      notImplemented("packageInternal flash.xml.XMLTag::get attrs"); return;
    }
    set attrs(value: ASObject) {
      value = value;
      notImplemented("packageInternal flash.xml.XMLTag::set attrs"); return;
    }
  }

  export class XMLNodeType extends ASObject {
    constructor () {
      super();
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
  }

  export class XMLParser extends ASObject {
    constructor() {
      super();
    }

    startParse(source: string, ignoreWhite: boolean): void {
      source = axCoerceString(source);
      ignoreWhite = !!ignoreWhite;
      notImplemented("packageInternal flash.xml.XMLParser::startParse");
      return;
    }

    getNext(tag: flash.xml.XMLTag): number /*int*/ {
      tag = tag;
      notImplemented("packageInternal flash.xml.XMLParser::getNext");
      return;
    }
  }
}
