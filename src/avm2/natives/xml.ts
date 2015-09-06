/* tslint:disable */
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

/*
 NOTE ON E4X METHOD CALLS

 E4X specifies some magic when making calls on XML and XMLList values. If a
 callee is not found on an XMLList value and the list has only one XML
 child, then the call is delegated to that XML child. If a callee is not
 found on an XML value and that value has simple content, then the simple
 content is converted to a string value and the call is made on that string
 value.

 Here are the relevant texts from the spec section 11.2.2.1:

 "If no such property exists and base is an XMLList of size 1, CallMethod
 delegates the method invocation to the single property it contains. This
 treatment intentionally blurs the distinction between XML objects and XMLLists
 of size 1."

 "If no such property exists and base is an XML object containing no XML valued
 children (i.e., an attribute, leaf node or element with simple content),
 CallMethod attempts to delegate the method lookup to the string value
 contained in the leaf node. This treatment allows users to perform operations
 directly on the value of a leaf node without having to explicitly select it."

 NOTE ON E4X ANY NAME AND NAMESPACE

 E4X allows the names of the form x.*, x.ns::*, x.*::id and x.*::* and their
 attribute name counterparts x.@*, x.@ns::*, etc. These forms result in
 Multiname values with the name part equal to undefined in the case of an ANY
 name, and the namespace set being empty in the case of an ANY namespace.

 Note also,
 x.*
 is shorthand for
 x.*::*
 .

 */

module Shumway.AVMX.AS {
  import assertNotImplemented = Shumway.Debug.assertNotImplemented;
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;

  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
  import defineReadOnlyProperty = Shumway.ObjectUtilities.defineReadOnlyProperty;

  export function isXMLType(val: any, sec: AXSecurityDomain): boolean {
    return typeof val === 'object' && val &&
           (val.axClass === sec.AXXML || val.axClass === sec.AXXMLList ||
            val.axClass === sec.AXQName || val.axClass === sec.AXNamespace);
  }

  export function isXMLCollection(sec: AXSecurityDomain, val: any): boolean {
    return typeof val === 'object' && val &&
           (val.axClass === sec.AXXML || val.axClass === sec.AXXMLList);
  }

  // 10.1 ToString
  function toString(node, sec: AXSecurityDomain) {
    if (!node || node.axClass !== sec.AXXML) {
      return axCoerceString(node);
    }
    switch (node._kind) {
      case ASXMLKind.Text:
      case ASXMLKind.Attribute:
        return node._value;
      default:
        if (node.hasSimpleContent()) {
          var s = '';
          for (var i = 0; i < node._children.length; i++) {
            var child = node._children[i];
            if (child._kind === ASXMLKind.Comment ||
                child._kind === ASXMLKind.ProcessingInstruction)
            {
              continue;
            }
            s += toString(child, sec);
          }
          return s;
        }
        return toXMLString(sec, node);
    }
  }

  // 10.2.1.1 EscapeElementValue ( s )
  export function escapeElementValue(sec: AXSecurityDomain, s: any): string {
    if (isXMLCollection(sec, s)) {
      return s.toXMLString();
    }
    s = axCoerceString(s);
    var i = 0, ch;
    while (i < s.length && (ch = s[i]) !== '&' && ch !== '<' && ch !== '>') {
      i++;
    }
    if (i >= s.length) {
      return s;
    }
    var buf = s.substring(0, i);
    while (i < s.length) {
      ch = s[i++];
      switch (ch) {
        case '&':
          buf += '&amp;';
          break;
        case '<':
          buf += '&lt;';
          break;
        case '>':
          buf += '&gt;';
          break;
        default:
          buf += ch;
          break;
      }
    }
    return buf;
  }

  // 10.2.1.2 EscapeAttributeValue ( s )
  export function escapeAttributeValue(s: string): string {
    s = String(s);
    var i = 0, ch;
    while (i < s.length && (ch = s[i]) !== '&' && ch !== '<' &&
           ch !== '\"' && ch !== '\n' && ch !== '\r' && ch !== '\t') {
      i++;
    }
    if (i >= s.length) {
      return s;
    }
    var buf = s.substring(0, i);
    while (i < s.length) {
      ch = s[i++];
      switch (ch) {
        case '&':
          buf += '&amp;';
          break;
        case '<':
          buf += '&lt;';
          break;
        case '\"':
          buf += '&quot;';
          break;
        case '\n':
          buf += '&#xA;';
          break;
        case '\r':
          buf += '&#xD;';
          break;
        case '\t':
          buf += '&#x9;';
          break;
        default:
          buf += ch;
          break;
      }
    }
    return buf;
  }

  function isWhitespace(s: string, index: number): boolean {
    var ch = s[index];
    return ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t';
  }

  function isWhitespaceString(s: string): boolean {
    release || assert(typeof s === 'string');
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (!(ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t')) {
        return false;
      }
    }
    return true;
  }

  function trimWhitespaces(s: string): string {
    var i = 0;
    while (i < s.length && isWhitespace(s, i)) {
      i++;
    }
    if (i >= s.length) {
      return '';
    }
    var j = s.length - 1;
    while (isWhitespace(s, j)) {
      j--;
    }
    return i === 0 && j === s.length - 1 ? s : s.substring(i, j + 1);
  }

  var indentStringCache: string[] = [];
  function getIndentString(indent: number): string {
    if (indent > 0) {
      if (indentStringCache[indent] !== undefined) {
        return indentStringCache[indent];
      }
      var s = '';
      for (var i = 0; i < indent; i++) {
        s += ' ';
      }
      indentStringCache[indent] = s;
      return s;
    }
    return '';
  }

  function generateUniquePrefix(namespaces: Namespace[]) {
    var i = 1, newPrefix;
    while (true) {
      newPrefix = '_ns' + i;
      if (!namespaces.some(function (ns) { return ns.prefix === newPrefix; })) {
        return newPrefix;
      }
      i++;
    }
  }

  // 10.2 ToXMLString
  function toXMLString(sec: AXSecurityDomain, node: any) {
    if (node === null || node === undefined) {
      throw new TypeError();
    }
    return escapeElementValue(sec, node);
  }


  // 10.3 ToXML
  function toXML(v, sec: AXSecurityDomain) {
    if (v === null) {
      sec.throwError('TypeError', Errors.ConvertNullToObjectError);
    }
    if (v === undefined) {
      sec.throwError('TypeError', Errors.ConvertUndefinedToObjectError);
    }
    if (v.axClass === sec.AXXML) {
      return v;
    }
    if (v.axClass === sec.AXXMLList) {
      if (v._children.length !== 1) {
        sec.throwError('TypeError', Errors.XMLMarkupMustBeWellFormed);
      }
      return v._children[0];
    }
    // The E4X spec says we must throw a TypeError for non-Boolean, Number, or String objects.
    // Flash thinks otherwise.
    var x = sec.xmlParser.parseFromString(axCoerceString(v));
    var length = x._children.length;
    if (length === 0) {
      return createXML(sec, ASXMLKind.Text);
    }
    if (length === 1) {
      x._children[0]._parent = null;
      return x._children[0];
    }
    sec.throwError('TypeError', Errors.XMLMarkupMustBeWellFormed);
  }

  // 10.4 ToXMLList
  function toXMLList(value: any, targetList: ASXMLList): void {
    // toXMLList is supposed to just return value if it's an XMLList already. For optimization
    // purposes, we handle that case at the callsites.
    release || assert(typeof value !== 'object' || value && value.axClass !== targetList.axClass);
    if (value === null) {
      targetList.sec.throwError('TypeError', Errors.ConvertNullToObjectError);
    }
    if (value === undefined) {
      targetList.sec.throwError('TypeError', Errors.ConvertUndefinedToObjectError);
    }
    if (value.axClass === targetList.sec.AXXML) {
      targetList.append(value);
      return;
    }
    // The E4X spec says we must throw a TypeError for non-Boolean, Number, or String objects.
    // Flash thinks otherwise.
    var defaultNamespace = getDefaultNamespace(targetList.sec);
    var parentString = '<parent xmlns="' + escapeAttributeValue(defaultNamespace.uri) + '">' +
                       value + '</parent>';
    var x = toXML(parentString, targetList.sec);
    var children = x._children;
    if (!children) {
      return;
    }
    for (var i = 0; i < children.length; i++) {
      var v = children[i];
      v._parent = null;
      targetList.append(v);
    }
  }

  // 10.6 ToXMLName
  function toXMLName(mn, sec: AXSecurityDomain): Multiname {
    if (mn === undefined) {
      return anyMultiname;
    }
    var name: string;
    // convert argument to a value of type AttributeName or a QName object
    // according to the following:
    if (typeof mn === 'object' && mn !== null) {
      if (mn instanceof Multiname) {
        return mn;
      }
      if (mn.axClass === sec.AXQName) {
        // Object - If the input argument is a QName object,
        // return its Multiname.
        return mn.name;
      }
      // Object - Otherwise, convert the input argument to a string using ToString.
      name = String(mn);
    } else if (typeof mn === 'number') {
      name = mn + '';
    } else if (typeof mn === 'string') {
      // String - Create a QName object or AttributeName from the String
      // as specified below in section 10.6.1. See below.
      if (mn === '*') {
        name = null;
      } else {
        name = mn;
      }
    } else {
      sec.throwError('TypeError', Errors.XMLInvalidName, mn);
    }
    // ... then convert the result to a QName object or AttributeName
    // as specified in section 10.6.1.
    if (name && name[0] === '@') {
      // If the first character of s is "@", ToXMLName creates an
      // AttributeName using the ToAttributeName operator.
      name = name.substr(1);
      if (name === '*') {
        name = null;
      }
      return new Multiname(null, 0, CONSTANT.QNameA, [Namespace.PUBLIC], name);
    }
    return new Multiname(null, 0, CONSTANT.QName, [Namespace.PUBLIC], name);
  }

  function coerceE4XMultiname(mn: Multiname, sec: AXSecurityDomain) {
    var out = tmpMultiname;
    out.kind = mn.kind;

    // Queries of the foo[new QName('bar')] sort create this situation.
    if (mn.name && mn.name.axClass === sec.AXQName) {
      mn = mn.name.name;
    }
    if (mn.isQName()) {
      out.name = mn.name;
      out.namespaces = mn.namespaces;
    } else {
      if (mn.isAnyNamespace()) {
        out.namespaces = mn.namespaces;
      } else {
        var defaultNS = getDefaultNamespace(sec);
        var namespaces = mn.namespaces;
        var containsDefaultNS = false;
        for (var i = 0; i < namespaces.length; i++) {
          var ns = namespaces[i];
          if (ns.uri === defaultNS.uri && ns.prefix === defaultNS.prefix &&
              ns.type === defaultNS.type)
          {
            containsDefaultNS = true;
            break;
          }
        }
        if (!containsDefaultNS) {
          out.namespaces = mn.namespaces.concat(defaultNS);
        } else {
          out.namespaces = mn.namespaces;
        }
      }
    }

    var name = mn.name;
    if (mn.isAnyName() || name === '*' || name === null) {
      out.name = null;
    } else if (name.length > 1 && name[0] === '@') {
      if (!out.isAttribute()) {
        if (name === '@*') {
          out.name = null;
        } else {
          out.name = name.substr(1);
        }
        out.kind = out.namespaces.length === 1 ? CONSTANT.QNameA : CONSTANT.MultinameA;
      } else {
        out.name = name;
      }
    } else {
      out.name = name;
    }

    return out;
  }

  // 12.1 GetDefaultNamespace
  function getDefaultNamespace(sec: AXSecurityDomain): Namespace {
    var scope = getCurrentScope();
    while (scope) {
      if (scope.defaultNamespace) {
        return scope.defaultNamespace;
      }
      scope = scope.parent;
    }
    // The outermost default xml namespace is stored in sec.AXNamespace.defaultNamespace.
    return sec.AXNamespace.defaultNamespace;
  }

  /**
   * 13.3.5.4 [[GetNamespace]] ( [ InScopeNamespaces ] )
   *
   * The [[GetNamespace]] method is an internal method that returns a Namespace object with a URI
   * matching the URI of this QName. InScopeNamespaces is an optional parameter. If
   * InScopeNamespaces is unspecified, it is set to the empty set. If one or more Namespaces
   * exists in InScopeNamespaces with a URI matching the URI of this QName, one of the matching
   * Namespaces will be returned. If no such namespace exists in InScopeNamespaces,
   * [[GetNamespace]] creates and returns a new Namespace with a URI matching that of this QName.
   * For implementations that preserve prefixes in QNames, [[GetNamespace]] may return a
   * Namespace that also has a matching prefix. The input argument InScopeNamespaces is a set of
   * Namespace objects.
   */
  function GetNamespace(mn: Multiname, inScopeNamespaces: Namespace[]) {
    release || assert(mn.isQName());
    var uri = mn.uri;
    for (var i = 0; inScopeNamespaces && i < inScopeNamespaces.length; i++) {
      if (uri === inScopeNamespaces[i].uri) {
        return inScopeNamespaces[i];
      }
    }
    return mn.namespaces[0];
  }

  // 13.1.2.1 isXMLName ( value )
  export function isXMLName(v, sec: AXSecurityDomain) {
    try {
      var qn = sec.AXQName.Create(v);
    } catch (e) {
      return false;
    }
    // FIXME scan v to see if it is a valid lexeme and return false if not
    return true;
  }

  var tmpMultiname = new Multiname(null, 0, CONSTANT.QName, [], null);
  var anyMultiname = new Multiname(null, 0, CONSTANT.QName, [], null);
  release || Object.seal(anyMultiname);

  export enum XMLParserErrorCode {
    NoError = 0,
    EndOfDocument = -1,
    UnterminatedCdat = -2,
    UnterminatedXmlDeclaration = -3,
    UnterminatedDoctypeDeclaration  = -4,
    UnterminatedComment  = -5,
    MalformedElement = -6,
    OutOfMemory = -7,
    UnterminatedAttributeValue = -8,
    UnterminatedElement = -9,
    ElementNeverBegun = -10
  }

  export class XMLParserBase {
    constructor() {
    }

    private resolveEntities(s: string): string {
      return s.replace(/&([^;]+);/g, function (all, entity) {
        if (entity.substring(0, 2) === '#x') {
          return String.fromCharCode(parseInt(entity.substring(2), 16));
        } else if (entity.substring(0, 1) === '#') {
          return String.fromCharCode(parseInt(entity.substring(1), 10));
        }
        switch (entity) {
          case 'lt':
            return '<';
          case 'gt':
            return '>';
          case 'amp':
            return '&';
          case 'quot':
            return '\"';
        }
        // throw "Unknown entity: " + entity;
        return all;
      });
    }

    private parseContent(s: string, start: number):
        {name: string; attributes: {name: string; value: string}[]; parsed: number} {
      var pos = start, name, attributes = [];

      function skipWs() {
        while (pos < s.length && isWhitespace(s, pos)) {
          ++pos;
        }
      }

      while (pos < s.length && !isWhitespace(s, pos) && s[pos] !== ">" && s[pos] !== "/") {
        ++pos;
      }
      name = s.substring(start, pos);
      skipWs();
      while (pos < s.length && s[pos] !== ">" &&
      s[pos] !== "/" && s[pos] !== "?") {
        skipWs();
        var attrName = "", attrValue = "";
        while (pos < s.length && !isWhitespace(s, pos) && s[pos] !== "=") {
          attrName += s[pos];
          ++pos;
        }
        skipWs();
        if (s[pos] !== "=") {
          return null;
        }
        ++pos;
        skipWs();
        var attrEndChar = s[pos];
        if (attrEndChar !== "\"" && attrEndChar !== "\'") {
          return null;
        }
        var attrEndIndex = s.indexOf(attrEndChar, ++pos);
        if (attrEndIndex < 0) {
          return null;
        }
        attrValue = s.substring(pos, attrEndIndex);
        attributes.push({name: attrName, value: this.resolveEntities(attrValue)});
        pos = attrEndIndex + 1;
        skipWs();
      }
      return {name: name, attributes: attributes, parsed: pos - start};
    }

