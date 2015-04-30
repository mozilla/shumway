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

    private _type: number = 0;
    private _value: string = null;
    private _empty: boolean = false;
    private _attrs: ASObject = null;

    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get type(): number /*uint*/ {
      return this._type;
    }
    set type(value: number /*uint*/) {
      value = value >>> 0;
      this._type = value;
    }
    get empty(): boolean {
      return this._empty;
    }
    set empty(value: boolean) {
      value = !!value;
      this._empty = value;
    }
    get value(): string {
      return this._value;
    }
    set value(v: string) {
      v = axCoerceString(v);
      this._value = v;
    }
    get attrs(): ASObject {
      return this._attrs;
    }
    set attrs(value: ASObject) {
      this._attrs = value;
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

  function isWhitespace(s: string) {
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (!(ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t')) {
        return false;

      }
    }
    return true;
  }

  interface XMLParserResult {
    type: number;
    value: string;
    empty?: boolean;
    attrs?: ASObject;
  }

  class XMLParserForXMLDocument extends XMLParserBase {
    queue: (XMLParserResult|number)[];
    ignoreWhitespace: boolean;
    sec: ISecurityDomain;

    constructor(sec: ISecurityDomain) {
      super();
      this.sec = sec;
      this.queue = [];
      this.ignoreWhitespace = false;
    }

    onError(code: XMLParserErrorCode): void {
      this.queue.push(code);
    }

    onPi(name: string, value: string): void {
      Debug.warning('Unhandled XMLParserForXMLDocument.onPi');
    }

    onComment(text: string): void {
      Debug.warning('Unhandled XMLParserForXMLDocument.onComment');
    }

    onCdata(text: string): void {
      this.queue.push({
        type: 4,
        value: text
      });
    }

    onDoctype(doctypeContent: string): void {
      Debug.warning('Unhandled XMLParserForXMLDocument.onDoctype');
    }

    onBeginElement(name: string, attributes: {name: string; value: string}[], isEmpty: boolean): void {
      var attrObj = this.sec.createObject();
      attributes.forEach((a) => {
        attrObj.axSetPublicProperty(a.name, a.value);
      });
      this.queue.push({
        type: 1,
        value: name,
        empty: isEmpty,
        attrs: attrObj
      });
    }

    onEndElement(name: string): void {
      this.queue.push({
        type: 1,
        value: '/' + name
      });
    }

    onText(text: string): void {
      if (this.ignoreWhitespace && isWhitespace(text)) {
        return;
      }
      this.queue.push({
        type: 3,
        value: text
      });
    }
  }

  export class XMLParser extends ASObject {
    constructor() {
      super();
    }

    private queue: (XMLParserResult|number)[];

    startParse(source: string, ignoreWhite: boolean): void {
      source = axCoerceString(source);
      ignoreWhite = !!ignoreWhite;

      var parser = new XMLParserForXMLDocument(this.sec);
      parser.ignoreWhitespace = ignoreWhite;
      parser.parseXml(source);
      this.queue = parser.queue;
    }

    getNext(tag: flash.xml.XMLTag): number /*int*/ {
      if (this.queue.length === 0) {
        return XMLParserErrorCode.EndOfDocument;
      }
      var nextItem = this.queue.shift();
      if (typeof nextItem === 'number') {
        return nextItem;
      }
      var parseResult = <XMLParserResult>nextItem;
      tag.type = parseResult.type;
      tag.value = parseResult.value;
      tag.empty = parseResult.empty || false;
      tag.attrs = parseResult.attrs || null;
      return XMLParserErrorCode.NoError;
    }
  }
}
