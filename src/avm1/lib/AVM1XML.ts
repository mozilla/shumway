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

  enum AVM1XMLNodeType {
    ELEMENT_NODE = 1,
    TEXT_NODE = 3
  }

  function toAS3XMLNode(as2Node: AVM1Object): flash.xml.XMLNode  {
    if (!(as2Node instanceof AVM1Object)) {
      return null;
    }
    var context = as2Node.context;
    if (!alInstanceOf(context, as2Node, context.globals.XMLNode)) {
      return null;
    }
    release || Debug.assert((<AVM1XMLNodePrototype>as2Node).as3XMLNode);
    return (<AVM1XMLNodePrototype>as2Node).as3XMLNode;
  }

  export class AVM1XMLNodeFunction extends AVM1Function {
    constructor(context: AVM1Context) {
      super(context);
      this.alSetOwnPrototypeProperty(new AVM1XMLNodePrototype(context, this));

    }

    alConstruct(args?: any[]): AVM1Object  {
      if (!args && args.length < 2) {
        Debug.notImplemented('Unsupported amount of parameters for AVM1XMLNode constructor');
        return undefined;
      }
      var type = alCoerceNumber(this.context, args[0]);
      var value = alCoerceString(this.context, args[1]);
      if (type !== AVM1XMLNodeType.ELEMENT_NODE && type !== AVM1XMLNodeType.TEXT_NODE) {
        Debug.notImplemented('Unsupported AVM1XMLNode type: ' + type);
        return undefined;
      }
      var obj = new AVM1Object(this.context);
      obj.alPrototype = this.alGetPrototypeProperty();
      AVM1XMLNodePrototype.prototype.initializeNode.call(obj, type, value);
      return obj;
    }

    alCall(thisArg: any, args?: any[]): any {
      return this.alConstruct(args);
    }
  }

  class AVM1XMLNodeChildNodes extends AVM1Object  {
    private _as3XMLNode: flash.xml.XMLNode;
    private _cachedNodePropertyDescriptor: AVM1PropertyDescriptor;

    constructor(context: AVM1Context, as3XMLNode: flash.xml.XMLNode) {
      super(context);
      this._as3XMLNode = as3XMLNode;
      this._cachedNodePropertyDescriptor = {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_DELETE | AVM1PropertyFlags.READ_ONLY,
        value: undefined
      };
      alDefineObjectProperties(this, {
        length: {
          get: this.getLength
        }
      });
    }

    get as3ChildNodes(): any[] {
      return this._as3XMLNode.axGetPublicProperty('childNodes').value; // TODO .childNodes
    }

    getLength(): number {
      return this.as3ChildNodes.length;
    }

    alGetOwnProperty(p): AVM1PropertyDescriptor {
      if (alIsIndex(this.context, p)) {
        var index = alToInteger(this.context, p);
        if (index >= 0 && index < this.as3ChildNodes.length) {
          this._cachedNodePropertyDescriptor.value =
            AVM1XMLNodePrototype.getFromAS3Node(this.context, this.as3ChildNodes[index]);
          return this._cachedNodePropertyDescriptor;
        }
      }
      return super.alGetOwnProperty(p);
    }
  }

  class AVM1XMLNodePrototype extends AVM1Object {
    private _childNodes: AVM1XMLNodeChildNodes;
    private _attributes: AVM1Object;

    as3XMLNode: flash.xml.XMLNode;

    constructor(context: AVM1Context, fn: AVM1Function) {
      super(context);
      alDefineObjectProperties(this, {
        constructor: {
          value: fn,
          writable: true
        },
        attributes: {
          get: this.getAttributes,
          set: this.setAttributes
        },
        childNodes: {
          get: this.getChildNodes
        },
        firstChild: {
          get: this.getFirstChild
        },
        lastChild: {
          get: this.getLastChild
        },
        localName: {
          get: this.getLocalName
        },
        namespaceURI: {
          get: this.getNamespaceURI
        },
        nextSibling: {
          get: this.getNextSibling
        },
        nodeName: {
          get: this.getNodeName,
          set: this.setNodeName
        },
        nodeType: {
          get: this.getNodeType
        },
        nodeValue: {
          get: this.getNodeValue,
          set: this.setNodeValue
        },
        parentNode: {
          get: this.getParentNode
        },
        prefix: {
          get: this.getPrefix
        },
        previousSibling: {
          get: this.getPreviousSibling
        },

        appendChild: {
          get: this.appendChild
        },
        cloneNode: {
          get: this.cloneNode
        },
        getNamespaceForPrefix: {
          get: this.getNamespaceForPrefix
        },
        getPrefixForNamespace: {
          get: this.getPrefixForNamespace
        },
        hasChildNodes: {
          get: this.hasChildNodes
        },
        insertBefore: {
          get: this.insertBefore
        },
        removeNode: {
          get: this.removeNode
        },
        toString: {
          get: this._toString
        }
      });
    }

    initializeNode(type: number, value: string): void {
      this.as3XMLNode = new this.context.sec.flash.xml.XMLNode(type, value);
      AVM1XMLNodePrototype.addMap(this.as3XMLNode, this);
    }

    initializeFromAS3Node(as3XMLNode: flash.xml.XMLNode): void {
      this.as3XMLNode = as3XMLNode;
      AVM1XMLNodePrototype.addMap(this.as3XMLNode, this);
    }

    _toString(): string {
      return this.as3XMLNode.axCallPublicProperty('toString', []);
    }

    appendChild(newChild: AVM1Object): void {
      this.as3XMLNode.axCallPublicProperty('appendChild', [newChild]);
    }

    getAttributes(): AVM1Object {
      var as3Attributes = this.as3XMLNode.axGetPublicProperty('attributes');
      if (isNullOrUndefined(as3Attributes)) {
        return undefined;
      }
      // TODO create a proxy to map AVM2 object stuff to AVM1
      if (!this._attributes) {
        var as2Attributes = alNewObject(this.context);
        Shumway.AVMX.forEachPublicProperty(as3Attributes, (property: any, value: any): void => {
          release || Debug.assert(typeof value === 'string');
          as2Attributes.alPut(property, value);
        });
        this._attributes = as2Attributes;
      }
      return this._attributes;
    }

    setAttributes(value: AVM1Object) {
      Debug.notImplemented('AVM1XMLNodePrototype.setAttributes');
    }

    getChildNodes(): AVM1Object {
      if (!this._childNodes) {
        this._childNodes = new AVM1XMLNodeChildNodes(this.context, this.as3XMLNode);
      }
      return this._childNodes;
    }

    cloneNode(): AVM1Object {
      var clone = this.as3XMLNode.cloneNode(true);
      return AVM1XMLNodePrototype.getFromAS3Node(this.context, clone);
    }

    getFirstChild(): AVM1Object {
      return AVM1XMLNodePrototype.getFromAS3Node(this.context, this.as3XMLNode.axGetPublicProperty('firstChild'));
    }

    getNamespaceForPrefix(prefix: string): string {
      return this.as3XMLNode.axCallPublicProperty('getNamespaceForPrefix', [prefix]);
    }

    getPrefixForNamespace(nsURI: string): string {
      return this.as3XMLNode.axCallPublicProperty('getNamespaceForPrefix', [nsURI]);
    }

    hasChildNodes(): boolean {
      return this.as3XMLNode.axCallPublicProperty('hasChildNodes', null);
    }

    insertBefore(newChild: AVM1Object, insertPoint: AVM1Object): void {
      this.as3XMLNode.axCallPublicProperty('insertBefore',
        [toAS3XMLNode(newChild), toAS3XMLNode(insertPoint)]);
    }

    getLastChild(): AVM1Object {
      return AVM1XMLNodePrototype.getFromAS3Node(this.context, this.as3XMLNode.axGetPublicProperty('lastChild'));
    }

    getLocalName(): string {
      return this.as3XMLNode.axGetPublicProperty('localName');
    }

    getNamespaceURI(): string {
      return this.as3XMLNode.axGetPublicProperty('namespaceURI');
    }

    getNextSibling(): AVM1Object {
      return AVM1XMLNodePrototype.getFromAS3Node(this.context, this.as3XMLNode.axGetPublicProperty('nextSibling'));
    }

    getNodeName(): string {
      return this.as3XMLNode.axGetPublicProperty('nodeName');
    }

    setNodeName(value: string) {
      value = alCoerceString(this.context, value);
      this.as3XMLNode.axSetPublicProperty('nodeName', value);
    }

    getNodeType(): number {
      return this.as3XMLNode.axGetPublicProperty('nodeType');
    }

    getNodeValue(): string {
      return this.as3XMLNode.axGetPublicProperty('nodeValue');
    }

    setNodeValue(value: string) {
      value = alCoerceString(this.context, value);
      this.as3XMLNode.axSetPublicProperty('nodeValue', value);
    }

    getParentNode(): AVM1Object {
      return AVM1XMLNodePrototype.getFromAS3Node(this.context, this.as3XMLNode.axGetPublicProperty('parentNode'));
    }

    getPrefix(): string {
      return this.as3XMLNode.axGetPublicProperty('prefix');
    }

    getPreviousSibling(): AVM1Object {
      return AVM1XMLNodePrototype.getFromAS3Node(this.context, this.as3XMLNode.axGetPublicProperty('previousSibling'));
    }

    removeNode(): void {
      this.as3XMLNode.axCallPublicProperty('removeNode', null);
    }

    static addMap(as3Node: flash.xml.XMLNode, as2Node: AVM1Object): void {
      release || Debug.assert(!(<any>as3Node)._as2Node);
      (<any>as3Node)._as2Node = as2Node;
    }

    static getFromAS3Node(context: AVM1Context, as3Node: flash.xml.XMLNode): AVM1Object {
      if (isNullOrUndefined(as3Node)) {
        return undefined;
      }
      var as2Node: AVM1Object = (<any>as3Node)._as2Node;
      if (!as2Node) {
        as2Node = new AVM1Object(context);
        as2Node.alPrototype = context.globals.XMLNode.alGetPrototypeProperty();
        AVM1XMLNodePrototype.prototype.initializeFromAS3Node.call(as2Node, as3Node);
      } else {
        release || Debug.assert(as2Node.context === context);
      }
      return as2Node;
    }
  }

  export class AVM1XMLFunction extends AVM1Function {
    constructor(context: AVM1Context, xmlNodeClass: AVM1XMLNodeFunction) {
      super(context);
      this.alSetOwnPrototypeProperty(new AVM1XMLPrototype(context, this, xmlNodeClass));
    }

    alConstruct(args?: any[]): AVM1Object  {
      var text = args && alCoerceString(this.context, args[0]);
      var obj = new AVM1Object(this.context);
      obj.alPrototype = this.alGetPrototypeProperty();
      AVM1XMLPrototype.prototype.initializeDocument.call(obj, text);
      return obj;
    }

    alCall(thisArg: any, args?: any[]): any {
      return this.alConstruct(args);
    }
  }

  class AVM1XMLPrototype extends AVM1Object {
    constructor(context: AVM1Context, fn: AVM1Function, xmlNodeClass: AVM1XMLNodeFunction) {
      super(context);
      this.alPrototype = xmlNodeClass.alGetPrototypeProperty();
      alDefineObjectProperties(this, {
        constructor: {
          value: fn,
          writable: true
        },
        addRequestHeader: {
          value: this.addRequestHeader
        },
        createElement: {
          value: this.createElement
        },
        createTextNode: {
          value: this.createTextNode
        },
        getBytesLoaded: {
          value: this.getBytesLoaded
        },
        getBytesTotal: {
          value: this.getBytesTotal
        },
        load: {
          value: this.load
        },
        parseXML: {
          value: this.parseXML
        },
        send: {
          value: this.send
        },
        sendAndLoad: {
          value: this.sendAndLoad
        }
      })
    }

    get as3XMLDocument(): flash.xml.XMLDocument {
      return <flash.xml.XMLDocument>(<AVM1XMLNodePrototype><any>this).as3XMLNode;
    }

    initializeDocument(text: string) {
      text = alCoerceString(this.context, text) || null;
      var as3Doc = new this.context.sec.flash.xml.XMLDocument(text);
      AVM1XMLNodePrototype.prototype.initializeFromAS3Node.call(this, as3Doc);
    }

    addRequestHeader(headers: any, headerValue?: String): void {
      Debug.notImplemented('AVM1XMLPrototype.addRequestHeader');
    }

    createElement(name: string): AVM1Object {
      name = alCoerceString(this.context, name);
      Debug.notImplemented('AVM1XMLPrototype.createElement');
      return undefined;
    }

    createTextNode(value: string) : AVM1Object {
      value = alCoerceString(this.context, value);
      Debug.notImplemented('AVM1XMLPrototype.createTextNode');
      return undefined;
    }

    getBytesLoaded(): number {
      Debug.notImplemented('AVM1XMLPrototype.getBytesLoaded');
      return NaN;
    }

    getBytesTotal(): number {
      Debug.notImplemented('AVM1XMLPrototype.getBytesTotal');
      return NaN;
    }

    load(url: string): boolean {
      url = alCoerceString(this.context, url);
      Debug.notImplemented('AVM1XMLPrototype.load');
      return false;
    }

    parseXML(value: string): void {
      value = alCoerceString(this.context, value);
      this.as3XMLDocument.parseXML(value);
    }

    send(url: string, target?: string, method?: string): boolean {
      url = alCoerceString(this.context, url);
      Debug.notImplemented('AVM1XMLPrototype.send');
      return false;
    }

    sendAndLoad(url: string, resultXML: AVM1Object): void {
      url = alCoerceString(this.context, url);
      Debug.notImplemented('AVM1XMLPrototype.sendAndLoad');
    }
  }
}