    private parseProcessingInstruction(s: string, start: number):
        {name: string; value: string; parsed: number} {
      var pos = start, name, value;

      function skipWs() {
        while (pos < s.length && isWhitespace(s, pos)) {
          ++pos;
        }
      }

      while (pos < s.length && !isWhitespace(s, pos) && s[pos] !== ">" && s[pos] !== "/") {
        ++pos;
      }
      name = s.substring(start, pos);
      skipWs();
      var attrStart = pos;
      while (pos < s.length && (s[pos] !== "?" || s[pos + 1] != '>')) {
        ++pos;
      }
      value = s.substring(attrStart, pos);
      return {name: name, value: value, parsed: pos - start};
    }

    parseXml(s: string): void {
      var i = 0;
      while (i < s.length) {
        var ch = s[i];
        var j = i;
        if (ch === "<") {
          ++j;
          var ch2 = s[j], q;
          switch (ch2) {
            case "/":
              ++j;
              q = s.indexOf(">", j);
              if (q < 0) {
                this.onError(XMLParserErrorCode.UnterminatedElement);
                return;
              }
              this.onEndElement(s.substring(j, q));
              j = q + 1;
              break;
            case "?":
              ++j;
              var pi = this.parseProcessingInstruction(s, j);
              if (s.substring(j + pi.parsed, j + pi.parsed + 2) != "?>") {
                this.onError(XMLParserErrorCode.UnterminatedXmlDeclaration);
                return;
              }
              this.onPi(pi.name, pi.value);
              j += pi.parsed + 2;
              break;
            case "!":
              if (s.substring(j + 1, j + 3) === "--") {
                q = s.indexOf("-->", j + 3);
                if (q < 0) {
                  this.onError(XMLParserErrorCode.UnterminatedComment);
                  return;
                }
                this.onComment(s.substring(j + 3, q));
                j = q + 3;
              } else if (s.substring(j + 1, j + 8) === "[CDATA[") {
                q = s.indexOf("]]>", j + 8);
                if (q < 0) {
                  this.onError(XMLParserErrorCode.UnterminatedCdat);
                  return;
                }
                this.onCdata(s.substring(j + 8, q));
                j = q + 3;
              } else if (s.substring(j + 1, j + 8) === "DOCTYPE") {
                var q2 = s.indexOf("[", j + 8), complexDoctype = false;
                q = s.indexOf(">", j + 8);
                if (q < 0) {
                  this.onError(XMLParserErrorCode.UnterminatedDoctypeDeclaration);
                  return;
                }
                if (q2 > 0 && q > q2) {
                  q = s.indexOf("]>", j + 8);
                  if (q < 0) {
                    this.onError(XMLParserErrorCode.UnterminatedDoctypeDeclaration);
                    return;
                  }
                  complexDoctype = true;
                }
                var doctypeContent = s.substring(j + 8, q + (complexDoctype ? 1 : 0));
                this.onDoctype(doctypeContent);
                // XXX pull entities ?
                j = q + (complexDoctype ? 2 : 1);
              } else {
                this.onError(XMLParserErrorCode.MalformedElement);
                return;
              }
              break;
            default:
              var content = this.parseContent(s, j);
              if (content === null) {
                this.onError(XMLParserErrorCode.MalformedElement);
                return;
              }
              var isClosed = false;
              if (s.substring(j + content.parsed, j + content.parsed + 2) === "/>") {
                isClosed = true;
              } else if (s.substring(j + content.parsed, j + content.parsed + 1) !== ">") {
                this.onError(XMLParserErrorCode.UnterminatedElement);
                return;
              }
              this.onBeginElement(content.name, content.attributes, isClosed);
              j += content.parsed + (isClosed ? 2 : 1);
              break;
          }
        } else {
          do {
          } while (j++ < s.length && s[j] !== "<");
          var text = s.substring(i, j);
          this.onText(this.resolveEntities(text));
        }
        i = j;
      }
    }

    onPi(name: string, value: string): void {
    }

    onComment(text: string): void {
    }

    onCdata(text: string): void {
    }

    onDoctype(doctypeContent: string): void {
    }

    onText(text: string): void {
    }

    onBeginElement(name: string, attributes: {name: string; value: string}[], isEmpty: boolean): void {
    }

    onEndElement(name: string): void {
    }

    onError(code: XMLParserErrorCode): void {
    }
  }

  export class XMLParser extends XMLParserBase {
    private currentElement: ASXML;
    private elementsStack: ASXML[];
    private scopes: any[] = [];

    constructor(public sec: AXSecurityDomain) {
      super();
    }

    private isWhitespacePreserved(): boolean {
      var scopes = this.scopes;
      for (var j = scopes.length - 1; j >= 0; --j) {
        if (scopes[j].space === "preserve") {
          return true;
        }
      }
      return false;
    }

    private lookupDefaultNs(): string {
      var scopes = this.scopes;
      for (var j = scopes.length - 1; j >= 0; --j) {
        if ('xmlns' in scopes[j]) {
          return scopes[j].xmlns;
        }
      }
      return '';
    }

    private lookupNs(prefix: string): string {
      var scopes = this.scopes;
      for (var j = scopes.length - 1; j >= 0; --j) {
        if (prefix in scopes[j].lookup) {
          return scopes[j].lookup[prefix];
        }
      }
      return undefined;
    }

    private getName(name: string, resolveDefaultNs: boolean):
        {name: string; localName: string; prefix: string; namespace: string} {
      var j = name.indexOf(':');
      if (j >= 0) {
        var prefix = name.substring(0, j);
        var localName = name.substring(j + 1);
        var namespace = this.lookupNs(prefix);
        if (namespace === undefined) {
          this.sec.throwError('TypeError', Errors.XMLPrefixNotBound, prefix, localName);
        }
        return {
          name: namespace + '::' + localName,
          localName: localName,
          prefix: prefix,
          namespace: namespace,
        };
      } else if (resolveDefaultNs) {
        return {
          name: name,
          localName: name,
          prefix: '',
          namespace: this.lookupDefaultNs()
        };
      } else {
        return {
          name: name,
          localName: name,
          prefix: '',
          namespace: ''
        };
      }
    }

    onError(code: XMLParserErrorCode): void {
      switch (code) {
        case XMLParserErrorCode.MalformedElement:
          this.sec.throwError('TypeError', Errors.XMLMalformedElement);
          return;
        case XMLParserErrorCode.UnterminatedElement:
          this.sec.throwError('TypeError', Errors.XMLUnterminatedElement);
          return;
        case XMLParserErrorCode.UnterminatedDoctypeDeclaration:
          this.sec.throwError('TypeError', Errors.XMLUnterminatedDocTypeDecl);
          return;
        case XMLParserErrorCode.UnterminatedCdat:
          this.sec.throwError('TypeError', Errors.XMLUnterminatedCData);
          return;
        case XMLParserErrorCode.UnterminatedComment:
          this.sec.throwError('TypeError', Errors.XMLUnterminatedComment);
          return;
        case XMLParserErrorCode.UnterminatedXmlDeclaration:
          this.sec.throwError('TypeError', Errors.XMLUnterminatedXMLDecl);
          return;
      }
    }

    onPi(name: string, value: string): void {
      this.pi(name, value);
    }

    onComment(text: string): void {
      this.comment(text);
    }

    onCdata(text: string): void {
      this.cdata(text);
    }

    onDoctype(doctypeContent: string): void {
      this.doctype(doctypeContent);
    }

    onText(text: string): void {
      this.text(text, this.isWhitespacePreserved());
    }

    onBeginElement(name: string, contentAttributes: {name: string; value: string}[], isEmpty: boolean): void {
      var scopes = this.scopes;
      var scope = {
        namespaces: [],
        lookup: Object.create(null),
        inScopes: null
      };
      for (var q = 0; q < contentAttributes.length; ++q) {
        var attribute = contentAttributes[q];
        var attributeName = attribute.name;
        if (attributeName.substring(0, 6) === "xmlns:") {
          var prefix = attributeName.substring(6);
          var uri = attribute.value;
          if (this.lookupNs(prefix) !== uri) {
            scope.lookup[prefix] = trimWhitespaces(uri);
            var ns = internPrefixedNamespace(NamespaceType.Public, uri, prefix);
            scope.namespaces.push(ns);
          }
          contentAttributes[q] = null;
        } else if (attributeName === "xmlns") {
          var uri = attribute.value;
          if (this.lookupDefaultNs() !== uri) {
            scope["xmlns"] = trimWhitespaces(uri);
            var ns = internNamespace(NamespaceType.Public, uri);
            scope.namespaces.push(ns);
          }
          contentAttributes[q] = null;
        } else if (attributeName.substring(0, 4) === "xml:") {
          var xmlAttrName = attributeName.substring(4);
          scope[xmlAttrName] = trimWhitespaces(attribute.value);
        } else {
          // skip ordinary attributes until all xmlns have been handled
        }
      }
      // build list of all namespaces including ancestors'
      var inScopeNamespaces: Namespace[] = [];
      scope.namespaces.forEach(function (ns) {
        if (!ns.prefix || scope.lookup[ns.prefix] === ns.uri) {
          inScopeNamespaces.push(ns);
        }
      });
      scopes[scopes.length - 1].inScopes.forEach(function (ns) {
        if ((ns.prefix && !(ns.prefix in scope.lookup)) ||
          (!ns.prefix && !('xmlns' in scope))) {
          inScopeNamespaces.push(ns);
        }
      });
      scope.inScopes = inScopeNamespaces;

      scopes.push(scope);
      var attributes = [];
      for (q = 0; q < contentAttributes.length; ++q) {
        attribute = contentAttributes[q];
        if (attribute) {
          attributes.push({
            name: this.getName(attribute.name, false),
            value: attribute.value
          });
        }
      }
      this.beginElement(this.getName(name, true), attributes, inScopeNamespaces, isEmpty);
      if (isEmpty) {
        scopes.pop();
      }
    }

    onEndElement(name: string): void {
      this.endElement(this.getName(name, true));
      this.scopes.pop();
    }

    beginElement(name, attrs, namespaces: Namespace[], isEmpty: boolean) {
      var parent = this.currentElement;
      this.elementsStack.push(parent);
      this.currentElement = createXML(this.sec, ASXMLKind.Element, name.namespace,
                                      name.localName, name.prefix);
      for (var i = 0; i < attrs.length; ++i) {
        var rawAttr = attrs[i];
        var attr = createXML(this.sec, ASXMLKind.Attribute, rawAttr.name.namespace,
                             rawAttr.name.localName, rawAttr.name.prefix);
        attr._value = rawAttr.value;
        attr._parent = this.currentElement;
        this.currentElement._attributes.push(attr);
      }
      for (var i = 0; i < namespaces.length; ++i) {
        this.currentElement._inScopeNamespaces.push(namespaces[i]);
      }
      parent.insert(parent._children.length, this.currentElement);
      if (isEmpty) {
        this.currentElement = this.elementsStack.pop();
      }
    }

    endElement(name) {
      this.currentElement = this.elementsStack.pop();
    }

    text(text, isWhitespacePreserve) {
      if (this.sec.AXXML.ignoreWhitespace) {
        text = trimWhitespaces(text);
      }
      // TODO: do an in-depth analysis of what isWhitespacePreserve is about.
      if (text.length === 0 || isWhitespacePreserve && this.sec.AXXML.ignoreWhitespace) {
        return;
      }
      var node = createXML(this.sec);
      node._value = text;
      this.currentElement.insert(this.currentElement._children.length, node);
    }

    cdata(text) {
      var node = createXML(this.sec);
      node._value = text;
      this.currentElement.insert(this.currentElement._children.length, node);
    }

    comment(text) {
      if (this.sec.AXXML.ignoreComments) {
        return;
      }
      var node = createXML(this.sec, ASXMLKind.Comment, "", "");
      node._value = text;
      this.currentElement.insert(this.currentElement._children.length, node);
    }

    pi(name, value) {
      if (this.sec.AXXML.ignoreProcessingInstructions) {
        return;
      }
      var node = createXML(this.sec, ASXMLKind.ProcessingInstruction, "", name);
      node._value = value;
      this.currentElement.insert(this.currentElement._children.length, node);
    }

    doctype(text) { }

    parseFromString(s, mimeType?) {
      // placeholder
      var currentElement = this.currentElement = createXML(this.sec, ASXMLKind.Element,
                                                           '', '', '');
      this.elementsStack = [];

      var defaultNs = getDefaultNamespace(this.sec);
      var scopes: any[] = [{
        namespaces: [],
        lookup: {
          "xmlns": 'http://www.w3.org/2000/xmlns/',
          "xml": 'http://www.w3.org/XML/1998/namespace'
        },
        inScopes: [defaultNs],
        space: 'default',
        xmlns: defaultNs.uri
      }];
      this.scopes = scopes;

      this.parseXml(s);
      this.currentElement = null;
      if (this.elementsStack.length > 0) {
        var nm = this.elementsStack.pop()._name.name;
        this.sec.throwError('TypeError', Errors.XMLUnterminatedElementTag, nm, nm);
      }
      this.elementsStack = null;
      return currentElement;
    }
  }

  export class ASNamespace extends ASObject implements XMLType {
    public static instanceConstructor: any = ASNamespace;
    static classInitializer() {
      defineNonEnumerableProperty(this, '$Bglength', 2);
      var proto: any = this.dPrototype;
      var asProto: any = ASNamespace.prototype;
      defineNonEnumerableProperty(proto, '$BgtoString', asProto.toString);
    }

    _ns: Namespace;

    /**
     * 13.2.1 The Namespace Constructor Called as a Function
     *
     * Namespace ()
     * Namespace (uriValue)
     * Namespace (prefixValue, uriValue)
     */
    public static axApply(self: ASNamespace, args: any[]): ASNamespace {
      var a = args[0];
      var b = args[1];
      // 1. If (prefixValue is not specified and Type(uriValue) is Object and
      // uriValue.[[Class]] == "Namespace")
      if (args.length === 1 && isObject(a) && a.axClass === this.sec.AXNamespace)
      {
        // a. Return uriValue
        return a;
      }
      // 2. Create and return a new Namespace object exactly as if the Namespace constructor had
      // been called with the same arguments (section 13.2.2).
      switch (args.length) {
        case 0:
          return this.sec.AXNamespace.Create();
        case 1:
          return this.sec.AXNamespace.Create(a);
        default:
          return this.sec.AXNamespace.Create(a, b);
      }
    }

    static Create(uriOrPrefix_: any, uri_: any): ASNamespace {
      var ns: ASNamespace = Object.create(this.sec.AXNamespace.tPrototype);
      // The initializer relies on arguments.length being correct.
      ns.axInitializer.apply(ns, arguments);
      return ns;
    }

