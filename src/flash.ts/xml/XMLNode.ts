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
 * limitations under the License.
 */
// Class: XMLNode
module Shumway.AVM2.AS.flash.xml {
  import notImplemented = Shumway.Debug.notImplemented;
  export class XMLNode extends ASNative {
    static initializer: any = null;
    constructor (type: number /*uint*/, value: string) {
      type = type >>> 0; value = "" + value;
      false && super();
      notImplemented("Dummy Constructor: public flash.xml.XMLNode");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static escapeXML(value: string): string {
      value = "" + value;
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
}