    static FromNamespace(ns: Namespace) {
      var result: ASNamespace = Object.create(this.sec.AXNamespace.tPrototype);
      result._ns = ns;
      return result;
    }

    public static defaultNamespace = Namespace.PUBLIC;

    axInitializer: (uriOrPrefix_?: any, uri_?: any) => any;

    /**
     * 13.2.2 The Namespace Constructor
     *
     * Namespace ()
     * Namespace (uriValue)
     * Namespace (prefixValue, uriValue)
     */
    constructor(uriOrPrefix_?: any, uri_?: any) {
      super();
      // 1. Create a new Namespace object n
      var uri: string = "";
      var prefix: string = "";
      // 2. If prefixValue is not specified and uriValue is not specified
      if (arguments.length === 0) {
        // a. Let n.prefix be the empty string
        // b. Let n.uri be the empty string
      }
      // 3. Else if prefixValue is not specified
      else if (arguments.length === 1) {
        var uriValue = uriOrPrefix_;
        if (uriValue instanceof Namespace) {
          this._ns = uriValue;
          return;
        }
        release || checkValue(uriValue);
        if (uriValue && typeof uriValue === 'object') {
          // Non-spec'ed, but very useful:
          // a. If Type(uriValue) is Object and uriValue.[[Class]] == "Namespace"
          if (uriValue.axClass === this.sec.AXNamespace) {
            var uriValueAsNamespace: ASNamespace = uriValue;
            // i. Let n.prefix = uriValue.prefix
            prefix = uriValueAsNamespace.prefix;
            // ii. Let n.uri = uriValue.uri
            uri = uriValueAsNamespace.uri;
          }
          // b. Else if Type(uriValue) is Object and uriValue.[[Class]] == "QName" and uriValue.uri
          // is not null
          else if (uriValue.axClass === this.sec.AXQName &&
                   (<ASQName>uriValue).uri !== null)
          {
            // i. Let n.uri = uriValue.uri
            uri = uriValue.uri;
            // NOTE implementations that preserve prefixes in qualified names may also set n.prefix
            // = uriValue.[[Prefix]]
          }
        }
        // c. Else
        else {
          // i. Let n.uri = ToString(uriValue)
          uri = toString(uriValue, this.sec);
          // ii. If (n.uri is the empty string), let n.prefix be the empty string
          if (uri === "") {
            prefix = "";
          }
          // iii. Else n.prefix = undefined
          else {
            prefix = undefined;
          }
        }
      }
      // 4. Else
      else {
        var prefixValue = uriOrPrefix_;
        var uriValue = uri_;
        // a. If Type(uriValue) is Object and uriValue.[[Class]] == "QName" and uriValue.uri is not
        // null
        if (isObject(uriValue) && uriValue.axClass === this.sec.AXQName &&
            (<ASQName>uriValue).uri !== null)
        {
          // i. Let n.uri = uriValue.uri
          uri = uriValue.uri
        }
        // b. Else
        else {
          // i. Let n.uri = ToString(uriValue)
          uri = toString(uriValue, this.sec);
        }
        // c. If n.uri is the empty string
        if (uri === "") {
          // i. If prefixValue is undefined or ToString(prefixValue) is the empty string
          if (prefixValue === undefined || toString(prefixValue, this.sec) === "") {
            // 1. Let n.prefix be the empty string
            prefix = "";
          }
          else {
            // ii. Else throw a TypeError exception
            this.sec.throwError('TypeError', Errors.XMLNamespaceWithPrefixAndNoURI, prefixValue);
          }
        }
        // d. Else if prefixValue is undefined, let n.prefix = undefined
        else if (prefixValue === undefined) {
          prefix = undefined;
        }
        // e. Else if isXMLName(prefixValue) == false
        else if (isXMLName(prefixValue, this.sec) === false) {
          // i. Let n.prefix = undefined
          prefix = undefined;
        }
        // f. Else let n.prefix = ToString(prefixValue)
        else {
          prefix = toString(prefixValue, this.sec);
        }
      }
      // 5. Return n
      this._ns = internPrefixedNamespace(NamespaceType.Public, uri, prefix);
    }

    // E4X 11.5.1 The Abstract Equality Comparison Algorithm, step 3.c.
    equals(other: any): boolean {
      return other && other.axClass === this.axClass &&
             (<ASNamespace>other)._ns.uri === this._ns.uri ||
             typeof other === 'string' && this._ns.uri === other;
    }

    get prefix(): any {
      return this._ns.prefix;
    }

    get uri(): string {
      return this._ns.uri;
    }

    toString() {
      if (this === this.axClass.dPrototype) {
        return '';
      }
      return this._ns.uri;
    }

    valueOf() {
      if (this === this.axClass.dPrototype) {
        return '';
      }
      return this._ns.uri;
    }

  }

  export class ASQName extends ASObject implements XMLType {
    static classInitializer() {
      defineNonEnumerableProperty(this, '$Bglength', 2);
      var proto: any = this.dPrototype;
      var asProto: any = ASQName.prototype;
      defineNonEnumerableProperty(proto, '$BgtoString', asProto.ecmaToString);
    }

    static Create(nameOrNS_: any, name_?: any, isAttribute?: boolean): ASQName {
      var name: ASQName = Object.create(this.sec.AXQName.tPrototype);
      // The initializer relies on arguments.length being correct.
      name.axInitializer.apply(name, arguments);
      return name;
    }

    static FromMultiname(mn: Multiname) {
      var name: ASQName = Object.create(this.sec.AXQName.tPrototype);
      name.name = mn;
      return name;

    }

    axInitializer: (nameOrNS_?: any, name_?: any) => any;

    /**
     * 13.3.1 The QName Constructor Called as a Function
     *
     * QName ( )
     * QName ( Name )
     * QName ( Namespace , Name )
     */
    public static axApply(self: ASNamespace, args: any[]): ASQName {
      var nameOrNS_ = args[0];
      var name_ = args[1];
      // 1. If Namespace is not specified and Type(Name) is Object and Name.[[Class]] == “QName”
      if (args.length === 1 && nameOrNS_ && nameOrNS_.axClass === this.sec.AXQName) {
        // a. Return Name
        return  nameOrNS_;
      }

      // 2. Create and return a new QName object exactly as if the QName constructor had been
      // called with the same arguments (section 13.3.2).
      switch (args.length) {
        case 0:
          return this.sec.AXQName.Create();
        case 1:
          return this.sec.AXQName.Create(nameOrNS_);
        default:
          return this.sec.AXQName.Create(nameOrNS_, name_);
      }
    }

    name: Multiname;

    /**
     * 13.3.2 The QName Constructor
     *
     * new QName ()
     * new QName (Name)
     * new QName (Namespace, Name)
     */
    constructor(nameOrNS_?: any, name_?: any) {
      super();

      var name;
      var namespace;

      if (arguments.length === 0) {
        name = "";
      } else if (arguments.length === 1) {
        name = nameOrNS_;
      } else { // if (arguments.length === 2) {
        namespace = nameOrNS_;
        name = name_;
      }

      // 1. If (Type(Name) is Object and Name.[[Class]] == "QName")
      if (name && name.axClass === this.sec.AXQName) {
        // a. If (Namespace is not specified), return a copy of Name
        if (arguments.length < 2) {
          release || assert(name !== tmpMultiname);
          this.name = (<ASQName>name).name;
          return;
        }
        // b. Else let Name = Name.localName
        else {
          name = (<ASQName>name).localName;
        }
      }
      // 2. If (Name is undefined or not specified)
      if (name === undefined) {
        // a. Let Name = ""
        name = "";
      }
      // 3. Else let Name = ToString(Name)
      else {
        name = toString(name, this.sec);
      }
      // 4. If (Namespace is undefined or not specified)
      if (namespace === undefined) {
        // a. If Name = "*"
        if (name === "*") {
          // i. Let Namespace = null
          namespace = null;
        }
        // b. Else
        else {
          // i. Let Namespace = GetDefaultNamespace()
          namespace = getDefaultNamespace(this.sec);
        }
      }
      // 5. Let q be a new QName with q.localName = Name
      var localName = name;
      var ns: Namespace = null;
      // 6. If Namespace == null
      if (namespace !== null) {
        // a. Let Namespace be a new Namespace created as if by calling the constructor new
        // Namespace(Namespace)
        if (namespace.axClass !== this.sec.AXNamespace) {
          namespace = this.sec.AXNamespace.Create(namespace);
        }
        ns = namespace._ns;
        //// b. Let q.uri = Namespace.uri
        //uri = namespace.uri;
        // NOTE implementations that preserve prefixes in qualified names may also set
        // q.[[Prefix]] to Namespace.prefix
      //} else {
        // a. Let q.uri = null
        // NOTE implementations that preserve prefixes in qualified names may also set q.[[Prefix]]
        // to undefined
        //uri = null;
      }
      // 8. Return q
      this.name = new Multiname(null, 0, CONSTANT.QName, [ns], localName);
    }

    // E4X 11.5.1 The Abstract Equality Comparison Algorithm, step 3.b.
    equals(other: any): boolean {
      return other && other.axClass === this.sec.AXQName &&
             (<ASQName>other).uri === this.uri && (<ASQName>other).name.name === this.name.name ||
             typeof other === 'string' && this.toString() === other;
    }

    get localName(): string {
      return this.name.name;
    }

    get uri(): string {
      var namespaces = this.name.namespaces;
      return namespaces.length > 1 ? '' : namespaces[0] ? namespaces[0].uri : null;
    }

    ecmaToString(): string {
      if (this && <any>this === this.sec.AXQName.dPrototype) {
        return "";
      }
      if (!(this && this.axClass === this.sec.AXQName)) {
        this.sec.throwError('TypeError', Errors.InvokeOnIncompatibleObjectError,
                            "QName.prototype.toString");
      }
      return this.toString();
    }

    toString() {
      var uri = this.uri;
      if (uri === "") {
        return this.name.name;
      }
      if (uri === null) {
        return "*::" + this.name.name;
      }
      uri = uri + '';
      var cc = uri.charCodeAt(uri.length - 1);
      // strip the version mark, if there is one
      var base_uri = uri;
      if(cc >= 0xE000 && cc <= 0xF8FF) {
        base_uri = uri.substr(0, uri.length - 1);
      }
      if (base_uri === "") {
        return this.name.name;
      }
      return base_uri + "::" + this.name.name;
    }

    valueOf() {
      return this;
    }

    /**
     * 13.3.5.3 [[Prefix]]
     * The [[Prefix]] property is an optional internal property that is not directly visible to
     * users. It may be used by implementations that preserve prefixes in qualified names. The
     * value of the [[Prefix]] property is a value of type string or undefined. If the [[Prefix]]
     * property is undefined, the prefix associated with this QName is unknown.
     */
    get prefix(): string {
      return this.name.namespaces[0] ? this.name.namespaces[0].prefix : null;
    }
  }

  enum ASXML_FLAGS {
    FLAG_IGNORE_COMMENTS                = 0x01,
    FLAG_IGNORE_PROCESSING_INSTRUCTIONS = 0x02,
    FLAG_IGNORE_WHITESPACE              = 0x04,
    FLAG_PRETTY_PRINTING                = 0x08,
    ALL = FLAG_IGNORE_COMMENTS | FLAG_IGNORE_PROCESSING_INSTRUCTIONS | FLAG_IGNORE_WHITESPACE | FLAG_PRETTY_PRINTING
  }

  // Note: the order of the entries is relevant, because some checks are of
  // the form `type > ASXMLKind.Element`.
  export enum ASXMLKind {
    Element = 1,
    Attribute = 2,
    Text = 3,
    Comment = 4,
    ProcessingInstruction = 5
  }

  var ASXMLKindNames = [null, 'element', 'attribute', 'text', 'comment', 'processing-instruction'];

  export interface XMLType {
    equals(other: any): boolean;
    axClass: any;
  }

  export class ASXML extends ASObject implements XMLType {
    public static instanceConstructor: any = ASXML;
    static classInitializer() {
      defineNonEnumerableProperty(this, '$Bglength', 1);
      var proto: any = this.dPrototype;
      var asProto: any = ASXML.prototype;
      addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);
      defineNonEnumerableProperty(proto, '$BghasOwnProperty', asProto.native_hasOwnProperty);
      defineNonEnumerableProperty(proto, '$BgpropertyIsEnumerable',
                                  asProto.native_propertyIsEnumerable);

      addPrototypeFunctionAlias(<any>this, '$Bgsettings', ASXML.native_settings);
      addPrototypeFunctionAlias(<any>this, '$BgsetSettings', ASXML.native_setSettings);
      addPrototypeFunctionAlias(<any>this, '$BgdefaultSettings', ASXML.native_defaultSettings);

      addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgaddNamespace', asProto.addNamespace);
      addPrototypeFunctionAlias(proto, '$BgappendChild', asProto.appendChild);
      addPrototypeFunctionAlias(proto, '$Bgattribute', asProto.attribute);
      addPrototypeFunctionAlias(proto, '$Bgattributes', asProto.attributes);
      addPrototypeFunctionAlias(proto, '$Bgchild', asProto.child);
      addPrototypeFunctionAlias(proto, '$BgchildIndex', asProto.childIndex);
      addPrototypeFunctionAlias(proto, '$Bgchildren', asProto.children);
      addPrototypeFunctionAlias(proto, '$Bgcomments', asProto.comments);
      addPrototypeFunctionAlias(proto, '$Bgcontains', asProto.contains);
      addPrototypeFunctionAlias(proto, '$Bgcopy', asProto.copy);
      addPrototypeFunctionAlias(proto, '$Bgdescendants', asProto.descendants);
      addPrototypeFunctionAlias(proto, '$Bgelements', asProto.elements);
      addPrototypeFunctionAlias(proto, '$BghasComplexContent', asProto.hasComplexContent);
      addPrototypeFunctionAlias(proto, '$BghasSimpleContent', asProto.hasSimpleContent);
      addPrototypeFunctionAlias(proto, '$BginScopeNamespaces', asProto.inScopeNamespaces);
      addPrototypeFunctionAlias(proto, '$BginsertChildAfter', asProto.insertChildAfter);
      addPrototypeFunctionAlias(proto, '$BginsertChildBefore', asProto.insertChildBefore);
      addPrototypeFunctionAlias(proto, '$Bglength', asProto.length);
      addPrototypeFunctionAlias(proto, '$BglocalName', asProto.localName);
      addPrototypeFunctionAlias(proto, '$Bgname', asProto.name);
      addPrototypeFunctionAlias(proto, '$Bgnamespace', asProto.namespace);
      addPrototypeFunctionAlias(proto, '$BgnamespaceDeclarations', asProto.namespaceDeclarations);
      addPrototypeFunctionAlias(proto, '$BgnodeKind', asProto.nodeKind);
      addPrototypeFunctionAlias(proto, '$Bgnormalize', asProto.normalize);
      addPrototypeFunctionAlias(proto, '$Bgparent', asProto.parent);
      addPrototypeFunctionAlias(proto, '$BgprocessingInstructions', asProto.processingInstructions);
      addPrototypeFunctionAlias(proto, '$BgprependChild', asProto.prependChild);
      addPrototypeFunctionAlias(proto, '$BgremoveNamespace', asProto.removeNamespace);
      addPrototypeFunctionAlias(proto, '$Bgreplace', asProto.replace);
      addPrototypeFunctionAlias(proto, '$BgsetChildren', asProto.setChildren);
      addPrototypeFunctionAlias(proto, '$BgsetLocalName', asProto.setLocalName);
      addPrototypeFunctionAlias(proto, '$BgsetName', asProto.setName);
      addPrototypeFunctionAlias(proto, '$BgsetNamespace', asProto.setNamespace);
      addPrototypeFunctionAlias(proto, '$Bgtext', asProto.text);
      addPrototypeFunctionAlias(proto, '$BgtoXMLString', asProto.toXMLString);
      addPrototypeFunctionAlias(proto, '$BgtoJSON', asProto.toJSON);
    }

    static Create(value?: any): ASXML {
      var xml: ASXML = Object.create(this.sec.AXXML.tPrototype);
      xml.axInitializer(value);
      return xml;
    }

    static resetSettings() {
      this._flags = ASXML_FLAGS.ALL;
    }

    axInitializer: (value?: any) => any;


    static native_settings():Object {
      var settings = Object.create(this.sec.AXObject.tPrototype);
      settings.$BgignoreComments = this.ignoreComments;
      settings.$BgignoreProcessingInstructions = this.ignoreProcessingInstructions;
      settings.$BgignoreWhitespace = this.ignoreWhitespace;
      settings.$BgprettyPrinting = this.prettyPrinting;
      settings.$BgprettyIndent = this.prettyIndent;
      return settings;
    }

    static native_setSettings(o:any):void {
      if (isNullOrUndefined(o)) {
        this.ignoreComments = true;
        this.ignoreProcessingInstructions = true;
        this.ignoreWhitespace = true;
        this.prettyPrinting = true;
        this.prettyIndent = 2;
        return;
      }

      if (typeof o.$BgignoreComments === 'boolean') {
        this.ignoreComments = o.$BgignoreComments;
      }
      if (typeof o.$BgignoreProcessingInstructions === 'boolean') {
        this.ignoreProcessingInstructions = o.$BgignoreProcessingInstructions;
      }
      if (typeof o.$BgignoreWhitespace === 'boolean') {
        this.ignoreWhitespace = o.$BgignoreWhitespace;
      }
      if (o.$BgprettyPrinting === 'boolean') {
        this.prettyPrinting = o.$BgprettyPrinting;
      }
      if (o.$BgprettyIndent === 'number') {
        this.prettyIndent = o.$BgprettyIndent;
      }
    }

    static native_defaultSettings():Object {
      return {
        __proto__: this.sec.AXObject.tPrototype,
        $BgignoreComments: true,
        $BgignoreProcessingInstructions: true,
        $BgignoreWhitespace: true,
        $BgprettyPrinting: true,
        $BgprettyIndent: 2
      };
    }

    private static _flags: ASXML_FLAGS = ASXML_FLAGS.ALL;
    private static _prettyIndent = 2;
    _attributes: ASXML[];
    _inScopeNamespaces: Namespace[];

    // These properties are public so ASXMLList can access them.
    _kind: ASXMLKind;
    _name: Multiname;
    _value: any;
    _parent: ASXML;
    _children: ASXML[];

    public static axApply(self: ASXML, args: any[]): ASXML {
      var value = args[0];
      // 13.5.1 The XMLList Constructor Called as a Function
      if (isNullOrUndefined(value)) {
        value = '';
      }
      return toXML(value, this.sec);
    }

    constructor (value?: any) {
      super();
      this._parent = null;

      if (isNullOrUndefined(value)) {
        value = "";
      }
      if (typeof value === 'string' && value.length === 0) {
        this._kind = ASXMLKind.Text;
        this._value = '';
        return;
      }
      var x = toXML(value, this.sec);
      if (isXMLType(value, this.sec)) {
        x = x._deepCopy();
      }
      this._kind = x._kind;
      this._name = x._name;
      this._value = x._value;
      this._attributes = x._attributes;
      this._inScopeNamespaces = x._inScopeNamespaces;
      var children = x._children;
      this._children = children;
      if (children) {
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          child._parent = this;
        }
      }
    }

    valueOf() {
      return this;
    }

    // E4X 11.5.1 The Abstract Equality Comparison Algorithm, steps 1-4.
    equals(other: any): boolean {
      // Steps 1,2.
      if (other && other.axClass === this.sec.AXXMLList) {
        return other.equals(this);
      }
      // Step 3.
      if (other && other.axClass === this.sec.AXXML) {
        // Step 3.a.i.
        var otherXML = <ASXML>other;
        if ((this._kind === ASXMLKind.Text || this._kind === ASXMLKind.Attribute) &&
            otherXML.hasSimpleContent() ||
            (otherXML._kind === ASXMLKind.Text || otherXML._kind === ASXMLKind.Attribute) &&
            this.hasSimpleContent()) {
          return this.toString() === other.toString();
        }
        // Step 3.a.ii.
        return this._deepEquals(other);
        // The rest of step 3 is implemented in {Namespace,QName}.equals and non-E4X parts of the
        // engine.
      }
      // Step 4.
      return this.hasSimpleContent() && this.toString() === axCoerceString(other);
      // The remaining steps are implemented by other means in the interpreter/compiler.
    }

    init(kind: number, mn: Multiname) {
      this._name = mn;
      this._kind = kind;    // E4X [[Class]]
      this._parent = null;
      switch (<ASXMLKind> kind) {
        case ASXMLKind.Element:
          this._inScopeNamespaces = [];
          this._attributes = [];
          this._children = [];  // child nodes go here
          break;
        case ASXMLKind.Comment:
        case ASXMLKind.ProcessingInstruction:
        case ASXMLKind.Attribute:
        case ASXMLKind.Text:
          this._value = '';
          break;
        default:
          break;
      }
      return this;
    }

    // 9.1.1.9 [[Equals]] (V)
    _deepEquals(V: XMLType) {
      // Step 1.
      if (!V || V.axClass !== this.sec.AXXML) {
        return false;
      }
      var other = <ASXML>V;
      // Step 2.
      if (this._kind !== other._kind) {
        return false;
      }
      // Steps 3-4.
      if (!!this._name !== !!other._name || (this._name && !this._name.equalsQName(other._name))) {
        return false;
      }
      // Not in the spec, but a substantial optimization.
      if (this._kind !== ASXMLKind.Element) {
        // Step 7.
        // This only affects non-Element nodes, so moved up here.
        if (this._value !== other._value) {
          return false;
        }
        return true;
      }
      // Step 5.
      var attributes = this._attributes;
      var otherAttributes = other._attributes;
      if (attributes.length !== otherAttributes.length) {
        return false;
      }
      // Step 6.
      var children = this._children;
      var otherChildren = other._children;
      if (children.length !== otherChildren.length) {
        return false;
      }
      // Step 8.
      attribOuter: for (var i = 0; i < attributes.length; i++) {
        var attribute = attributes[i];
        for (var j = 0; j < otherAttributes.length; j++) {
          var otherAttribute = otherAttributes[j];
          if (otherAttribute._name.equalsQName(attribute._name) &&
              otherAttribute._value === attribute._value) {
            continue attribOuter;
          }
        }
        return false;
      }
      // Step 9.
      for (var i = 0; i < children.length; i++) {
        if (!children[i].equals(otherChildren[i])) {
          return false;
        }
      }
      // Step 10.
      return true;
    }

    // 9.1.1.7 [[DeepCopy]] ( )
    _deepCopy(): ASXML {
      var kind: ASXMLKind = this._kind;
      var clone = this.sec.AXXML.Create();
      clone._kind = kind;
      clone._name = this._name;
      switch (kind) {
        case ASXMLKind.Element:
          clone._inScopeNamespaces = this._inScopeNamespaces.slice();
          clone._attributes = this._attributes.map(function (attr) {
            attr = attr._deepCopy();
            attr._parent = clone;
            return attr;
          });
          clone._children = this._children.map(function (child) {
            child = child._deepCopy();
            child._parent = clone;
            return child;
          });
          break;
        case ASXMLKind.Comment:
        case ASXMLKind.ProcessingInstruction:
        case ASXMLKind.Attribute:
        case ASXMLKind.Text:
          clone._value = this._value;
          break;
        default:
          break;
      }
      return clone;
    }

    // 9.1.1.10 [[ResolveValue]] ( )
    resolveValue() {
      return this;
    }

    _addInScopeNamespace(ns: Namespace) {
      if (this._inScopeNamespaces.some(function (ins) { return ins.uri === ns.uri && ins.prefix === ns.prefix; })) {
        return;
      }
      this._inScopeNamespaces.push(ns);
    }

    static get ignoreComments(): boolean {
      return !!(this._flags & ASXML_FLAGS.FLAG_IGNORE_COMMENTS);
    }
    static set ignoreComments(newIgnore: boolean) {
      newIgnore = !!newIgnore;
      if (newIgnore) {
        this._flags |= ASXML_FLAGS.FLAG_IGNORE_COMMENTS;
      } else {
        this._flags &= ~ASXML_FLAGS.FLAG_IGNORE_COMMENTS;
      }
    }
    static get ignoreProcessingInstructions(): boolean {
      return !!(this._flags & ASXML_FLAGS.FLAG_IGNORE_PROCESSING_INSTRUCTIONS);
    }
    static set ignoreProcessingInstructions(newIgnore: boolean) {
      newIgnore = !!newIgnore;
      if (newIgnore) {
        this._flags |= ASXML_FLAGS.FLAG_IGNORE_PROCESSING_INSTRUCTIONS;
      } else {
        this._flags &= ~ASXML_FLAGS.FLAG_IGNORE_PROCESSING_INSTRUCTIONS;
      }
    }
    static get ignoreWhitespace(): boolean {
      return !!(this._flags & ASXML_FLAGS.FLAG_IGNORE_WHITESPACE);
    }
    static set ignoreWhitespace(newIgnore: boolean) {
      newIgnore = !!newIgnore;
      if (newIgnore) {
        this._flags |= ASXML_FLAGS.FLAG_IGNORE_WHITESPACE;
      } else {
        this._flags &= ~ASXML_FLAGS.FLAG_IGNORE_WHITESPACE;
      }
    }
    static get prettyPrinting(): boolean {
      return !!(this._flags & ASXML_FLAGS.FLAG_PRETTY_PRINTING);
    }
    static set prettyPrinting(newPretty: boolean) {
      newPretty = !!newPretty;
      if (newPretty) {
        this._flags |= ASXML_FLAGS.FLAG_PRETTY_PRINTING;
      } else {
        this._flags &= ~ASXML_FLAGS.FLAG_PRETTY_PRINTING;
      }
    }
    static get prettyIndent(): number /*int*/ {
      return this._prettyIndent;
    }
    static set prettyIndent(newIndent: number /*int*/) {
      newIndent = newIndent | 0;
      this._prettyIndent = newIndent;
    }
    toString(): string {
      if (this === this.axClass.dPrototype) {
        return '';
      }
      if (this.hasComplexContent()) {
        return this.toXMLString();
      }
      return toString(this, this.sec);
    }
    // 13.4.4.14 XML.prototype.hasOwnProperty ( P )
    native_hasOwnProperty(P: string): boolean {
      if (this === this.axClass.dPrototype) {
        return ASObject.prototype.native_hasOwnProperty.call(this, P);
      }
      var mn = toXMLName(P, this.sec);
      if (this.hasProperty(mn)) {
        return true;
      }
      return this.axHasOwnProperty(mn);
    }
    // 13.4.4.30 XML.prototype.propertyIsEnumerable ( P )
    native_propertyIsEnumerable(P: any = undefined): boolean {
      return String(P) === "0";
    }
    addNamespace(ns: any): ASXML {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      // 13.4.4.2 XML.prototype.addNamespace ( namespace )
      this._addInScopeNamespace(ns);
      return this;
    }
    appendChild(child: any): ASXML {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      this.insert(this._children.length, child);
      return this;
    }
    attribute(arg: any): ASXMLList {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      if (isNullOrUndefined(arg) && arguments.length > 0) {
        this.sec.throwError('TypeError', Errors.ConvertUndefinedToObjectError);
      }
      if (arg && arg.axClass === this.sec.AXQName) {
        return this.getProperty((<ASQName>arg).name);
      }
      arg = axCoerceString(arg);
      if (arg === '*' || arguments.length === 0) {
        arg = null;
      }
      tmpMultiname.name = arg;
      tmpMultiname.namespaces = [Namespace.PUBLIC];
      tmpMultiname.kind = CONSTANT.QNameA;
      return this.getProperty(tmpMultiname);
    }
    attributes(): ASXMLList {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      var list = this.sec.AXXMLList.CreateList(this, this._name);
      Array.prototype.push.apply(list._children, this._attributes);
      return list;
    }

    // 13.4.4.6
    child(propertyName: any /* string|number|QName */): ASXMLList {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      // Step 1.
      if (isIndex(propertyName)) {
        var list = this.sec.AXXMLList.CreateList(null, null);
        if (this._children && propertyName < this._children.length) {
          list.append(this._children[propertyName | 0]);
        }
        return list;
      }
      // Steps 2-3.
      var mn: Multiname;
      if (propertyName && propertyName.axClass === this.sec.AXQName) {
        mn = (<any>propertyName).name;
      } else {
        mn = tmpMultiname;
        mn.kind = CONSTANT.QName;
        mn.name = toString(propertyName, this.sec);
      }
      return this.getProperty(mn);
    }
    childIndex(): number /*int*/ {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      // 13.4.4.7 XML.prototype.childIndex ( )
      if (!this._parent || this._kind === ASXMLKind.Attribute) {
        return -1;
      }
      return this._parent._children.indexOf(this);
    }
    children(): ASXMLList {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      var xl = this.sec.AXXMLList.CreateList(this, this._name);
      xl._children = this._children.concat();
      return xl;
    }
    comments() {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      // 13.4.4.9 XML.prototype.comments ( )
      var xl = this.sec.AXXMLList.CreateList(this, this._name);
      this._children && this._children.forEach(function (v, i) {
        if (v._kind === ASXMLKind.Comment) {
          xl.append(v);
        }
      });
      return xl;
    }
    contains(value: any): boolean {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      // 13.4.4.10 XML.prototype.contains ( value )
      return this === value;
    }
    copy(): ASXML {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      return this._deepCopy();
    }
    // 9.1.1.8 [[Descendants]] (P)
    descendants(name: any): ASXMLList {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      var xl = this.sec.AXXMLList.CreateList(this, this._name);
      return this.descendantsInto(toXMLName(name, this.sec), xl);
    }
    elements(name: any): ASXMLList {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      // 13.4.4.13 XML.prototype.elements ( [ name ] )
      return this.getProperty(toXMLName(name, this.sec));
    }
    hasComplexContent(): boolean {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      // 13.4.4.15 XML.prototype.hasComplexContent( )
      if (this._kind === ASXMLKind.Attribute ||
          this._kind === ASXMLKind.Comment ||
          this._kind === ASXMLKind.ProcessingInstruction ||
          this._kind === ASXMLKind.Text) {
        return false;
      }
      return this._children.some(function (child) {
        return child._kind === ASXMLKind.Element;
      });
    }
    hasSimpleContent(): boolean {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      // 13.4.4.16 XML.prototype.hasSimpleContent()
      if (this._kind === ASXMLKind.Comment ||
          this._kind === ASXMLKind.ProcessingInstruction) {
        return false;
      }
      if (this._kind !== ASXMLKind.Element) {
        return true;
      }
      if (!this._children && this._children.length === 0) {
        return true;
      }
      return this._children.every(function (child) {
        return child._kind !== ASXMLKind.Element;
      });
    }

    // 13.4.4.17
    inScopeNamespaces(): ASNamespace[] {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      var namespaces = this._inScopeNamespacesImpl();
      var result = [];
      for (var i = 0; i < namespaces.length; i++) {
        var AXNamespace = this.sec.AXNamespace;
        result[i] = AXNamespace.FromNamespace(namespaces[i]);
      }
      return this.sec.AXArray.axBox(result);
    }

    private _inScopeNamespacesImpl() {
      // Step 1.
      var y = this;
      // Step 2.
      var inScopeNS: Namespace[] = [];
      var inScopeNSMap = inScopeNS;
      // Step 3.
      while (y !== null) {
        // Step 3.a.
        var namespaces = y._inScopeNamespaces;
        for (var i = 0; namespaces && i < namespaces.length; i++) {
          var ns = namespaces[i];
          if (!inScopeNSMap[ns.prefix]) {
            inScopeNSMap[ns.prefix] = ns;
            inScopeNS.push(ns);
          }
        }
        // Step 3.b.
        y = y._parent;
      }
      return inScopeNS;
    }

    // 13.4.4.18
    insertChildAfter(child1: any, child2: any): any {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }

      // Step 1.
      if (this._kind > ASXMLKind.Element) {
        return;
      }

      // Step 2.
      if (child1 == null) {
        this.insert(0, child2);
        return this;
      }

      // Step 3.
      // The spec doesn't mention it, but Tamarin seems to unpack single-entry XMLLists here.
      if (child1.axClass === this.sec.AXXMLList && child1._children.length === 1) {
        child1 = child1._children[0];
      }
      if (child1.axClass === this.sec.AXXML) {
        for (var i = 0; i < this._children.length; i++) {
          var child = this._children[i];
          if (child === child1) {
            this.insert(i + 1, child2);
            return this;
          }
        }
      }

      // Step 4 (implicit).
    }

    // 13.4.4.19
    insertChildBefore(child1: any, child2: any): any {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }

      // Step 1.
      if (this._kind > ASXMLKind.Element) {
        return;
      }

      // Step 2.
      if (child1 == null) {
        this.insert(this._children.length, child2);
        return this;
      }

      // Step 3.
      // The spec doesn't mention it, but Tamarin seems to unpack single-entry XMLLists here.
      if (child1.axClass === this.sec.AXXMLList && child1._children.length === 1) {
        child1 = child1._children[0];
      }
      if (child1.axClass === this.sec.AXXML) {
        for (var i = 0; i < this._children.length; i++) {
          var child = this._children[i];
          if (child === child1) {
            this.insert(i, child2);
            return this;
          }
        }
      }

      // Step 4 (implicit).
    }

    // XML.[[Length]]
    length(): number {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      if (!this._children) {
        return 0;
      }
      return this._children.length;
    }
    localName(): Object {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      return this._name.name;
    }
    name(): Object {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      return this.sec.AXQName.FromMultiname(this._name);
    }

    // 13.4.4.23
    namespace(prefix?: string): any {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      // Step 4.a.
      if (arguments.length === 0 && this._kind >= ASXMLKind.Text) {
        return null;
      }
      // Steps 1-3.
      var inScopeNS = this._inScopeNamespacesImpl();
      // Step 4.
      if (arguments.length === 0) {
        // Step 4.b.
        return this.sec.AXNamespace.FromNamespace(GetNamespace(this._name, inScopeNS));
      }
      // Step 5.a.
      prefix = axCoerceString(prefix);
      // Step 5.b-c.
      for (var i = 0; i < inScopeNS.length; i++) {
        var ns = inScopeNS[i];
        if (ns.prefix === prefix) {
          return this.sec.AXNamespace.FromNamespace(ns);
        }
      }
      // Step 5.b alternate clause implicit.
    }
    namespaceDeclarations(): any [] {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      notImplemented("public.XML::namespaceDeclarations"); return;
    }
    nodeKind(): string {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      return ASXMLKindNames[this._kind];
    }
    normalize(): ASXML {
      if (!this || this.axClass !== this.sec.AXXML) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, this, 'XML');
      }
      // Steps 1-2.
      for (var i = 0; i < this._children.length;) {
        var child = this._children[i];
        // Step 2.a.
        if (child._kind === ASXMLKind.Element) {
          child.normalize();
          i++;
        }
        // Step 2.b.
        else if (child._kind === ASXMLKind.Text) {
          // Step 2.b.i.
          while (i + 1 < this._children.length) {
            var nextChild = this._children[i + 1];
            if (nextChild._kind !== ASXMLKind.Text) {
              break;
            }
            child._value += nextChild._value;
            this.removeByIndex(i + 1);
          }
          // Step 2.b.ii.
          // The spec says to only remove 0-length nodes, but Tamarin removes whitespace-only
          // nodes, too.
          if (child._value.length === 0 || isWhitespaceString(child._value)) {
            this.removeByIndex(i);
          }
          // Step 2.b.iii.
          else {
            i++;
          }
        }
        // Step 2.c.
        else {
          i++;
        }
      }
      return this;
    }

    private removeByIndex(index: number) {
      var child = this._children[index];
      child._parent = null;
      this._children.splice(index, 1);
    }

    parent(): any {
      // Absurdly, and in difference to what the spec says, parent() returns `undefined` for null.
      return this._parent || undefined;
    }
    // 13.4.4.28 XML.prototype.processingInstructions ( [ name ] )
    processingInstructions(name: any): ASXMLList {
      // Step 1 (implicit).
      // Step 3.
      var list = this.sec.AXXMLList.CreateList(this, this._name);
      list._targetObject = this;
      list._targetProperty = null;
      // Steps 2,4-5.
      return this.processingInstructionsInto(toXMLName(name, this.sec), list);
    }
    processingInstructionsInto(name: Multiname, list: ASXMLList) {
      var localName = name || '*';
      // Step 4.
      var children = this._children;
      if (!children) {
        return list;
      }
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child._kind === ASXMLKind.ProcessingInstruction &&
            (localName === '*' || child._name.name === localName)) {
          list._children.push(child);
        }
      }
      // Step 5.
      return list;
    }

    // 13.4.4.29
    prependChild(child: any): ASXML {
      this.insert(0, child);
      return this;
    }

    removeNamespace(ns: any): ASXML {

      notImplemented("public.XML::removeNamespace"); return;
    }

    // 13.4.4.32 XML.prototype.replace
    replace(propertyName: any, value: any): ASXML {
      // Step 1.
      if (this._kind !== ASXMLKind.Element) {
        return;
      }
      var c;
      // Step 2.
      if (!value || value.axClass !== this.axClass && value.axClass !== this.sec.AXXMLList) {
        c = axCoerceString(value);
      }
      // Step 3.
      else {
        c = value._deepCopy();
      }
      // Step 4.
      var mn = toXMLName(propertyName, this.sec);
      if (isIndex(mn.name)) {
        this._replaceByIndex(mn.name|0, c);
        // Step 10.
        return this;
      }
      var isAnyName = mn.isAnyName();
      // Step 5 (Implicit).
      // Step 6.
      var i = -1;
      // Step 7.
      var children = this._children;
      for (var k = children.length; k--;) {
        // Step 7.a.
        var child = children[k];
        if (isAnyName || child._kind === ASXMLKind.Element && child._name.matches(mn)) {
          // Step 7.a.i.
          if (i !== -1) {
            this.deleteByIndex(i);
          }
          // Step 7.a.i.
          i = k;
        }
      }
      // Step 8.
      if (i === -1) {
        // Step 10.
        return this;
      }
      // Step 9.
      this._replaceByIndex(i, c);
      // Step 10.
      return this;
    }

    // 9.1.1.12 [[Replace]] (P, V)
    _replaceByIndex(p: number, v: any): ASXML {
      // Step 1.
      if (this._kind > ASXMLKind.Element) {
        return this;
      }
      // Steps 2-3. (Implicit, guaranteed by assert).
      release || assert(typeof p === 'number' && p >>> 0 === p);
      // Step 4.
      var children = this._children;
      if (p > children.length) {
        p = children.length;
      }
      // Step 5.
      if (v && v.axClass === this.axClass && v._kind !== ASXMLKind.Attribute) {
        // Step 5.a.
        if (v._kind === ASXMLKind.Element) {
          var a = this;
          while (a) {
            if (a === v) {
              this.sec.throwError("Error", Errors.XMLIllegalCyclicalLoop);
            }
            a = a._parent;
          }
        }
        // Step 5.b.
        v._parent = this;
        // Step 5.c.
        if (children[p]) {
          children[p]._parent = null;
        }
        // Step 5.d.
        children[p] = v;
      }
      // Step 6.
      else if (v && v.axClass === this.sec.AXXMLList) {
        // Inlined steps.
        if (v._children.length === 0) {
          this.deleteByIndex(p);
        } else {
          var n = v._children.length;
          if (p < children.length) {
            children[p]._parent = null;
            for (var i = children.length - 1; i > p; i--) {
              children[i + n] = children[i];
            }
          }
          for (var i = 0; i < n; i++) {
            var child = v._children[i];
            child._parent = this;
            children[i + p] = child;
          }
        }
      }
      // Step 7.
      else {
        // Step 7.a.
        var s = axCoerceString(v);
        // Step 7.b.
        var t = this.axClass.Create();
        t._kind = ASXMLKind.Text;
        t._value = s;
        t._parent = this;
        // Step 7.c.
        if (children[p]) {
          children[p]._parent = null;
        }
        // Step 7.d.
        children[p] = t;
      }
    }

    setChildren(value: any): ASXML {
      this.setProperty(anyMultiname, value);
      return this;
    }
    // 13.4.4.34 XML.prototype.setLocalName( name )
    setLocalName(name_: any): void {
      // Step 1.
      if (this._kind === ASXMLKind.Text || this._kind === ASXMLKind.Comment) {
        return;
      }
      var name;
      // Step 2.
      if (name_ && name_.axClass === this.sec.AXQName) {
        name = name_.localName;
      } else {
        // Step 3.
        name = axCoerceString(name_);
      }
      // Step 4.
      this._name.name = name;
    }
    // 13.4.4.35 XML.prototype.setName( name )
    setName(name_: any): void {
      // Step 1.
      if (this._kind === ASXMLKind.Text || this._kind === ASXMLKind.Comment) {
        return;
      }
      // Step 2.
      if (name_ && name_.axClass === this.sec.AXQName && (<ASQName>name_).uri === null) {
        name_ = name_.localName;
      }
      // Step 3.
      var name: Multiname = this.sec.AXQName.Create(name_).name;
      // Step 4.
      if (this._kind === ASXMLKind.ProcessingInstruction) {
        release || assert(name.namespaces[0].type === NamespaceType.Public);
        name.namespaces[0] = Namespace.PUBLIC;
      }
      // Step 5.
      this._name = name;
      // Steps 6-8.
      var node = this;
      if (this._kind === ASXMLKind.Attribute) {
        if (this._parent === null) {
          return;
        }
        node = this._parent;
      }
      node.addInScopeNamespace(name.namespaces[0]);
    }
    setNamespace(ns: any): void {
      // Step 1.
      if (this._kind === ASXMLKind.Text || this._kind === ASXMLKind.Comment ||
          this._kind === ASXMLKind.ProcessingInstruction)
      {
        return;
      }
      // Step 2.
      var ns2 = this.sec.AXNamespace.Create(ns)._ns;
      // Step 3.
      this._name.namespaces = [ns2];
      // Step 4.
      if (this._kind === ASXMLKind.Attribute) {
        if (this._parent) {
          this._parent.addInScopeNamespace(ns2);
        }
      // Step 5.
      } else if (this._kind === ASXMLKind.Element) {
        this.addInScopeNamespace(ns2);
      }
    }
    text() {
      // 13.4.4.37 XML.prototype.text ( );
      var xl = this.sec.AXXMLList.CreateList(this, this._name);
      this._children && this._children.forEach(function (v, i) {
        if (v._kind === ASXMLKind.Text) {
          xl.append(v);
        }
      });
      return xl;
    }
    toXMLString(): string {

      return this.toXMLStringImpl();
    }

    private toXMLStringImpl(ancestorNamespaces?: Namespace[], indentLevel?: number) {
      var node = this;
      var sec = this.sec;
      // 10.2.1 ToXMLString Applied to the XML Type
      var prettyPrinting = sec.AXXML.prettyPrinting;
      indentLevel |= 0;
      var s = prettyPrinting ? getIndentString(indentLevel) : '';

      var kind: ASXMLKind = node._kind;
      switch (kind) {
        // 4. If x.[[Class]] == "text",
        case ASXMLKind.Text:
          return prettyPrinting ?
                 s + escapeElementValue(sec, trimWhitespaces(node._value)) :
                 escapeElementValue(sec, node._value);
        // 5. If x.[[Class]] == "attribute", return the result of concatenating s and
        // EscapeAttributeValue(x.[[Value]])
        case ASXMLKind.Attribute:
          return s + escapeAttributeValue(node._value);
        // 6. If x.[[Class]] == "comment", return the result of concatenating s, the string "<!--",
        // x.[[Value]] and the string "-->"
        case ASXMLKind.Comment:
          return s + '<!--' + node._value + '-->';
        // 7 If x.[[Class]] == "processing-instruction", return the result of concatenating s, the
        // string "<?", x.[[Name]].localName, the space <SP> character, x.[[Value]] and the string
        // "?>"
        case ASXMLKind.ProcessingInstruction:
          return s + '<?' + node._name.name + ' ' + node._value + '?>';
        default:
          release || assert(kind === ASXMLKind.Element);
          break;
      }

      ancestorNamespaces = ancestorNamespaces || [];
      var namespaceDeclarations: Namespace[] = [];

      // 10. For each ns in x.[[InScopeNamespaces]]
      for (var i = 0; node._inScopeNamespaces && i < node._inScopeNamespaces.length; i++) {
        var ns = node._inScopeNamespaces[i];
        if (ancestorNamespaces.every(function (ans) { return ans.uri !== ns.uri || ans.prefix !== ns.prefix; })) {
          namespaceDeclarations.push(ns);
        }
      }
      // 11. For each name in the set of names consisting of x.[[Name]] and the name of each
      // attribute in x.[[Attributes]]
      var currentNamespaces = ancestorNamespaces.concat(namespaceDeclarations);
      var namespace = GetNamespace(node._name, currentNamespaces);
      if (namespace.prefix === undefined) {
        // Let namespace.prefix be an arbitrary implementation defined namespace prefix, such that
        // there is no ns2 ∈ (AncestorNamespaces ∪ namespaceDeclarations) with namespace.prefix ==
        // ns2.prefix
        var newPrefix = generateUniquePrefix(currentNamespaces);
        var ns2 = internPrefixedNamespace(NamespaceType.Public, namespace.uri, newPrefix);
        // Let namespaceDeclarations = namespaceDeclarations ∪ { namespace }
        namespaceDeclarations.push(ns2);
        currentNamespaces.push(ns2);
      }

      // 12. Let s be the result of concatenating s and the string "<"
      // 13. If namespace.prefix is not the empty string,
      //   a. Let s be the result of concatenating s, namespace.prefix and the string ":"
      // 14. Let s be the result of concatenating s and x.[[Name]].localName
      var elementName = (namespace.prefix ? namespace.prefix + ':' : '') + node._name.name;
      s += '<' + elementName;

      node._attributes && node._attributes.forEach(function (attr: ASXML) {
        var name = attr._name;
        var namespace = GetNamespace(name, currentNamespaces);
        if (namespace.prefix === undefined) {
          // Let namespace.prefix be an arbitrary implementation defined namespace prefix, such that
          // there is no ns2 ∈ (AncestorNamespaces ∪ namespaceDeclarations) with namespace.prefix ==
          // ns2.prefix
          var newPrefix = generateUniquePrefix(currentNamespaces);
          var ns2 = internPrefixedNamespace(NamespaceType.Public, namespace.uri, newPrefix);
          // Let namespaceDeclarations = namespaceDeclarations ∪ { namespace }
          namespaceDeclarations.push(ns2);
          currentNamespaces.push(ns2);
        }
      });

      for (var i = 0; i < namespaceDeclarations.length; i++) {
        var namespace = namespaceDeclarations[i];
        if (namespace.uri === '') {
          continue;
        }
        var attributeName = namespace.prefix ? 'xmlns:' + namespace.prefix : 'xmlns';
        s += ' ' +  attributeName + '="' + escapeAttributeValue(namespace.uri) + '"';
      }
      node._attributes && node._attributes.forEach(function (attr) {
        var name: Multiname = attr._name;
        var namespace = GetNamespace(name, ancestorNamespaces);
        var attributeName = namespace.prefix ? namespace.prefix + ':' + name.name : name.name;
        s += ' ' +  attributeName + '="' + escapeAttributeValue(attr._value) + '"';
      });

      // 17. If x.[[Length]] == 0
      if (node._children.length === 0) {
        //   a. Let s be the result of concatenating s and "/>"
        s += '/>';
        //   b. Return s
        return s;
      }

      // 18. Let s be the result of concatenating s and the string ">"
      s += '>';
      // 19. Let indentChildren = ((x.[[Length]] > 1) or (x.[[Length]] == 1 and x[0].[[Class]] is
      // not equal to "text"))
      var indentChildren = node._children.length > 1 ||
                           (node._children.length === 1 && node._children[0]._kind !== ASXMLKind.Text);
      var nextIndentLevel = (prettyPrinting && indentChildren) ?
                            indentLevel + sec.AXXML._prettyIndent : 0;

      node._children.forEach(function (childNode, i) {
        if (prettyPrinting && indentChildren) {
          s += '\n';
        }
        s += childNode.toXMLStringImpl(currentNamespaces, nextIndentLevel);
      });
      if (prettyPrinting && indentChildren) {
        s += '\n' + getIndentString(indentLevel);
      }

      s += '</' + elementName + '>';
      return s;
    }
    toJSON(k: string) {
      return 'XML';
    }

    axGetEnumerableKeys() {
      if (this === this.axClass.dPrototype) {
        return super.axGetEnumerableKeys();
      }
      var keys = [];
      for (var i = 0; i < this._children.length; i++) {
        keys.push(this._children[i]._name.name);
      }
      return keys;
    }

    // 9.1.1.2 [[Put]] (P, V)
    setProperty(mn: Multiname, v) {
      release || assert(mn instanceof Multiname);
      // Step 1. (Step 3 in Tamarin source.)
      var sec = this.sec;
      if (!mn.isAnyName() && !mn.isAttribute() && mn.name === mn.name >>> 0) {
        sec.throwError('TypeError', Errors.XMLAssignmentToIndexedXMLNotAllowed);
      }
      // Step 2. (Step 4 in Tamarin source.)
      if (this._kind === ASXMLKind.Text || this._kind === ASXMLKind.Comment ||
          this._kind === ASXMLKind.ProcessingInstruction || this._kind === ASXMLKind.Attribute) {
        return;
      }
      // Step 3.
      var c;
      if (!isXMLType(v, sec) || v._kind === ASXMLKind.Text ||
          v._kind === ASXMLKind.Attribute)
      {
        c = toString(v, sec);
        // Step 4.
      } else {
        c = v._deepCopy();
      }
      // Step 5 (implicit, mn is always a Multiname here).
      // Step 6 (7 in Tamarin).
      if (mn.isAttribute()) {
        // Step 6.a (omitted, as in Tamarin).
        // Step 6.b.
        if (c && c.axClass === sec.AXXMLList) {
          // Step 6.b.i.
          if (c._children.length === 0) {
            c = '';
            // Step 6.b.ii.
          } else {
            // Step 6.b.ii.1.
            var s = toString(c._children[0], sec);
            // Step 6.b.ii.2.
            for (var j = 1; j < c._children.length; j++) {
              s += ' ' + toString(c._children[j], sec);
            }
            // Step 6.b.ii.3.
            c = s;
          }
          // Step 6.c.
        } else {
          c = axCoerceString(c);
        }
        // Step 6.d.
        var a: ASXML = null;
        // Step 6.e.
        var attributes = this._attributes;
        var newAttributes = this._attributes = [];
        for (var j = 0; attributes && j < attributes.length; j++) {
          var attribute = attributes[j];
          if (attribute._name.matches(mn)) {
            // Step 6.e.1.
            if (!a) {
              a = attribute;
              // Step 6.e.2.
            } else {
              attribute._parent = null;
              continue;
            }
          }
          newAttributes.push(attribute);
        }
        // Step 6.f.
        if (!a) {
          // Wildcard attribute names shouldn't cause any attributes to be *added*, so we can bail
          // here. Tamarin doesn't do this, and it's not entirely clear to me how they avoid
          // adding attributes, but this works and doesn't regress any tests.
          if (mn.isAnyName()) {
            return;
          }
          var uri = '';
          if (mn.namespaces.length === 1) {
            uri = mn.namespaces[0].uri;
          }
          a = createXML(sec, ASXMLKind.Attribute, uri, mn.name);
          a._parent = this;
          newAttributes.push(a);
          // TODO: implement the namespace parts of step f.
        }
        // Step 6.g.
        a._value = c;
        // Step 6.h.
        return;
      }

      var i;
      var isAny = mn.isAnyName();
      var primitiveAssign = !isXMLType(c, sec) && !isAny && mn.name !== '*';
      var isAnyNamespace = mn.isAnyNamespace();
      for (var k = this._children.length - 1; k >= 0; k--) {
        if ((isAny || this._children[k]._kind === ASXMLKind.Element &&
          this._children[k]._name.name === mn.name) &&
          (isAnyNamespace ||
           this._children[k]._kind === ASXMLKind.Element &&
           this._children[k]._name.matches(mn))) {
          if (i !== undefined) {
            this.deleteByIndex(i);
          }
          i = k;
        }
      }
      if (i === undefined) {
        i = this._children.length;
        if (primitiveAssign) {
          var ns = mn.namespaces[0];
          var uri: string = null;
          var prefix;
          if (ns.uri !== null) {
            uri = ns.uri;
            prefix = ns.prefix;
          }
          if (uri === null) {
            var defaultNamespace = getDefaultNamespace(sec);
            uri = defaultNamespace.uri;
            prefix = defaultNamespace.prefix;
          }
          var y = createXML(sec, ASXMLKind.Element, uri, mn.name, prefix);
          y._parent = this;
          this._replaceByIndex(i, y);
          var ns = y._name.namespace;
          y.addInScopeNamespace(ns);
        }
      }
      if (primitiveAssign) {
        // Blow away kids of x[i].
        var subChildren = this._children[i]._children;
        for (var j = subChildren.length; j--;) {
          subChildren[j]._parent = null;
        }
        subChildren.length = 0;
        var s = toString(c, sec);
        if (s !== "") {
          this._children[i]._replaceByIndex(0, s);
        }
      } else {
        this._replaceByIndex(i, c);
      }
    }

    axSetProperty(mn: Multiname, value: any, bc: Bytecode) {
      if (this === this.axClass.dPrototype) {
        release || checkValue(value);
        this[this.axResolveMultiname(mn)] = value;
        return;
      }
      this.setProperty(coerceE4XMultiname(mn, this.sec), value);
    }

    // 9.1.1.1 XML.[[Get]] (P)
    getProperty(mn: Multiname): any {
      release || assert(mn instanceof Multiname);
      // Step 1.
      var nm = mn.name;
      if (isIndex(nm)) {
        // this is a shortcut to the E4X logic that wants us to create a new
        // XMLList with of size 1 and access it with the given index.
        if ((nm|0) === 0) {
          return this;
        }
        return null;
      }
      // Step 2 (implicit).
      // Step 3.
      var list = this.sec.AXXMLList.CreateList(this, mn);
      var length = 0;
      var anyName = mn.isAnyName();
      var anyNamespace = mn.isAnyNamespace();

      // Step 4.
      if (mn.isAttribute()) {
        for (var i = 0; this._attributes && i < this._attributes.length; i++) {
          var v = this._attributes[i];
          if ((anyName || v._name.name === nm) &&
              (anyNamespace || v._name.matches(mn))) {
            list._children[length++] = v;
            assert(list._children[0]);
          }
        }
        return list;
      }
      // Step 5.
      for (var i = 0; this._children && i < this._children.length; i++) {
        var v = this._children[i];
        if ((anyName || v._kind === ASXMLKind.Element && v._name.name === nm) &&
            ((anyNamespace || v._name.matches(mn)))) {
          list._children[length++] = v;
          assert(list._children[0]);
        }
      }
      // Step 6.
      return list;
    }

    axGetProperty(mn: Multiname): any {
      if (this === this.axClass.dPrototype) {
        var value = this[this.axResolveMultiname(mn)];
        release || checkValue(value);
        return value;
      }
      return this.getProperty(coerceE4XMultiname(mn, this.sec));
    }

    // 9.1.1.6 [[HasProperty]] (P) (well, very roughly)
    hasProperty(mn: Multiname): boolean {
      if (isIndex(mn.name)) {
        // this is a shortcut to the E4X logic that wants us to create a new
        // XMLList of size 1 and access it with the given index.
        return (<any>mn.name|0) === 0;
      }
      var name = toXMLName(mn, this.sec);
      var anyName = name.isAnyName();
      var anyNamespace = name.isAnyNamespace();
      if (mn.isAttribute()) {
        for (var i = 0; this._attributes && i < this._attributes.length; i++) {
          var v = this._attributes[i];
          if (anyName || v._name.matches(name)) {
            return true;
          }
        }
        return false;
      }
      for (var i = 0; i < this._children.length; i++) {
        var v = this._children[i];
        if ((anyName || v._kind === ASXMLKind.Element && v._name.name === name.name) &&
            (anyNamespace || v._kind === ASXMLKind.Element && v._name.matches(name))) {
          return true;
        }
      }
    }

    deleteProperty(mn: Multiname) {
      if (isIndex(mn.name)) {
        // This hasn't ever been implemented and silently does nothing in Tamarin (and Rhino).
        return true;
      }
      var name = toXMLName(mn, this.sec);
      var localName = name.name;
      var anyName = mn.isAnyName();
      var anyNamespace = mn.isAnyNamespace();
      if (mn.isAttribute()) {
        var attributes = this._attributes;
        if (attributes) {
          var newAttributes = this._attributes = [];
          for (var i = 0; i < attributes.length; i++) {
            var node = attributes[i];
            var attrName = node._name;
            if ((anyName || attrName.name === localName) &&
                (anyNamespace || attrName.matches(name))) {
              node._parent = null;
            } else {
              newAttributes.push(node);
            }
          }
        }
      } else {
        if (this._children.some(function (v, i): any {
          return (anyName || v._kind === ASXMLKind.Element && v._name.name === name.name) &&
                 (anyNamespace || v._kind === ASXMLKind.Element && v._name.matches(name));
        })) {
          return true;
        }
      }
    }

    axHasProperty(mn: Multiname): boolean {
      if (this === this.axClass.dPrototype) {
        return super.axHasPropertyInternal(mn);
      }
      return this.axHasPropertyInternal(mn);
    }

    axHasPropertyInternal(mn: Multiname): boolean {
      if (this.hasProperty(mn)) {
        return true;
      }

      // HACK if child with specific name is not present, check object's attributes.
      // The presence of the attribute/method can be checked during with(), see #850.
      return !!this[this.axResolveMultiname(mn)];
    }

    axDeleteProperty(mn: Multiname) {
      if (this.deleteProperty(mn)) {
        return true;
      }

      // HACK if child with specific name is not present, check object's attributes.
      // The presence of the attribute/method can be checked during with(), see #850.
      return delete this[this.axResolveMultiname(mn)];
    }

    axCallProperty(mn: Multiname, args: any []): any {
      var method = this[this.axResolveMultiname(mn)];
      // The method might be dynamically defined on XML.prototype.
      if (!method) {
        method = this['$Bg' + mn.name];
      }
      // Check if the method exists before calling it.
      if (method) {
        validateCall(this.sec, method, args.length);
        return method.axApply(this, args);
      }

      // Otherwise, 11.2.2.1 CallMethod ( r , args )
      // If f == undefined and Type(base) is XMLList and base.[[Length]] == 1
      //   ii. Return the result of calling CallMethod(r0, args) recursively

      // f. If f == undefined and Type(base) is XML and base.hasSimpleContent () == true
      //   i. Let r0 be a new Reference with base object = ToObject(ToString(base)) and property
      // name = P ii. Return the result of calling CallMethod(r0, args) recursively
      if (this.hasSimpleContent()) {
        return this.sec.box(toString(this, this.sec)).axCallProperty(mn, args);
      }
      this.sec.throwError('TypeError', Errors.CallOfNonFunctionError, 'value');
    }

    _delete(key, isMethod) {
      notImplemented("XML.[[Delete]]");
    }

    deleteByIndex (p: number) {
      var i = p >>> 0;
      if (String(i) !== String(p)) {
        throw "TypeError in XML.prototype.deleteByIndex(): invalid index " + p;
      }
      var children = this._children;
      if (p < children.length && children[p]) {
        children[p]._parent = null;
        children.splice(p, 1);
      }
    }

    // 9.1.1.11 [[Insert]] (P, V)
    insert(p: number, v: any): void {
      // Step 1.
      if (this._kind > ASXMLKind.Element) {
        return;
      }

      // Steps 2-3 (Guaranteed by assert).
      release || assert(typeof p === 'number' && isIndex(p));
      var i = p;

      // Step 4.
      if (v && v.axClass === this.axClass) {
        var a = this;
        while (a) {
          if (a === v) {
            this.sec.throwError('TypeError', Errors.XMLIllegalCyclicalLoop);
          }
          a = a._parent;
        }
      }

      // Step 5.
      var n = 1;

      // Step 6.
      if (v && v.axClass === this.sec.AXXMLList) {
        n = v._children.length;
        // Step 7.
        if (n === 0) {
          return;
        }
      }

      // Step 8.
      var ownChildren = this._children;
      for (var j = ownChildren.length - 1; j >= i; j--) {
        ownChildren[j + n] = ownChildren[j];
        assert(ownChildren[0]);
      }

      // Step 9 (implicit).

      // Step 10.
      if (v && v.axClass === this.sec.AXXMLList) {
        n = v._children.length;
        for (var j = 0; j < n; j++) {
          v._children[j]._parent = this;
          ownChildren[i + j] = v._children[j];
        }
        // Step 11.
      } else {
        //x.replace(i, v), inlined;
        if (!(v && v.axClass === this.axClass)) {
          v = this.sec.AXXML.Create(v);
        }
        v._parent = this;
        if (!ownChildren) {
          this._children = ownChildren = [];
        }
        ownChildren[i] = v;
        assert(ownChildren[0]);
      }
    }

    // 9.1.1.13 [[AddInScopeNamespace]] ( N )
    addInScopeNamespace(ns: Namespace) {
      if (this._kind === ASXMLKind.Text ||
          this._kind === ASXMLKind.Comment ||
          this._kind === ASXMLKind.ProcessingInstruction ||
          this._kind === ASXMLKind.Attribute) {
        return;
      }
      var prefix = ns.prefix;
      if (prefix !== undefined) {
        if (prefix === "" && this._name.uri === "") {
          return;
        }
        var match = null;
        this._inScopeNamespaces.forEach(function (v, i) {
          if (v.prefix === prefix) {
            match = v;
          }
        });
        if (match !== null && match.uri !== ns.uri) {
          this._inScopeNamespaces.forEach(function (v, i) {
            if (v.prefix === match.prefix) {
              this._inScopeNamespaces[i] = ns;  // replace old with new
            }
          });
        }
        if (this._name.prefix === prefix) {
          this._name.prefix = undefined;
        }
        this._attributes.forEach(function (v, i) {
          if (v._name.prefix === prefix) {
            v._name.prefix = undefined;
          }
        });
      }
    }

    descendantsInto(name: Multiname, xl: ASXMLList) {
      if (this._kind !== ASXMLKind.Element) {
        return xl;
      }
      var length = xl._children.length;
      var isAny = name.isAnyName();
      if (name.isAttribute()) {
        // Get attributes
        this._attributes.forEach(function (v, i) {
          if (isAny || v._name.matches(name)) {
            xl._children[length++] = v;
            assert(xl._children[0]);
          }
        });
      } else {
        // Get children
        this._children.forEach(function (v, i) {
          if (isAny || v._name.matches(name)) {
            xl._children[length++] = v;
            assert(xl._children[0]);
          }
        });
      }
      // Descend
      this._children.forEach(function (v, i) {
        v.descendantsInto(name, xl);
      });
      return xl;
    }
  }

  function createXML(sec: AXSecurityDomain, kind: ASXMLKind = ASXMLKind.Text,
                     uri: string = '', name: string = '', prefix?: string): ASXML {
    var xml = sec.AXXML.Create();
    var ns = internPrefixedNamespace(NamespaceType.Public, uri, prefix || '');
    var mn = new Multiname(null, 0,
                           kind === ASXMLKind.Attribute ? CONSTANT.QNameA : CONSTANT.QName,
                           [ns], name, null);
    xml.init(kind, mn);
    return xml;
  }

  export class ASXMLList extends ASObject implements XMLType {
    public static instanceConstructor: any = ASXMLList;
    static classInitializer() {
      defineNonEnumerableProperty(this, '$Bglength', 1);

      var proto: any = this.dPrototype;
      var asProto: any = ASXMLList.prototype;
      defineNonEnumerableProperty(proto, '$BgvalueOf', Object.prototype['$BgvalueOf']);
      defineNonEnumerableProperty(proto, '$BghasOwnProperty', asProto.native_hasOwnProperty);
      defineNonEnumerableProperty(proto, '$BgpropertyIsEnumerable',
                                  asProto.native_propertyIsEnumerable);

      addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgaddNamespace', asProto.addNamespace);
      addPrototypeFunctionAlias(proto, '$BgappendChild', asProto.appendChild);
      addPrototypeFunctionAlias(proto, '$Bgattribute', asProto.attribute);
      addPrototypeFunctionAlias(proto, '$Bgattributes', asProto.attributes);
      addPrototypeFunctionAlias(proto, '$Bgchild', asProto.child);
      addPrototypeFunctionAlias(proto, '$BgchildIndex', asProto.childIndex);
      addPrototypeFunctionAlias(proto, '$Bgchildren', asProto.children);
      addPrototypeFunctionAlias(proto, '$Bgcomments', asProto.comments);
      addPrototypeFunctionAlias(proto, '$Bgcontains', asProto.contains);
      addPrototypeFunctionAlias(proto, '$Bgcopy', asProto.copy);
      addPrototypeFunctionAlias(proto, '$Bgdescendants', asProto.descendants);
      addPrototypeFunctionAlias(proto, '$Bgelements', asProto.elements);
      addPrototypeFunctionAlias(proto, '$BghasComplexContent', asProto.hasComplexContent);
      addPrototypeFunctionAlias(proto, '$BghasSimpleContent', asProto.hasSimpleContent);
      addPrototypeFunctionAlias(proto, '$BginScopeNamespaces', asProto.inScopeNamespaces);
      addPrototypeFunctionAlias(proto, '$BginsertChildAfter', asProto.insertChildAfter);
      addPrototypeFunctionAlias(proto, '$BginsertChildBefore', asProto.insertChildBefore);
      addPrototypeFunctionAlias(proto, '$Bglength', asProto.length);
      addPrototypeFunctionAlias(proto, '$BglocalName', asProto.localName);
      addPrototypeFunctionAlias(proto, '$Bgname', asProto.name);
      addPrototypeFunctionAlias(proto, '$Bgnamespace', asProto.namespace);
      addPrototypeFunctionAlias(proto, '$BgnamespaceDeclarations', asProto.namespaceDeclarations);
      addPrototypeFunctionAlias(proto, '$BgnodeKind', asProto.nodeKind);
      addPrototypeFunctionAlias(proto, '$Bgnormalize', asProto.normalize);
      addPrototypeFunctionAlias(proto, '$Bgparent', asProto.parent);
      addPrototypeFunctionAlias(proto, '$BgprocessingInstructions', asProto.processingInstructions);
      addPrototypeFunctionAlias(proto, '$BgprependChild', asProto.prependChild);
      addPrototypeFunctionAlias(proto, '$BgremoveNamespace', asProto.removeNamespace);
      addPrototypeFunctionAlias(proto, '$Bgreplace', asProto.replace);
      addPrototypeFunctionAlias(proto, '$BgsetChildren', asProto.setChildren);
      addPrototypeFunctionAlias(proto, '$BgsetLocalName', asProto.setLocalName);
      addPrototypeFunctionAlias(proto, '$BgsetName', asProto.setName);
      addPrototypeFunctionAlias(proto, '$BgsetNamespace', asProto.setNamespace);
      addPrototypeFunctionAlias(proto, '$Bgtext', asProto.text);
      addPrototypeFunctionAlias(proto, '$BgtoXMLString', asProto.toXMLString);
      addPrototypeFunctionAlias(proto, '$BgtoJSON', asProto.toJSON);
    }

    public static axApply(self: ASXMLList, args: any[]): ASXMLList {
      var value = args[0];
      // 13.5.1 The XMLList Constructor Called as a Function
      if (isNullOrUndefined(value)) {
        value = '';
      }
      if (value && value.axClass === this.sec.AXXMLList) {
        return value;
      }
      var list = this.sec.AXXMLList.Create();
      toXMLList(value, list);
      return list;
    }

    // 11.4.1 The Addition Operator ( + )
    public static addXML(left: ASXMLList, right: ASXMLList) {
      var result: ASXMLList;
      if (left.axClass === left.sec.AXXML) {
        result = left.sec.AXXMLList.Create();
        result.append(left);
      } else {
        result = left;
      }
      result.append(right);
      return result;
    }

    _children: ASXML [];
    _targetObject: any; // ASXML|ASXMLList
    _targetProperty: Multiname;

    static Create(value?: any): ASXMLList {
      var list: ASXMLList = Object.create(this.sec.AXXMLList.tPrototype);
      list.axInitializer(value);
      return list;
    }

    axInitializer: (value?: any) => any;

    constructor (value?: any) {
      super();
      this._children = [];

      if (isNullOrUndefined(value)) {
        value = "";
      }
      if (!value) {
        return;
      }

      if (value && value.axClass === this.sec.AXXMLList) {
        var children = (<ASXMLList>value)._children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          this._children[i] = child;
          assert(this._children[0]);
        }
      } else {
        toXMLList(value, this);
      }
    }

    static CreateList(targetObject: AS.ASXML, targetProperty: Multiname) {
      var list = this.Create();
      list._targetObject = targetObject;
      list._targetProperty = targetProperty;
      return list;
    }

    valueOf() {
      return this;
    }

    // E4X 11.5.1 The Abstract Equality Comparison Algorithm, steps 1-2.
    // (but really 9.2.1.9 [[Equals]] (V))
    equals(other: any): boolean {
      var children = this._children;
      // Step 1.
      if (other === undefined && children.length === 0) {
        return true;
      }
      // Step 2.
      if (other && other.axClass === this.sec.AXXMLList) {
        var otherChildren = other._children;
        // Step 2.a.
        if (otherChildren.length !== children.length) {
          return false;
        }
        // Step 2.b.
        for (var i = 0; i < children.length; i++) {
          if (!children[i].equals(otherChildren[i])) {
            return false;
          }
        }
        // Step 2.c.
        return true;
      }
      // Steps 3-4.
      return children.length === 1 && children[0].equals(other);
    }

    toString(): string {
      if (this.hasComplexContent()) {
        return this.toXMLString();
      }
      var s = '';
      for (var i = 0; i < this._children.length; i++) {
        s += toString(this._children[i], this.sec);
      }
      return s;
    }

    // 9.2.1.7 [[DeepCopy]] ( )
    _deepCopy() {
      var xl = this.sec.AXXMLList.CreateList(this._targetObject, this._targetProperty);
      var length = this._children.length;
      for (var i = 0; i < length; i++) {
        xl._children[i] = this._children[i]._deepCopy();
        assert(xl._children[0]);
      }
      return xl;
    }

    _shallowCopy() {
      var xl = this.sec.AXXMLList.CreateList(this._targetObject, this._targetProperty);
      var length = this._children.length;
      for (var i = 0; i < length; i++) {
        xl._children[i] = this._children[i];
        assert(xl._children[0]);
      }
      return xl;
    }

    // 13.5.4.12 XMLList.prototype.hasOwnProperty ( P )
    native_hasOwnProperty(P: string): boolean {
      P = axCoerceString(P);
      if (<any>this === this.sec.AXXMLList.dPrototype) {
        return ASObject.prototype.native_hasOwnProperty.call(this, P);
      }
      if (isIndex(P)) {
        return (<any>P|0) < this._children.length;
      }

      var mn = toXMLName(P, this.sec);
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        var node = children[i];
        if (node._kind === ASXMLKind.Element) {
          if (node.hasProperty(mn)) {
            return true;
          }
        }
      }
      return false;
    }
    // 13.5.4.19 XMLList.prototype.propertyIsEnumerable ( P )
    native_propertyIsEnumerable(P: any): boolean {
      return isIndex(P) && (P|0) < this._children.length;
    }
    attribute(arg: any): ASXMLList {
      if (isNullOrUndefined(arg) && arguments.length > 0) {
        this.sec.throwError('TypeError', Errors.ConvertUndefinedToObjectError);
      }
      if (arg && arg.axClass === this.sec.AXQName) {
        return this.getProperty((<ASQName>arg).name);
      }
      arg = axCoerceString(arg);
      if (arg === '*' || arguments.length === 0) {
        arg = null;
      }
      tmpMultiname.name = arg;
      tmpMultiname.namespaces = [Namespace.PUBLIC];
      tmpMultiname.kind = CONSTANT.QNameA;
      return this.getProperty(tmpMultiname);
    }
    attributes(): ASXMLList {
      // 13.5.4.3 XMLList.prototype.attributes ( )
      tmpMultiname.name = null;
      tmpMultiname.namespaces = [];
      tmpMultiname.kind = CONSTANT.QNameA;
      return this.getProperty(tmpMultiname);
    }
    child(propertyName: any): ASXMLList {
      if (isIndex(propertyName)) {
        var list = this.sec.AXXMLList.CreateList(this._targetObject, this._targetProperty);
        if ((propertyName | 0) < this._children.length) {
          list._children[0] = this._children[propertyName | 0]._deepCopy();
          assert(list._children[0]);
        }
        return list;
      }
      return this.getProperty(toXMLName(propertyName, this.sec));
    }
    children(): ASXMLList {
      // 13.5.4.4 XMLList.prototype.child ( propertyName )
      return this.getProperty(anyMultiname);
    }
    // 9.2.1.8 [[Descendants]] (P)
    descendants(name_: any): ASXMLList {
      var name = toXMLName(name_, this.sec);
      var list = this.sec.AXXMLList.CreateList(this._targetObject, this._targetProperty);
      for (var i = 0; i < this._children.length; i++) {
        var child = this._children[i];
        if (child._kind === ASXMLKind.Element) {
          child.descendantsInto(name, list);
        }
      }
      return list;
    }
    comments(): ASXMLList {
      // 13.5.4.6 XMLList.prototype.comments ( )
      var xl = this.sec.AXXMLList.CreateList(this._targetObject, this._targetProperty);
      this._children.forEach(function (child) {
        if ((<any> child)._kind === ASXMLKind.Element) {
          var r = child.comments();
          Array.prototype.push.apply(xl._children, r._children);
        }
      });
      return xl;
    }

    // 13.5.4.8 XMLList.prototype.contains ( value )
    contains(value: any): boolean {
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.equals(value)) {
          return true;
        }
      }
      return false;
    }
    copy(): ASXMLList {
      // 13.5.4.9 XMLList.prototype.copy ( )
      return this._deepCopy();
    }
    elements(name: any): ASXMLList {
      // 13.5.4.11 XMLList.prototype.elements ( [ name ] )
      var mn = toXMLName(name, this.sec);
      var xl = this.sec.AXXMLList.CreateList(this._targetObject, mn);
      this._children.forEach(function (child) {
        if ((<any> child)._kind === ASXMLKind.Element) {
          var r = child.elements(mn);
          Array.prototype.push.apply(xl._children, r._children);
        }
      });
      return xl;
    }
    hasComplexContent(): boolean {
      // 13.5.4.13 XMLList.prototype.hasComplexContent( )
      switch (this._children.length) {
        case 0:
          return false;
        case 1:
          return this._children[0].hasComplexContent();
        default:
          return this._children.some(function (child) {
            return (<any> child)._kind === ASXMLKind.Element;
          });
      }
    }
    hasSimpleContent(): boolean {
      // 13.5.4.14 XMLList.prototype.hasSimpleContent( )
      switch (this._children.length) {
        case 0:
          return true;
        case 1:
          return this._children[0].hasSimpleContent();
        default:
          return this._children.every(function (child) {
            return (<any> child)._kind !== ASXMLKind.Element;
          });
      }
    }
    length(): number /*int*/ {
      return this._children.length;
    }
    name(): Object {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'name');
      }
      return this._children[0].name();
    }

    // 13.5.4.16 XMLList.prototype.normalize ( )
    normalize(): ASXMLList {
      // Steps 1-2.
      for (var i = 0; i < this._children.length;) {
        var child = this._children[i];
        // Step 2.a.
        if (child._kind === ASXMLKind.Element) {
          child.normalize();
          i++;
        }
        // Step 2.b.
        else if (child._kind === ASXMLKind.Text) {
          // Step 2.b.i.
          for (i++; i < this._children.length;) {
            var nextChild = this._children[i];
            if (nextChild._kind !== ASXMLKind.Text) {
              break;
            }
            child._value += nextChild._value;
            this.removeByIndex(i);
          }
          // Step 2.b.ii.
          if (child._value.length === 0) {
            this.removeByIndex(i);
          }
          // Step 2.b.iii.
          else {
            i++;
          }
        }
        // Step 2.c.
        else {
          i++;
        }
      }
      return this;
    }

    parent(): any {
      // 13.5.4.17 XMLList.prototype.parent ( )
      var children = this._children;
      if (children.length === 0) {
        return undefined;
      }
      var parent = children[0]._parent;
      for (var i = 1; i < children.length; i++) {
        if (children[i]._parent !== parent) {
          return undefined;
        }
      }
      return parent;
    }
    // 13.5.4.18 XMLList.prototype.processingInstructions ( [ name ] )
    processingInstructions(name_: any): ASXMLList {
      // (Numbering in the spec starts at 6.)
      // Step 6 (implicit).
      // Step 7.
      var name = toXMLName(name_, this.sec);
      // Step 8.
      var list = this.sec.AXXMLList.CreateList(this._targetObject, this._targetProperty);
      list._targetObject = this;
      list._targetProperty = null;
      // Step 9.
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        children[i].processingInstructionsInto(name, list);
      }
      // Step 10.
      return list;
    }
    text(): ASXMLList {
      // 13.5.4.20 XMLList.prototype.text ( )
      var xl = this.sec.AXXMLList.CreateList(this._targetObject, this._targetProperty);
      this._children.forEach(function (v:any, i) {
        if (v._kind === ASXMLKind.Element) {
          var gq = v.text();
          if (gq._children.length > 0) {
            xl._children.push(gq);
          }
        }
      });
      return xl;
    }
    toXMLString(): string {
      // 10.2.2 ToXMLString Applied to the XMLList Type
      var sec = this.sec;
      return this._children.map(function (childNode) {
        return toXMLString(sec, childNode);
      }).join(sec.AXXML.prettyPrinting ? '\n' : '');
    }
    toJSON(k: string) {
      return 'XMLList';
    }
    addNamespace(ns: any): ASXML {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'addNamespace');
      }
      var xml = this._children[0];
      xml.addNamespace(ns);
      return xml;
    }
    appendChild(child: any) {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'appendChild');
      }
      var xml = this._children[0];
      xml.appendChild(child);
      return xml;
    }

    // 9.2.1.6 [[append]] (V)
    append(V: any) {
      // Step 1.
      var children = this._children;
      var i = children.length;
      // Step 2.
      var n = 1;
      // Step 3.
      if (V && V.axClass === this.sec.AXXMLList) {
        this._targetObject = V._targetObject;
        this._targetProperty = V._targetProperty;
        var valueChildren: ASXML[] = V._children;
        n = valueChildren.length;
        if (n === 0) {
          return;
        }
        for (var j = 0; j < valueChildren.length; j++) {
          children[i + j] = valueChildren[j];
        }
        return;
      }
      release || assert(V.axClass === this.sec.AXXML);
      // Step 4.
      children[i] = V;
      // Step 5 (implicit).
    }

    childIndex(): number /*int*/ {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'childIndex');
      }
      return this._children[0].childIndex();
    }
    inScopeNamespaces(): any [] {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'inScopeNamespaces');
      }
      return this._children[0].inScopeNamespaces();
    }
    insertChildAfter(child1: any, child2: any): any {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'insertChildAfter');
      }
      return this._children[0].insertChildAfter(child1, child2);
    }
    insertChildBefore(child1: any, child2: any): any {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'insertChildBefore');
      }
      return this._children[0].insertChildBefore(child1, child2);
    }
    nodeKind(): string {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'nodeKind');
      }
      return this._children[0].nodeKind();
    }
    namespace(prefix: string): any {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'namespace');
      }
      var firstChild = this._children[0];
      return arguments.length ? firstChild.namespace(prefix) : firstChild.namespace();
    }
    localName(): Object {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'localName');
      }
      return this._children[0].localName();
    }
    namespaceDeclarations(): any [] {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists,
                           'namespaceDeclarations');
      }
      return this._children[0].namespaceDeclarations();
    }
    prependChild(value: any): ASXML {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'prependChild');
      }
      return this._children[0].prependChild(value);
    }
    removeNamespace(ns: any): ASXML {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'removeNamespace');
      }
      return this._children[0].removeNamespace(ns);
    }
    replace(propertyName: any, value: any): ASXML {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'replace');
      }
      return this._children[0].replace(propertyName, value);
    }
    setChildren(value: any): ASXML {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'setChildren');
      }
      return this._children[0].setChildren(value);
    }
    setLocalName(name: any): void {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'setLocalName');
      }
      return this._children[0].setLocalName(name);
    }
    setName(name: any): void {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'setName');
      }
      return this._children[0].setName(name);
    }
    setNamespace(ns: any): void {
      if (this._children.length !== 1) {
        this.sec.throwError('TypeError', Errors.XMLOnlyWorksWithOneItemLists, 'setNamespace');
      }
      return this._children[0].setNamespace(ns);
    }

    axGetEnumerableKeys(): any [] {
      if (this === this.axClass.dPrototype) {
        return super.axGetEnumerableKeys();
      }
      return Object.keys(this._children);
    }

    // 9.2.1.1 [[Get]] (P)
    getProperty(mn: Multiname): any {
      var nm = mn.name;
      if (isIndex(nm)) {
        return this._children[nm|0];
      }
      var isAnyName = nm === null || nm === '*';
      var isAnyNamespace = mn.isAnyNamespace();
      var isAttribute = mn.isAttribute();
      var xl = this.sec.AXXMLList.CreateList(this._targetObject, mn);
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        var v = children[i];
        if (v._kind === ASXMLKind.Element) {
          // i. Let gq be the result of calling the [[Get]] method of x[i] with argument P
          // We do this inline instead to reduce the amount of temporarily created XMLLists.
          if (isAttribute) {
            var attributes = v._attributes;
            for (var j = 0; attributes && j < attributes.length; j++) {
              var v = attributes[j];
              if ((isAnyName || v._name.name === nm) &&
                  (isAnyNamespace || v._name.matches(mn))) {
                xl._children.push(v);
              }
            }
          } else {
            var descendants = v._children;
            for (var j = 0; descendants && j < descendants.length; j++) {
              var v = descendants[j];
              if ((isAnyName || v._kind === ASXMLKind.Element && v._name.name === nm) &&
                  (isAnyNamespace || v._name.matches(mn)))
              {
                xl._children.push(v);
              }
            }
          }
        }
      }
      return xl;
    }

    axGetProperty(mn: Multiname): any {
      if (this === this.axClass.dPrototype) {
        var value = this[this.axResolveMultiname(mn)];
        release || checkValue(value);
        return value;
      }
      return this.getProperty(coerceE4XMultiname(mn, this.sec));
    }

    axGetPublicProperty(nm): any {
      if (this === this.axClass.dPrototype) {
        var value = this[Multiname.getPublicMangledName(nm)];
        release || checkValue(value);
        return value;
      }
      if (isIndex(nm)) {
        return this._children[nm | 0];
      }
      tmpMultiname.name = nm;
      tmpMultiname.namespaces = [Namespace.PUBLIC];
      tmpMultiname.kind = CONSTANT.QName;
      return this.getProperty(tmpMultiname);
    }

    hasProperty(mn: Multiname) {
      if (isIndex(mn.name)) {
        return Number(mn.name) < this._children.length;
      }
      // TODO scan children on property presence?
      return true;
    }

    axHasProperty(mn: Multiname): boolean {
      return this.hasProperty(mn);
    }

    axHasPropertyInternal(mn: Multiname): boolean {
      return this.hasProperty(mn);
    }

    // 9.1.1.10 [[ResolveValue]] ( )
    resolveValue() {
      return this;
    }

    // 9.2.1.2 [[Put]] (P, V)
    setProperty(mn: Multiname, value: any) {
      // Steps 1-2.
      if (isIndex(mn.name)) {
        var i = mn.name|0;
        // Step 2.b.
        var r: any = null;
        // Step 2.a.
        if (this._targetObject) {
          r = this._targetObject.resolveValue();
          if (r === null) {
            return;
          }
        }
        // Step 2.c.
        var length = this._children.length;
        if (i >= length) {
          // Step 2.c.i.
          if (r && r.axClass === this.sec.AXXMLList) {
            // Step 2.c.i.1.
            if (r._children.length !== 1) {
              return;
            }
            // Step 2.c.i.2.
            r = r._children[0];
          }
          release || assert(r === null || r.axClass === this.sec.AXXML);
          // Step 2.c.ii.
          if (r && r._kind !== ASXMLKind.Element) {
            return;
          }
          // Step 2.c.iii.
          var y = this.sec.AXXML.Create();
          y._parent = r;
          var yName = this._targetProperty;
          var yKind = ASXMLKind.Text;
          // Step 2.c.iv.
          if (this._targetProperty && this._targetProperty.isAttribute()) {
            if (r.hasProperty(this._targetProperty)) {
              return;
            }
            yKind = ASXMLKind.Attribute;
          }
          // Step 2.c.v.
          else if (!this._targetProperty || this._targetProperty.name === null) {
            yName = null;
            yKind = ASXMLKind.Text;
          }
          // Step 2.c.vi.
          else {
            yKind = ASXMLKind.Element;
          }
          y.init(yKind, yName);
          // Step 2.c.vii.
          i = length;
          // Step 2.c.viii.
          if (y._kind !== ASXMLKind.Attribute) {
            // Step 2.c.viii.1.
            if (r !== null) {
              var j: number;
              // Step 2.c.viii.1.a.
              if (i > 0) {
                var lastChild = this._children[i - 1];
                var rLength = r._children.length - 1;
                for (j = 0; j < rLength; j++) {
                  if (r._children[j] === lastChild) {
                    release || assert(r._children[0]);
                    break;
                  }
                }
              }
              // Step 2.c.viii.1.b.
              else {
                j = r._children.length - 1;
              }
              // Step 2.c.viii.1.c.
              r._children[j + 1] = y;
              assert(r._children[0]);
              y._parent = r;
            }
            // Step 2.c.viii.2.
            if (value && value.axClass === this.sec.AXXML) {
              y._name = value._name;
            }
            // Step 2.c.viii.3.
            else if (value && value.axClass === this.sec.AXXMLList) {
              y._name = value._targetProperty;
            }
            // Step 2.c.ix.
            this.append(y);
          }
        }
        // Step 2.d.
        if (!isXMLType(value, this.sec) ||
            value._kind === ASXMLKind.Text || value._kind === ASXMLKind.Attribute) {
          value = value + '';
        }
        var currentChild = this._children[i];
        var childKind = currentChild._kind;
        var parent = currentChild._parent;
        // Step 2.e.
        if (childKind === ASXMLKind.Attribute) {
          var indexInParent = parent._children.indexOf(currentChild);
          parent.setProperty(currentChild._name, false);
          this._children[i] = parent._children[indexInParent];
          assert(this._children[0]);
          return;
        }
        // Step 2.f.
        if (value && value.axClass === this.sec.AXXMLList) {
          // Step 2.f.i.
          var c = value._shallowCopy();
          var cLength = c._children.length;
          // Step 2.f.ii. (implemented above.)
          // Step 2.f.iii.
          if (parent !== null) {
            // Step 2.f.iii.1.
            var q = parent._children.indexOf(currentChild);
            // Step 2.f.iii.2.
            parent._replaceByIndex(q, c);
            // Step 2.f.iii.3.
            for (var j = 0; j < cLength; j++) {
              c._children[j] = parent._children[q + j];
            }
          }
          // Step 2.f.iv.
          if (cLength === 0) {
            for (var j = i + 1; j < length; j++) {
              this._children[j - 1] = this._children[j];
              assert(this._children[0]);
            }
            // Step 2.f.vii. (only required if we're shrinking the XMLList).
            this._children.length--;
          }
          // Step 2.f.v.
        else {
            for (var j = length - 1; j > i; j--) {
              this._children[j + cLength - 1] = this._children[j];
              assert(this._children[0]);
            }
          }
          // Step 2.f.vi.
          for (var j = 0; j < cLength; j++) {
            this._children[i + j] = c._children[j];
            assert(this._children[0]);
          }
          return;
        }
        // Step 2.g.
        if (childKind >= ASXMLKind.Text || value && value.axClass === this.sec.AXXML) {
          // Step 2.g.i. (implemented above.)
          // Step 2.g.ii.
          if (parent !== null) {
            // Step 2.g.ii.1.
            var q = parent._children.indexOf(currentChild);
            // Step 2.g.ii.2.
            parent._replaceByIndex(q, value);
            // Step 2.g.ii.3.
            value = parent._children[q];
          }
          // Step 2.g.iii.
          if (typeof value === 'string') {
            var t = this.sec.AXXML.Create(value);
            this._children[i] = t;
            assert(this._children[0]);
          }
          // Step 2.g.iv.
          else {
            release || assert(this.sec.AXXML.axIsType(value));
            this._children[i] = value;
            assert(this._children[0]);
          }
          return;
        }
        // Step 2.h.
        currentChild.setProperty(anyMultiname, value);
        return;
      }
      // Step 3.
      if (this._children.length === 0) {
        // Step 3.a.i.
        r = this.resolveValue();
        // Step 3.a.ii.
        if (r === null || r._children.length !== 1) {
          return;
        }
        // Step 3.a.iii.
        this.append(r._children[0]);
      }
      // Step 3.b.
      if (this._children.length === 1) {
        this._children[0].setProperty(mn, value);
        // Step 4.
        return;
      }
      // Not in the spec, but in Flash.
      this.sec.throwError('TypeError', Errors.XMLAssigmentOneItemLists);
    }

    axSetProperty(mn: Multiname, value: any, bc: Bytecode) {
      if (this === this.axClass.dPrototype) {
        release || checkValue(value);
        this[this.axResolveMultiname(mn)] = value;
        return;
      }
      this.setProperty(coerceE4XMultiname(mn, this.sec), value);
    }

    // 9.2.1.3 [[Delete]] (P)
    axDeleteProperty(mn: Multiname) {
      var name = mn.name;
      // Steps 1-2.
      if (isIndex(name)) {
        var i = name|0;
        // Step 2.a.
        if (i >= this._children.length) {
          return true;
        }
        // Step 2.b.
        this.removeByIndex(i);
        return true;
      }
      // Step 3.
      for (var i = 0; i < this._children.length; i++) {
        var child = this._children[i];
        if (child._kind === ASXMLKind.Element) {
          child.deleteProperty(mn);
        }
      }
      // Step 4.
      return true;
    }

    private removeByIndex(index: number) {
      var child = this._children[index];
      var parent = child._parent;
      if (parent) {
        child._parent = null;
        parent._children.splice(parent._children.indexOf(child), 1);
      }
      this._children.splice(index, 1);
    }

    axCallProperty(mn: Multiname, args: any []): any {
      var method = this[this.axResolveMultiname(mn)];
      // Check if the method exists before calling it.
      if (method) {
        validateCall(this.sec, method, args.length);
        return method.axApply(this, args);
      }

      // Otherwise, 11.2.2.1 CallMethod ( r , args )
      // If f == undefined and Type(base) is XMLList and base.[[Length]] == 1
      //   ii. Return the result of calling CallMethod(r0, args) recursively
      if (this._children.length === 1) {
        return this._children[0].axCallProperty(mn, args);
      }
      this.sec.throwError('TypeError', Errors.CallOfNonFunctionError, 'value');
    }
  }
}
