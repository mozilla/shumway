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

module Shumway.AVM2.AS {
  import assertNotImplemented = Shumway.Debug.assertNotImplemented;
  import assert = Shumway.Debug.assert;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  var _asGetProperty = Object.prototype.asGetProperty;
  var _asSetProperty = Object.prototype.asSetProperty;
  var _asCallProperty = Object.prototype.asCallProperty;
  var _asHasProperty = Object.prototype.asHasProperty;
  var _asHasOwnProperty = Object.prototype.asHasOwnProperty;
  var _asHasTraitProperty = Object.prototype.asHasTraitProperty;
  var _asDeleteProperty = Object.prototype.asDeleteProperty;
  var _asGetEnumerableKeys = Object.prototype.asGetEnumerableKeys;

  function isXMLType(val: any): boolean {
    return (val instanceof ASXML || val instanceof ASXMLList);
  }

  // 10.1 ToString
  function toString(node) {
    if (typeof node === "object" && node !== null) {
      if (node instanceof ASXMLList) {
        return node._children.map(toString).join('');
      }
      switch (node._kind) {
        case ASXMLKind.Text:
        case ASXMLKind.Attribute:
          return node._value;
        default:
          if (node.hasSimpleContent()) {
            return node._children.map(toString).join('');
          }
          return toXMLString(node);
      }
    } else {
      return String(node);
    }
  }

  // 10.2.1.1 EscapeElementValue ( s )
  function escapeElementValue(s: string): string {
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
  function escapeAttributeValue(s: string): string {
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

  function isWhitespace(s: string, index: number) {
    var ch = s[index];
    return ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t';
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

  function generateUniquePrefix(namespaces: ASNamespace[]) {
    var i = 1, newPrefix;
    while (true) {
      newPrefix = '_ns' + i;
      if (!namespaces.some(function (ns) { return ns.prefix == newPrefix; })) {
        break;
      }
      i++;
    }
    return newPrefix;
  }

  // 10.2 ToXMLString
  function toXMLString(node: any, ancestorNamespaces?: ASNamespace[], indentLevel?: number) {
    if (node === null || node === undefined) {
      throw new TypeError();
    }
    if (!(node instanceof ASXML)) {
      if (node instanceof ASXMLList) {
        // 10.2.2 ToXMLString Applied to the XMLList Type
        return node._children.map(function (childNode) {
          return toXMLString(childNode, ancestorNamespaces);
        }).join(ASXML.prettyPrinting ? '\n' : '');
      }
      return escapeElementValue(String(node));
    }

    var prettyPrinting = ASXML.prettyPrinting;

    // 10.2.1 ToXMLString Applied to the XML Type
    indentLevel |= 0;
    var s = prettyPrinting ? getIndentString(indentLevel) : '';

    var kind: ASXMLKind = node._kind;
    switch (kind) {
      // 4. If x.[[Class]] == "text",
      case ASXMLKind.Text:
        return prettyPrinting ?
          s + escapeElementValue(trimWhitespaces(node._value)) :
          escapeElementValue(node._value);
      // 5. If x.[[Class]] == "attribute", return the result of concatenating s and EscapeAttributeValue(x.[[Value]])
      case ASXMLKind.Attribute:
        return s + escapeAttributeValue(node._value);
      // 6. If x.[[Class]] == "comment", return the result of concatenating s, the string "<!--", x.[[Value]] and the string "-->"
      case ASXMLKind.Comment:
        return s + '<!--' + node._value + '-->';
      // 7 If x.[[Class]] == "processing-instruction", return the result of concatenating s, the string "<?", x.[[Name]].localName, the space <SP> character, x.[[Value]] and the string "?>"
      case ASXMLKind.ProcessingInstruction:
        return s + '<?' + node._name.localName + ' ' + node._value + '?>';
      default:
        release || assert(kind === ASXMLKind.Element);
        break;
    }

    ancestorNamespaces = ancestorNamespaces || [];
    var namespaceDeclarations = [];

    // 10. For each ns in x.[[InScopeNamespaces]]
    for (var i = 0; i < node._inScopeNamespaces.length; i++) {
      var nsPrefix = node._inScopeNamespaces[i].prefix;
      var nsUri = node._inScopeNamespaces[i].uri;
      if (ancestorNamespaces.every(function (ans) { return ans.uri != nsUri || ans.prefix != nsPrefix; })) {
        var ns1 = new ASNamespace(nsPrefix, nsUri);
        namespaceDeclarations.push(ns1);
      }
    }
    // 11. For each name in the set of names consisting of x.[[Name]] and the name of each attribute in x.[[Attributes]]
    var currentNamespaces = ancestorNamespaces.concat(namespaceDeclarations);
    var namespace = node._name.getNamespace(currentNamespaces);
    if (namespace.prefix === undefined) {
      // Let namespace.prefix be an arbitrary implementation defined namespace prefix, such that there is no ns2 ∈ (AncestorNamespaces ∪ namespaceDeclarations) with namespace.prefix == ns2.prefix
      var newPrefix = generateUniquePrefix(currentNamespaces);
      var ns2 = new ASNamespace(newPrefix, namespace.uri);
      // Let namespaceDeclarations = namespaceDeclarations ∪ { namespace }
      namespaceDeclarations.push(ns2);
      currentNamespaces.push(ns2);
    }

    // 12. Let s be the result of concatenating s and the string "<"
    // 13. If namespace.prefix is not the empty string,
    //   a. Let s be the result of concatenating s, namespace.prefix and the string ":"
    // 14. Let s be the result of concatenating s and x.[[Name]].localName
    var elementName = (namespace.prefix ? namespace.prefix + ':' : '') + node._name.localName;
    s += '<' + elementName;

    node._attributes.forEach(function (attr) {
      var name: ASQName = attr._name;
      var namespace = name.getNamespace(currentNamespaces);
      if (namespace.prefix === undefined) {
        // Let namespace.prefix be an arbitrary implementation defined namespace prefix, such that there is no ns2 ∈ (AncestorNamespaces ∪ namespaceDeclarations) with namespace.prefix == ns2.prefix
        var newPrefix = generateUniquePrefix(currentNamespaces);
        var ns2 = new ASNamespace(newPrefix, namespace.uri);
        // Let namespaceDeclarations = namespaceDeclarations ∪ { namespace }
        namespaceDeclarations.push(ns2);
        currentNamespaces.push(ns2);
      }
    });

    for (var i = 0; i < namespaceDeclarations.length; i++) {
      var namespace = namespaceDeclarations[i];
      var attributeName = namespace.prefix ? 'xmlns:' + namespace.prefix : 'xmlns';
      s += ' ' +  attributeName + '=\"' + escapeAttributeValue(namespace.uri) + '\"';
    }
    node._attributes.forEach(function (attr) {
      var name: ASQName = attr._name;
      var namespace = name.getNamespace(ancestorNamespaces);
      var attributeName = namespace.prefix ? namespace.prefix + ':' + name.localName : name.localName;
      s += ' ' +  attributeName + '=\"' + escapeAttributeValue(attr._value) + '\"';
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
    // 19. Let indentChildren = ((x.[[Length]] > 1) or (x.[[Length]] == 1 and x[0].[[Class]] is not equal to "text"))
    var indentChildren = node._children.length > 1 ||
        (node._children.length === 1 && node._children[0]._kind !== ASXMLKind.Text);
    var nextIndentLevel = (prettyPrinting && indentChildren) ?
      indentLevel + ASXML.prettyIndent : 0;

    node._children.forEach(function (childNode, i) {
      if (prettyPrinting && indentChildren) {
        s += '\n';
      }
      var child = toXMLString(childNode, currentNamespaces, nextIndentLevel);
      s += child;
    });
    if (prettyPrinting && indentChildren) {
      s += '\n' + getIndentString(indentLevel);
    }

    s += '</' + elementName + '>';
    return s;
  }


  // 10.3 ToXML
  function toXML(v) {
    if (v === null) {
      throw new TypeError(formatErrorMessage(Errors.ConvertNullToObjectError));
    } else if (v === undefined) {
      throw new TypeError(formatErrorMessage(Errors.ConvertUndefinedToObjectError));
    } else if (v instanceof ASXML) {
      return v;
    } else if (v instanceof ASXMLList) {
      if (v.length() === 1) {
        return v._children[0];
      }
      throw new TypeError(formatErrorMessage(Errors.XMLMarkupMustBeWellFormed));
    } else {
      var x = xmlParser.parseFromString(String(v));
      if (x.length() === 0) {
        var x = new XML(ASXMLKind.Text);
        return x;
      } else if (x.length() === 1) {
        x._children[0]._parent = null;
        return x._children[0];
      }
      throw "SyntaxError in ToXML";
    }
  }

  // 10.4 ToXMLList
  function toXMLList(value) {
    if (value === null) {
      throw new TypeError(formatErrorMessage(Errors.ConvertNullToObjectError));
    } else if (value === undefined) {
      throw new TypeError(formatErrorMessage(Errors.ConvertUndefinedToObjectError));
    } else if (value instanceof XML) {
      var xl = new XMLList(value.parent, value.name);
      xl.appendChild(value);
      return xl;
    } else if (value instanceof XMLList) {
      return value;
    } else {
      var parentString = '<parent xmlns=\'' + ASXML.defaultNamespace + '\'>' +
        value + '</parent>';
      var x = toXML(parentString);
      var xl = new XMLList();
      for (var i = 0; i < x.length(); i++) {
        var v = (<any> x)._children[i];
        v._parent = null;
        xl.appendChild(v);
      }
      return xl;
    }
  }

  // 10.5 ToAttributeName
  function toAttributeName(v): ASQName {
    if (v === undefined || v === null || typeof v === "boolean" || typeof v === "number") {
      throw "TypeError: invalid operand to ToAttributeName()";
    } else if (isXMLType(v)) {
      v = toString(v);
    } else if (typeof v === 'object' && v !== null) {
      if (v instanceof ASQName) {
        return new ASQName(v.uri, v.localName, true);
      }
      if (Multiname.isQName(v)) {
        return ASQName.fromMultiname(v);
      }
      v = toString(v);
    }
    if (typeof v === "string") {
      var ns = Namespace.createNamespace("", "");
      var qn = new ASQName(ns, v, true);
    } else {
      // FIXME implement
    }
    return qn;
  }

  // 10.6 ToXMLName
  function toXMLName(mn): ASQName {
    if (mn === undefined) {
      return new ASQName('*');
    }
    // convert argument to a value of type AttributeName or a QName object
    // according to the following:
    if (typeof mn === 'object' && mn !== null) {
      if (mn instanceof ASQName) {
        // Object - If the input argument is a QName object,
        // return the input argument.
        return mn;
      }
      if (Multiname.isQName(mn)) {
        // ... same as above plus
        // AttributeName - Return the input argument (no conversion).
        // AnyName - Return the result of calling ToXMLName("*")
        return ASQName.fromMultiname(mn);
      }
      var name: string;
      if (mn instanceof ASXML || mn instanceof ASXMLList) {
        // XML or XMLList - Convert the input argument to a string using
        // ToString
        name = toString(mn);
      } else if (mn instanceof Multiname) {
        name = mn.name; // ?? Can be two or none namespaces here
      } else {
        // Object - Otherwise, convert the input argument to a
        // string using ToString
        name = mn.toString();
      }
    } else if (typeof mn === 'string') {
      // String - Create a QName object or AttributeName from the String
      // as specified below in section 10.6.1. See below
      name = mn;
    } else {
      throw new TypeError();
    }
    // ... then convert the result to a QName object or AttributeName
    // as specified in section 10.6.1.
    if (name[0] === '@') {
      // If the first character of s is "@", ToXMLName creates an
      // AttributeName using the ToAttributeName operator.
      return toAttributeName(name.substring(1));
    }
    return new ASQName(name);
  }

  function isQNameAttribute(name: any): boolean {
    if (typeof name === 'object' && (name instanceof ASQName)) {
      var flags = name._flags;
      return !!(flags & ASQNameFlags.ATTR_NAME);
    }
    return false;
  }

  function prefixWithNamespace(namespaces, name, isAttribute) {
    if (!namespaces ||
        namespaces.length !== 1 ||
        !(namespaces[0] instanceof ASNamespace) ||
        (typeof name !== 'string' && name !== undefined)) {
      return name;
    }
    return new ASQName(namespaces[0], name || '*', isAttribute);
  }

  // 12.1 GetDefaultNamespace
  function getDefaultNamespace(): ASNamespace {
    // The scope's default xml namespace is stored in XML.defaultNamespace
    // (see runtime.ts createInterpretedFunction)
    return new ASNamespace("", ASXML.defaultNamespace);
  }

  // 13.1.2.1 isXMLName ( value )
  function isXMLName(v) {
    try {
      var qn = new ASQName(v);
    } catch (e) {
      return false;
    }
    // FIXME scan v to see if it is a valid lexeme and return false if not
    return true;
  }

  function XMLParser() {
    function parseXml(s, sink) {
      var i = 0, scopes: any [] = [{
        namespaces: [],
        lookup: {
          "xmlns": 'http://www.w3.org/2000/xmlns/',
          "xml": 'http://www.w3.org/XML/1998/namespace'
        },
        inScopes: !ASXML.defaultNamespace ? [] :
          [{uri: ASXML.defaultNamespace, prefix: ''}],
        space: 'default',
        xmlns: (ASXML.defaultNamespace || '')
      }];
      function resolveEntities(s) {
        return s.replace(/&([^;]+);/g, function(all, entity) {
          if (entity.substring(0, 2) === '#x') {
            return String.fromCharCode(parseInt(entity.substring(2), 16));
          } else if(entity.substring(0,1) === '#') {
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
      function isWhitespacePreserved(): boolean {
        for (var j = scopes.length - 1; j >= 0; --j) {
          if (scopes[j].space === "preserve") {
            return true;
          }
        }
        return false;
      }
      function lookupDefaultNs(): string {
        for (var j = scopes.length - 1; j >= 0; --j) {
          if ('xmlns' in scopes[j]) {
            return scopes[j].xmlns;
          }
        }
        return '';
      }
      function lookupNs(prefix: string): string {
        for (var j = scopes.length - 1; j >= 0; --j) {
          if (prefix in scopes[j].lookup) {
            return scopes[j].lookup[prefix];
          }
        }
        return undefined;
      }
      function getName(name: string, resolveDefaultNs: boolean): any {
        var j = name.indexOf(':');
        if (j >= 0) {
          var prefix = name.substring(0,j);
          var namespace = lookupNs(prefix);
          if (namespace === undefined) {
            throw "Unknown namespace: " + prefix;
          }
          var localName = name.substring(j + 1);
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
            namespace: lookupDefaultNs()
          };
        } else {
          return {
            name:name,
            localName: name,
            prefix: '',
            namespace: ''
          };
        }
      }

      function parseContent(s, start) {
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
          if (s[pos] !== "=") throw "'=' expected";
          ++pos;
          skipWs();
          var attrEndChar = s[pos];
          if (attrEndChar !== "\"" && attrEndChar !== "\'" ) throw "Quote expected";
          var attrEndIndex = s.indexOf(attrEndChar, ++pos);
          if (attrEndIndex < 0) throw "Unexpected EOF[6]";
          attrValue = s.substring(pos, attrEndIndex);
          attributes.push({name: attrName, value: resolveEntities(attrValue)});
          pos = attrEndIndex + 1;
          skipWs();
        }
        return {name: name, attributes: attributes, parsed: pos - start};
      }

      function parseProcessingInstruction(s, start) {
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

      while (i < s.length) {
        var ch = s[i];
        var j = i;
        if (ch === "<") {
          ++j;
          var ch2 = s[j], q, name;
          switch (ch2) {
            case "/":
              ++j;
              q = s.indexOf(">", j); if(q < 0) { throw "Unexpected EOF[1]"; }
              name = getName(s.substring(j,q), true);
              sink.endElement(name);
              scopes.pop();
              j = q + 1;
              break;
            case "?":
              ++j;
              var pi = parseProcessingInstruction(s, j);
              if (s.substring(j + pi.parsed, j + pi.parsed + 2) != "?>") {
                throw "Unexpected EOF[2]";
              }
              sink.pi(pi.name, pi.value);
              j += pi.parsed + 2;
              break;
            case "!":
              if (s.substring(j + 1, j + 3) === "--") {
                q = s.indexOf("-->", j + 3); if(q < 0) { throw "Unexpected EOF[3]"; }
                sink.comment(s.substring(j + 3, q));
                j = q + 3;
              } else if (s.substring(j + 1, j + 8) === "[CDATA[") {
                q = s.indexOf("]]>", j + 8); if(q < 0) { throw "Unexpected EOF[4]"; }
                sink.cdata(s.substring(j + 8, q));
                j = q + 3;
              } else if (s.substring(j + 1, j + 8) === "DOCTYPE") {
                var q2 = s.indexOf("[", j + 8), complexDoctype = false;
                q = s.indexOf(">", j + 8); if(q < 0) { throw "Unexpected EOF[5]"; }
                if (q2 > 0 && q > q2) {
                  q = s.indexOf("]>", j + 8); if(q < 0) { throw "Unexpected EOF[7]"; }
                  complexDoctype = true;
                }
                var doctypeContent = s.substring(j + 8, q + (complexDoctype ? 1 : 0));
                sink.doctype(doctypeContent);
                // XXX pull entities ?
                j = q + (complexDoctype ? 2 : 1);
              } else {
                throw "Unknown !tag";
              }
              break;
            default:
              var content = parseContent(s, j);
              var isClosed = false;
              if (s.substring(j + content.parsed, j + content.parsed + 2) === "/>") {
                isClosed = true;
              } else if (s.substring(j + content.parsed, j + content.parsed + 1) !== ">") {
                throw "Unexpected EOF[2]";
              }
              var scope: any = {namespaces:[], lookup: Object.create(null)};
              var contentAttributes = content.attributes;
              for (q = 0; q < contentAttributes.length; ++q) {
                var attribute = contentAttributes[q];
                var attributeName = attribute.name;
                if (attributeName.substring(0, 6) === "xmlns:") {
                  var prefix = attributeName.substring(6);
                  var uri = attribute.value;
                  if (lookupNs(prefix) !== uri) {
                    scope.lookup[prefix] = trimWhitespaces(uri);
                    scope.namespaces.push({uri: uri, prefix: prefix});
                  }
                  delete contentAttributes[q];
                } else if (attributeName === "xmlns") {
                  var uri = attribute.value;
                  if (lookupDefaultNs() !== uri) {
                    scope["xmlns"] = trimWhitespaces(uri);
                    scope.namespaces.push({uri: uri, prefix: ''});
                  }
                  delete contentAttributes[q];
                } else if (attributeName.substring(0, 4) === "xml:") {
                  var xmlAttrName = attributeName.substring(4);
                  if (xmlAttrName !== 'space' && xmlAttrName !== 'lang' && xmlAttrName !== 'base') {
                    throw "Invalid xml attribute: " + attributeName;
                  }
                  scope[xmlAttrName] = trimWhitespaces(attribute.value);
                } else if (attributeName.substring(0, 3) === "xml") {
                  throw "Invalid xml attribute";
                } else {
                  // skip ordinary attributes until all xmlns have been handled
                }
              }
              // build list of all namespaces including ancestors'
              var inScopeNamespaces: any[] = [];
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
                  attributes.push({name: getName(attribute.name, false), value: attribute.value});
                }
              }
              sink.beginElement(getName(content.name, true), attributes, inScopeNamespaces, isClosed);
              j += content.parsed + (isClosed ? 2 : 1);
              if (isClosed) scopes.pop();
              break;
          }
        } else {
          var isWs = true;
          do {
            isWs = isWs && isWhitespace(s, j);
            if (++j >= s.length) break;
          } while(s[j] !== "<");
          var text = s.substring(i, j);
          sink.text(resolveEntities(text), isWs || isWhitespacePreserved());
        }
        i = j;
      }
    }
    // end of parser

    this.parseFromString = function(s, mimeType) {
      var currentElement = new XML(ASXMLKind.Element, '', '', '');  // placeholder
      var elementsStack = [];
      parseXml(s, {
        beginElement: function(name, attrs, namespaces, isEmpty) {
          var parent = currentElement;
          elementsStack.push(parent);
          currentElement = createNode(ASXMLKind.Element, name.namespace, name.localName, name.prefix);
          for (var i = 0; i < attrs.length; ++i) {
            var rawAttr = attrs[i];
            var attr = createNode(ASXMLKind.Attribute, rawAttr.name.namespace, rawAttr.name.localName, rawAttr.name.prefix);
            attr._value = rawAttr.value;
            currentElement._attributes.push(attr);
          }
          for (var i = 0; i < namespaces.length; ++i) {
            var rawNs = namespaces[i];
            var ns = Namespace.createNamespace(rawNs.uri, rawNs.prefix);
            currentElement._inScopeNamespaces.push(ns);
          }
          parent.insert(parent.length(), currentElement);
          if (isEmpty) {
            currentElement = elementsStack.pop();
          }
        },
        endElement: function(name) {
          currentElement = elementsStack.pop();
        },
        text: function(text, isWhitespace) {
          if (isWhitespace && ASXML.ignoreWhitespace) {
            return;
          }
          var node = createNode(ASXMLKind.Text, "", "");
          node._value = text;
          currentElement.insert(currentElement.length(), node);
        },
        cdata: function(text) {
          var node = createNode(ASXMLKind.Text, "", "");
          node._value = text;
          currentElement.insert(currentElement.length(), node);
        },
        comment: function(text) {
          if (ASXML.ignoreComments) {
            return;
          }
          var node = createNode(ASXMLKind.Comment, "", "");
          node._value = text;
          currentElement.insert(currentElement.length(), node);
        },
        pi: function(name, value) {
          if (ASXML.ignoreProcessingInstructions) {
            return;
          }
          var node = createNode(ASXMLKind.ProcessingInstruction, "", name);
          node._value = value;
          currentElement.insert(currentElement.length(), node);
        },
        doctype: function(text) { }
      });
      return currentElement;
    };

    function createNode(kind: ASXMLKind, uri, name, prefix?) {
      return new XML(kind, uri, name, prefix);
    }
  }

  var xmlParser = new XMLParser();

  export class ASNamespace extends ASObject {
    public static staticNatives: any [] = null;
    public static instanceNatives: any [] = null;
    public static instanceConstructor: any = ASNamespace;

    private _ns: Namespace;

    private static _namespaceConstructor: (ns: Namespace) => void = function (ns: Namespace): void {
      this._ns = ns;
    };

    private static _ = (() => {
      ASNamespace._namespaceConstructor.prototype = ASNamespace.prototype;
    })();


    static fromNamespace(ns: Namespace): ASNamespace {
      return new ASNamespace._namespaceConstructor(ns);
    }


    /**
     * 13.2.1 The Namespace Constructor Called as a Function
     *
     * Namespace ()
     * Namespace (uriValue)
     * Namespace (prefixValue, uriValue)
     */
    public static callableConstructor: any = function (a?: any, b?: any): ASNamespace {
      // 1. If (prefixValue is not specified and Type(uriValue) is Object and uriValue.[[Class]] == "Namespace")
      if (arguments.length === 1 && isObject(a) && a instanceof ASNamespace) {
        // a. Return uriValue
        return a;
      }
      // 2. Create and return a new Namespace object exactly as if the Namespace constructor had been called with the same arguments (section 13.2.2).
      switch (arguments.length) {
        case 0:
          return new ASNamespace();
        case 1:
          return new ASNamespace(a);
        default:
          return new ASNamespace(a, b);
      }
    };

    /**
     * 13.2.2 The Namespace Constructor
     *
     * Namespace ()
     * Namespace (uriValue)
     * Namespace (prefixValue, uriValue)
     */
    constructor(a?: any, b?: any) {
      false && super();
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
        var uriValue = a;
        // a. If Type(uriValue) is Object and uriValue.[[Class]] == "Namespace"
        if (isObject(uriValue) && uriValue instanceof ASNamespace) {
          var uriValueAsNamespace: ASNamespace = uriValue;
          // i. Let n.prefix = uriValue.prefix
          prefix = uriValueAsNamespace.prefix;
          // ii. Let n.uri = uriValue.uri
          uri = uriValueAsNamespace.uri;
        }
        // b. Else if Type(uriValue) is Object and uriValue.[[Class]] == "QName" and uriValue.uri is not null
        else if (isObject(uriValue) && uriValue instanceof ASQName && (<ASQName>uriValue).uri !== null) {
          // i. Let n.uri = uriValue.uri
          uri = uriValue.uri;
          // NOTE implementations that preserve prefixes in qualified names may also set n.prefix = uriValue.[[Prefix]]
        }
        // c. Else
        else {
          // i. Let n.uri = ToString(uriValue)
          uri = toString(uriValue);
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
        var prefixValue = a;
        var uriValue = b;
        // a. If Type(uriValue) is Object and uriValue.[[Class]] == "QName" and uriValue.uri is not null
        if (isObject(uriValue) && uriValue instanceof ASQName && (<ASQName>uriValue).uri !== null) {
          // i. Let n.uri = uriValue.uri
          uri = uriValue.uri;
        }
        // b. Else
        else {
          // i. Let n.uri = ToString(uriValue)
          uri = toString(uriValue);
        }
        // c. If n.uri is the empty string
        if (uri === "") {
          // i. If prefixValue is undefined or ToString(prefixValue) is the empty string
          if (prefixValue === undefined || toString(prefixValue) === "") {
            // 1. Let n.prefix be the empty string
            prefix = "";
          }
          else {
            // ii. Else throw a TypeError exception
            throw new TypeError();
          }
        }
        // d. Else if prefixValue is undefined, let n.prefix = undefined
        else if (prefixValue === undefined) {
          prefix = undefined;
        }
        // e. Else if isXMLName(prefixValue) == false
        else if (isXMLName(prefixValue) === false) {
          // i. Let n.prefix = undefined
          prefix = undefined;
        }
        // f. Else let n.prefix = ToString(prefixValue)
        else {
          prefix = toString(prefixValue);
        }
      }
      // 5. Return n
      this._ns = Namespace.createNamespace(uri, prefix);
    }

    get prefix(): any {
      return this._ns.prefix;
    }

    get uri(): string {
      return this._ns.uri;
    }

  }

  enum ASQNameFlags {
    ATTR_NAME = 1,
    ELEM_NAME = 2,
    ANY_NAME = 4,
    ANY_NAMESPACE = 8
  }

  export class ASQName extends ASNative {
    public static instanceConstructor: any = ASQName;

    /**
     * 13.3.1 The QName Constructor Called as a Function
     *
     * QName ( )
     * QName ( Name )
     * QName ( Namespace , Name )
     */
    public static callableConstructor: any = function (a?: any, b?: any): ASQName {
      // 1. If Namespace is not specified and Type(Name) is Object and Name.[[Class]] == “QName”
      if (arguments.length === 1 && isObject(a) && a instanceof ASQName) {
        // a. Return Name
        return  a;
      }
      // 2. Create and return a new QName object exactly as if the QName constructor had been called with the same arguments (section 13.3.2).
      switch (arguments.length) {
        case 0:
          return new ASQName();
        case 1:
          return new ASQName(a);
        default:
          return new ASQName(a, b);
      }
    };

    _mn: Multiname;
    _flags: number;

    static fromMultiname(mn: Multiname) {
      var result: ASQName = Object.create(ASQName.prototype);
      result._mn = mn;
      var flags = 0;
      if (mn.isAttribute()) {
        flags |= ASQNameFlags.ATTR_NAME;
      } else {
        flags |= ASQNameFlags.ELEM_NAME;
      }
      if (mn.isAnyName()) {
        flags |= ASQNameFlags.ANY_NAME;
      }
      if (mn.isAnyNamespace()) {
        flags |= ASQNameFlags.ANY_NAMESPACE;
      }
      result._flags = flags;
      return result;
    }

    /**
     * 13.3.2 The QName Constructor
     *
     * new QName ()
     * new QName (Name)
     * new QName (Namespace, Name)
     */
    constructor(a?: any, b?: any, c?: boolean) {
      false && super();

      var name;
      var namespace;

      if (arguments.length === 0) {
        name = "";
      } else if (arguments.length === 1) {
        name = a;
      } else { // if (arguments.length === 2) {
        namespace = a;
        name = b;
      }

      // 1. If (Type(Name) is Object and Name.[[Class]] == "QName")
      if (isObject(name) && name instanceof ASQName) {
        // a. If (Namespace is not specified), return a copy of Name
        if (arguments.length < 2) {
          return name;
        }
        // b. Else let Name = Name.localName
        else {
          name = <ASQName>name.localName;
        }
      }
      // 2. If (Name is undefined or not specified)
      if (name === undefined || arguments.length === 0) {
        // a. Let Name = ""
        name = "";
      }
      // 3. Else let Name = ToString(Name)
      else {
        name = toString(name);
      }
      // 4. If (Namespace is undefined or not specified)
      if (namespace === undefined || arguments.length < 2) {
        // a. If Name = "*"
        if (name === "*") {
          // i. Let Namespace = null
          namespace = null;
        }
        // b. Else
        else {
          // i. Let Namespace = GetDefaultNamespace()
          namespace = getDefaultNamespace();
        }
      }
      // 5. Let q be a new QName with q.localName = Name
      var localName = name;
      var uri;
      // 6. If Namespace == null
      if (namespace === null) {
        // a. Let q.uri = null
        // NOTE implementations that preserve prefixes in qualified names may also set q.[[Prefix]] to undefined
        uri = null;
      }
      // 7. Else
      else {
        // a. Let Namespace be a new Namespace created as if by calling the constructor new Namespace(Namespace)
        namespace = namespace instanceof ASNamespace ? namespace :
          new ASNamespace(namespace);
        // b. Let q.uri = Namespace.uri
        uri = namespace.uri;
          // NOTE implementations that preserve prefixes in qualified names may also set q.[[Prefix]] to Namespace.prefix
      }
      // 8. Return q
      var flags = c ? ASQNameFlags.ATTR_NAME : ASQNameFlags.ELEM_NAME;
      if (name === '*') {
        flags |= ASQNameFlags.ANY_NAME;
      }
      if (namespace === null) {
        flags |= ASQNameFlags.ANY_NAMESPACE;
      }
      this._mn = new Multiname([namespace ? namespace._ns : null], localName);
      this._flags = flags;
    }

    get localName(): string {
      return this._mn.name;
    }

    get uri(): string {
      if (this._mn.namespaces[0]) {
        return this._mn.namespaces[0].uri;
      }
      return null;
    }

    /**
     * 13.3.5.3 [[Prefix]]
     * The [[Prefix]] property is an optional internal property that is not directly visible to users. It may be used by implementations that preserve prefixes in qualified names.
     * The value of the [[Prefix]] property is a value of type string or undefined. If the [[Prefix]] property is undefined, the prefix associated with this QName is unknown.
     */
    get prefix(): string {
      return this._mn.namespaces[0].prefix;
    }

    /**
     * 13.3.5.4 [[GetNamespace]] ( [ InScopeNamespaces ] )
     *
     * The [[GetNamespace]] method is an internal method that returns a Namespace object with a URI matching the URI of this QName. InScopeNamespaces is an optional parameter.
     * If InScopeNamespaces is unspecified, it is set to the empty set. If one or more Namespaces exists in InScopeNamespaces with a URI matching the URI of this QName, one
     * of the matching Namespaces will be returned. If no such namespace exists in InScopeNamespaces, [[GetNamespace]] creates and returns a new Namespace with a URI matching
     * that of this QName. For implementations that preserve prefixes in QNames, [[GetNamespace]] may return a Namespace that also has a matching prefix. The input argument
     * InScopeNamespaces is a set of Namespace objects.
     */
    getNamespace(inScopeNamespaces?: ASNamespace []) {
      if (this.uri === null) {
        throw "TypeError in QName.prototype.getNamespace()";
      }
      if (!inScopeNamespaces) {
        inScopeNamespaces = [];
      }
      var ns: ASNamespace;
      for (var i = 0; i < inScopeNamespaces.length; i++) {
        if (this.uri === inScopeNamespaces[i].uri) {
          ns = inScopeNamespaces[i];
        }
      }
      if (!ns) {
        ns = new ASNamespace(this.prefix, this.uri);
      }
      return ns;
    }
  }

  enum ASXML_FLAGS {
    FLAG_IGNORE_COMMENTS                = 0x01,
    FLAG_IGNORE_PROCESSING_INSTRUCTIONS = 0x02,
    FLAG_IGNORE_WHITESPACE              = 0x04,
    FLAG_PRETTY_PRINTING                = 0x08,
    ALL = FLAG_IGNORE_COMMENTS | FLAG_IGNORE_PROCESSING_INSTRUCTIONS | FLAG_IGNORE_WHITESPACE | FLAG_PRETTY_PRINTING
  }

  enum ASXMLKind {
    Unknown,
    Element,
    Attribute,
    Text,
    Comment,
    ProcessingInstruction
  }

  var ASXMLKindNames = [null, 'element', 'attribute', 'text', 'comment',
    'processing-instruction'];

  export class ASXML extends ASNative {
    public static instanceConstructor: any = ASXML;

    public static callableConstructor: any = function (value: any = undefined): ASXML {
      // 13.5.1 The XMLList Constructor Called as a Function
      if (value === null || value === undefined) {
        value = '';
      }
      return toXML(value);
    };

    public static defaultNamespace = '';
    private static _flags: ASXML_FLAGS = ASXML_FLAGS.ALL;
    private static _prettyIndent = 2;
    private _name: ASQName;
    private _parent: ASXML;
    private _attributes: ASXML [];
    private _inScopeNamespaces: ASNamespace [];

    private _kind: ASXMLKind;

    private _children: ASXML [];
    private _value: any;

    constructor (value: any = undefined) {
      false && super();
      if (!(this instanceof ASXML)) {
        if (value instanceof ASXML) {
          return value; // no cloning
        }
        return new ASXML(value);
      }
      if (value === null || value === undefined) {
        value = "";
      }
      var x = toXML(value);
      if (isXMLType(value)) {
        x = x._deepCopy();
      }
      return x;
    }

    init(kind: number, uri, name, prefix) {
      var namespace = uri || prefix ? new ASNamespace(prefix, uri) : undefined;
      var isAttribute = kind === ASXMLKind.Attribute;
      this._name = new ASQName(namespace, name, isAttribute);
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

    // XML.[[Length]]
    length(): number {
      if (!this._children) {
        return 0;
      }
      return this._children.length;
    }

    // 9.1.1.7 [[DeepCopy]] ( )
    _deepCopy(): ASXML {
      var kind: ASXMLKind = this._kind;
      var clone = new ASXML();
      clone._kind = kind;
      clone._name = this._name;
      switch (kind) {
        case ASXMLKind.Element:
          clone._inScopeNamespaces = [];
          if (this._inScopeNamespaces.length > 0) {
            this._inScopeNamespaces.forEach(function (ns) {
              clone._inScopeNamespaces.push(new ASNamespace(ns.prefix, ns.uri));
            });
          }
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

    _addInScopeNamespaces(ns) {
      if (this._inScopeNamespaces.some(function (ins) { return ins.uri === ns.uri && ins.prefix === ns.prefix; })) {
        return;
      }
      this._inScopeNamespaces.push(ns);
    }

    static get ignoreComments(): boolean {
      return !!(ASXML._flags & ASXML_FLAGS.FLAG_IGNORE_COMMENTS);
    }
    static set ignoreComments(newIgnore: boolean) {
      newIgnore = !!newIgnore;
      if (newIgnore) {
        ASXML._flags |= ASXML_FLAGS.FLAG_IGNORE_COMMENTS;
      } else {
        ASXML._flags &= ~ASXML_FLAGS.FLAG_IGNORE_COMMENTS;
      }
    }
    static get ignoreProcessingInstructions(): boolean {
      return !!(ASXML._flags & ASXML_FLAGS.FLAG_IGNORE_PROCESSING_INSTRUCTIONS);
    }
    static set ignoreProcessingInstructions(newIgnore: boolean) {
      newIgnore = !!newIgnore;
      if (newIgnore) {
        ASXML._flags |= ASXML_FLAGS.FLAG_IGNORE_PROCESSING_INSTRUCTIONS;
      } else {
        ASXML._flags &= ~ASXML_FLAGS.FLAG_IGNORE_PROCESSING_INSTRUCTIONS;
      }
    }
    static get ignoreWhitespace(): boolean {
      return !!(ASXML._flags & ASXML_FLAGS.FLAG_IGNORE_WHITESPACE);
    }
    static set ignoreWhitespace(newIgnore: boolean) {
      newIgnore = !!newIgnore;
      if (newIgnore) {
        ASXML._flags |= ASXML_FLAGS.FLAG_IGNORE_WHITESPACE;
      } else {
        ASXML._flags &= ~ASXML_FLAGS.FLAG_IGNORE_WHITESPACE;
      }
    }
    static get prettyPrinting(): boolean {
      return !!(ASXML._flags & ASXML_FLAGS.FLAG_PRETTY_PRINTING);
    }
    static set prettyPrinting(newPretty: boolean) {
      newPretty = !!newPretty;
      if (newPretty) {
        ASXML._flags |= ASXML_FLAGS.FLAG_PRETTY_PRINTING;
      } else {
        ASXML._flags &= ~ASXML_FLAGS.FLAG_PRETTY_PRINTING;
      }
    }
    static get prettyIndent(): number /*int*/ {
      return ASXML._prettyIndent;
    }
    static set prettyIndent(newIndent: number /*int*/) {
      newIndent = newIndent | 0;
      ASXML._prettyIndent = newIndent;
    }
    toString(): string {
      return toString(this);
    }
    native_hasOwnProperty(P: any = undefined): boolean {
      // 13.4.4.14 XML.prototype.hasOwnProperty ( P )
      if (this.hasProperty(P, isQNameAttribute(P), false)) {
        return true;
      }
      return _asHasOwnProperty.call(this, String(P));
    }
    native_propertyIsEnumerable(P: any = undefined): boolean {
      // 13.4.4.30 XML.prototype.propertyIsEnumerable ( P )
      return String(P) === "0";
    }
    addNamespace(ns: any): ASXML {
      // 13.4.4.2 XML.prototype.addNamespace ( namespace )
      this._addInScopeNamespaces(new ASNamespace(ns));
      return this;
    }
    appendChild(child: any): ASXML {
      // TODO review
      if (child._parent) {
        var index = child._parent._children.indexOf(child);
        release || assert(index >= 0);
        child._parent._children.splice(index, 1);
      }
      this._children.push(child);
      child._parent = this;
      return this;
    }
    attribute(arg: any): ASXMLList {
      return this.getProperty(arg, true, false);
    }
    attributes(): ASXMLList {
      var list = new XMLList();
      Array.prototype.push.apply(list._children, this._attributes);
      return list;
    }
    child(propertyName: any): ASXMLList {
      return this.getProperty(propertyName, isQNameAttribute(propertyName), false);
    }
    childIndex(): number /*int*/ {
      // 13.4.4.7 XML.prototype.childIndex ( )
      if (!this._parent || this._kind === ASXMLKind.Attribute) {
        return -1;
      }
      return this._parent._children.indexOf(this);
    }
    children(): ASXMLList {
      var xl = new XMLList(this);
      Array.prototype.push.apply(xl._children, this._children);
      return xl;
    }
    contains(value: any): boolean {
      // 13.4.4.10 XML.prototype.contains ( value )
      return this === value;
    }
    copy(): ASXML {
      return this._deepCopy();
    }
    elements(name: any = "*"): ASXMLList {
      // 13.4.4.13 XML.prototype.elements ( [ name ] )
      return this.getProperty(name, false, false);
    }
    hasComplexContent(): boolean {
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
      // 13.4.4.16 XML.prototype.hasSimpleContent()
      if (this._kind === ASXMLKind.Comment ||
          this._kind === ASXMLKind.ProcessingInstruction) {
        return false;
      }
      if (!this._children && this._children.length === 0) {
        return true;
      }
      return this._children.every(function (child) {
        return child._kind !== ASXMLKind.Element;
      });
    }

    inScopeNamespaces(): any [] {
      notImplemented("public.XML::inScopeNamespaces"); return;
    }
    insertChildAfter(child1: any, child2: any): any {

      notImplemented("public.XML::insertChildAfter"); return;
    }
    insertChildBefore(child1: any, child2: any): any {

      notImplemented("public.XML::insertChildBefore"); return;
    }
    localName(): Object {
      return this._name.localName;
    }
    name(): Object {
      return this._name;
    }
    private _namespace(prefix: any, argc: number /*int*/): any {
      argc = argc | 0;
      notImplemented("public.XML::private _namespace"); return;
    }
    namespaceDeclarations(): any [] {
      notImplemented("public.XML::namespaceDeclarations"); return;
    }
    nodeKind(): string {
      return ASXMLKindNames[this._kind];
    }
    normalize(): ASXML {
      notImplemented("public.XML::normalize"); return;
    }
    parent(): any {
      return this._parent;
    }
    processingInstructions(name: any = "*"): ASXMLList {

      notImplemented("public.XML::processingInstructions"); return;
    }
    prependChild(value: any): ASXML {

      notImplemented("public.XML::prependChild"); return;
    }
    removeNamespace(ns: any): ASXML {

      notImplemented("public.XML::removeNamespace"); return;
    }
    setChildren(value: any): ASXML {

      notImplemented("public.XML::setChildren"); return;
    }
    setLocalName(name: any): void {

      notImplemented("public.XML::setLocalName"); return;
    }
    setName(name: any): void {

      notImplemented("public.XML::setName"); return;
    }
    setNamespace(ns: any): void {

      notImplemented("public.XML::setNamespace"); return;
    }
    toXMLString(): string {
      return toXMLString(this);
    }
    notification(): Function {
      notImplemented("public.XML::notification"); return;
    }
    setNotification(f: Function): any {
      f = f;
      notImplemented("public.XML::setNotification"); return;
    }


    public static isTraitsOrDynamicPrototype(value): boolean {
      return value === ASXML.traitsPrototype || value === ASXML.dynamicPrototype;
    }

    asGetEnumerableKeys() {
      if (ASXML.isTraitsOrDynamicPrototype(this)) {
        return _asGetEnumerableKeys.call(this);
      }
      var keys = [];
      this._children.forEach(function (v, i) {
        keys.push(v.name);
      });
      return keys;
    }

    setProperty(p, isAttribute, v) {
      var i, c, n;
      var self: ASXML = this;
      if (p === p >>> 0) {
        throw "TypeError in XML.prototype.setProperty(): invalid property name " + p;
      }
      if (self._kind === ASXMLKind.Text ||
          self._kind === ASXMLKind.Comment ||
          self._kind === ASXMLKind.ProcessingInstruction ||
          self._kind === ASXMLKind.Attribute) {
        return;
      }
      if (!v ||
        !isXMLType(v) ||
        v._kind === ASXMLKind.Text ||
        v._kind === ASXMLKind.Attribute) {
        c = toString(v);
      } else {
        c = v._deepCopy();
      }
      n = toXMLName(p);

      if (isAttribute) {
        if (!this._attributes) {
          return;
        }
        this._attributes.forEach(function (v, i, o) {
          if (v.name === n.localName) {
            delete o[i];
          }
        });
        var a = new XML(ASXMLKind.Attribute, n.uri, n.localName);
        a._value = v;
        a._parent = this;
        this._attributes.push(a);
        return;
      }

      var i = undefined;
      var primitiveAssign = !isXMLType(c) && n.localName !== "*";
      var isAny = n._flags & ASQNameFlags.ANY_NAME;
      var isAnyNamespace = n._flags & ASQNameFlags.ANY_NAMESPACE;
      for (var k = self.length() - 1; k >= 0; k--) {
        if ((isAny || self._children[k]._kind === ASXMLKind.Element &&
          self._children[k]._name.localName === n.localName) &&
          (isAnyNamespace ||
            self._children[k]._kind === ASXMLKind.Element &&
            self._children[k]._name.uri === n.uri)) {
          if (i !== undefined) {
            self.deleteByIndex(String(i));
          }
          i = k;
        }
      }
      if (i === undefined) {
        i = self.length();
        if (primitiveAssign) {
          if (n.uri === null) {
            var name = new ASQName(getDefaultNamespace(/* scope */), n);
          } else {
            var name = new ASQName(n);
          }
          var y = new XML(ASXMLKind.Element, name.uri, name.localName, name.prefix);
          y._parent = self;
          var ns = name.getNamespace();
          self.replace(String(i), y);
          y.addInScopeNamespace(ns);
        }
      }
      if (primitiveAssign) {
        self._children[i]._children = [];   // blow away kids of x[i]
        var s = toString(c);
        if (s !== "") {
          self._children[i].replace("0", s);
        }
      } else {
        self.replace(String(i), c);
      }
      return;
    }

    public asSetProperty(namespaces: Namespace [], name: any, flags: number, value: any) {
      if (ASXML.isTraitsOrDynamicPrototype(this)) {
        return _asSetProperty.call(this, namespaces, name, flags, value);
      }
      var isAttribute = flags & Multiname.ATTRIBUTE;
      this.setProperty(prefixWithNamespace(namespaces, name, isAttribute),
        isAttribute, value);
    }


    // 9.1.1.1 XML.[[Get]] (P)
    getProperty(mn, isAttribute, isMethod) {
      if (isMethod) {
        var resolved = Multiname.isQName(mn) ? mn :
          this.resolveMultinameProperty(mn.namespaces, mn.name, mn.flags);
        return this[Multiname.getQualifiedName(resolved)];
      }
      if (!Multiname.isQName(mn) && isNumeric(mn)) {
        // this is a shortcut to the E4X logic that wants us to create a new
        // XMLList with of size 1 and access it with the given index.
        if (Number(mn) === 0) {
          return this;
        }
        return null;
      }
      var self: ASXML = this;
      var name = toXMLName(mn);
      var xl = new XMLList(self, name);
      var flags = name._flags;
      var anyName = flags & ASQNameFlags.ANY_NAME;
      var anyNamespace = flags & ASQNameFlags.ANY_NAMESPACE;

      if (isAttribute) {
        if (self._attributes) {
          self._attributes.forEach(function (v, i) {
            if ((anyName || (v._name.localName === name.localName)) &&
              ((anyNamespace || v._name.uri === name.uri))) {
              xl.appendChild(v);
            }
          });
        }
      } else {
        self._children.forEach(function (v, i) {
          if ((anyName || v._kind === ASXMLKind.Element && v._name.localName === name.localName) &&
            ((anyNamespace || v._kind === ASXMLKind.Element && v._name.uri === name.uri))) {
            xl.appendChild(v);
          }
        });
      }
      return xl;
    }

    public asGetNumericProperty(name: number) {
      return this.asGetProperty(null, name, 0);
    }

    public asSetNumericProperty(name: number, value) {
      this.asSetProperty(null, name, 0, value);
    }

    public asGetProperty(namespaces: Namespace [], name: any, flags: number) {
      if (ASXML.isTraitsOrDynamicPrototype(this)) {
        return _asGetProperty.call(this, namespaces, name, flags);
      }
      var isAttribute = flags & Multiname.ATTRIBUTE;
      return this.getProperty(prefixWithNamespace(namespaces, name, isAttribute),
        isAttribute, false);
    }

    hasProperty(mn, isAttribute?, isMethod?) {
      if (isMethod) {
        var resolved = Multiname.isQName(mn) ? mn :
          this.resolveMultinameProperty(mn.namespaces, mn.name, mn.flags);
        return !!this[Multiname.getQualifiedName(resolved)];
      }
      var self: ASXML = this;
      var xl = new XMLList();
      if (isIndex(mn)) {
        // this is a shortcut to the E4X logic that wants us to create a new
        // XMLList with of size 1 and access it with the given index.
        if (Number(mn) === 0) {
          return true;
        }
        return false;
      }
      var name = toXMLName(mn);
      var flags = name._flags;
      var anyName = flags & ASQNameFlags.ANY_NAME;
      var anyNamespace = flags & ASQNameFlags.ANY_NAMESPACE;
      if (isAttribute) {
        if (self._attributes) {
          return this._attributes.some(function (v, i): any {
            return ((anyName || (v._name.localName === name.localName)) &&
              ((anyNamespace || v._name.uri === name.uri)));
          });
        }
      } else {
        if (this._children.some(function (v, i): any {
          return ((anyName || v._kind === ASXMLKind.Element && v._name.localName === name.localName) &&
            ((anyNamespace || v._kind === ASXMLKind.Element && v._name.uri === name.uri)));
        })) {
          return true;
        }
      }
    }

    public asHasProperty(namespaces: Namespace [], name: any, flags: number) {
      if (ASXML.isTraitsOrDynamicPrototype(this)) {
        return _asHasProperty.call(this, namespaces, name, flags);
      }
      var isAttribute = flags & Multiname.ATTRIBUTE;
      name = prefixWithNamespace(namespaces, name, isAttribute);
      if (this.hasProperty(name, isAttribute, false)) {
        return true;
      }

      // HACK if child with specific name is not present, check object's attributes.
      // The presence of the attribute/method can be checked during with(), see #850.
      var resolved = Multiname.isQName(name) ? name :
        this.resolveMultinameProperty(namespaces, name, flags);
      return !!this[Multiname.getQualifiedName(resolved)];
    }

    public asHasPropertyInternal(namespaces: Namespace [], name: any, flags: number) {
      return this.asHasProperty(namespaces, name, flags);
    }

    asCallProperty(namespaces: Namespace [], name: any, flags: number, isLex: boolean, args: any []) {
      if (ASXML.isTraitsOrDynamicPrototype(this) || isLex) {
        return _asCallProperty.call(this, namespaces, name, flags, isLex, args);
      }
      // Checking if the method exists before calling it
      var self: Object = this;
      var result;
      var method;
      var resolved = self.resolveMultinameProperty(namespaces, name, flags);
      if (self.asGetNumericProperty && Multiname.isNumeric(resolved)) {
        method = self.asGetNumericProperty(resolved);
      } else {
        var openMethods = self.asOpenMethods;
        method = (openMethods && openMethods[resolved]) || self[resolved];
      }
      if (method) {
        return _asCallProperty.call(this, namespaces, name, flags, isLex, args);
      }
      // Otherwise, 11.2.2.1 CallMethod ( r , args )
      // If f == undefined and Type(base) is XMLList and base.[[Length]] == 1
      //   ii. Return the result of calling CallMethod(r0, args) recursively

      // f. If f == undefined and Type(base) is XML and base.hasSimpleContent () == true
      //   i. Let r0 be a new Reference with base object = ToObject(ToString(base)) and property name = P
      //   ii. Return the result of calling CallMethod(r0, args) recursively
      if (this.hasSimpleContent()) {
        return Object(toString(this)).asCallProperty(namespaces, name, flags, isLex, args);
      }
      throw new TypeError();
    }

    _delete(key, isMethod) {
      notImplemented("XML.[[Delete]]");
    }

    deleteByIndex (p) {
      var self: ASXML = this;
      var i = p >>> 0;
      if (String(i) !== String(p)) {
        throw "TypeError in XML.prototype.deleteByIndex(): invalid index " + p;
      }
      if (p < self.length()) {
        if (self.children[p]) {
          self.children[p]._parent = null;
          delete self.children[p];
          for (var q = i + 1; q < self.length(); q++) {
            self.children[q - 1] = self.children[q];
          }
          self.children.length = self.children.length - 1;
        }
      }
    }

    // 9.1.1.11 [[Insert]] (P, V)
    insert(p, v) {
      var s, i, n;
      var self: ASXML = this;
      if (self._kind === ASXMLKind.Text ||
          self._kind === ASXMLKind.Comment ||
          self._kind === ASXMLKind.ProcessingInstruction ||
          self._kind === ASXMLKind.Attribute) {
        return;
      }
      i = p >>> 0;
      if (String(p) !== String(i)) {
        throw "TypeError in XML.prototype.insert(): invalid property name " + p;
      }
      if (self._kind === ASXMLKind.Element) {
        var a = self;
        while (a) {
          if (a === v) {
            throw "Error in XML.prototype.insert()";
          }
          a = a._parent;
        }
      }
      if (self instanceof ASXMLList) {
        n = self.length();
        if (n === 0) {
          return;
        }
      } else {
        n = 1;
      }
      for (var j = self.length() - 1; j >= i; j--) {
        self._children[j + n] = self._children[j];
      }
      if (self instanceof ASXMLList) {
        n = v.length();
        for (var j = 0; j < n; j++) {
          v._children[j]._parent = self;
          self[i + j] = v[j];
        }
      } else {
        //x.replace(i, v);
        v._parent = self;
        self._children[i] = v;
      }
    }

    // 9.1.1.12 [[Replace]] (P, V)
    replace(p: any, v: any): ASXML {
      var s;
      var self: ASXML = this;
      if (self._kind === ASXMLKind.Text ||
          self._kind === ASXMLKind.Comment ||
          self._kind === ASXMLKind.ProcessingInstruction ||
          self._kind === ASXMLKind.Attribute) {
        return self;
      }
      if (v._kind === ASXMLKind.Element) {
        var a = self;
        while (a) {
          if (a === v) {
            throw "Error in XML.prototype.replace()";
          }
          a = a._parent;
        }
      }
      var i = p >>> 0;
      if (String(p) === String(i)) {
        if (i >= self.length()) {
          p = String(self.length());
        }
        if (self._children[p]) {
          self._children[p]._parent = null;
        }
      } else {
        var toRemove = this.getProperty(p, false, false);
        if (toRemove.length() === 0) { // nothing to replace
          return self;
        }
        toRemove._children.forEach(function (v, i) {
          var index = self._children.indexOf(v);
          v._parent = null;
          if (i === 0) {
            p = String(index);
            self._children.splice(index, 1, undefined);
          } else {
            self._children.splice(index, 1);
          }
        });
      }

      if (v._kind === ASXMLKind.Element ||
          v._kind === ASXMLKind.Text ||
          v._kind === ASXMLKind.Comment ||
          v._kind === ASXMLKind.ProcessingInstruction) {
        v._parent = self;
        self._children[p] = v;
      } else {
        s = toString(v);
        var t = new XML();
        t._parent = self;
        t._value = s;
        self._children[p] = t;
      }
      return self;
    }

    // 9.1.1.13 [[AddInScopeNamespace]] ( N )
    addInScopeNamespace(ns: ASNamespace) {
      var s;
      var self: ASXML = this;
      if (self._kind === ASXMLKind.Text ||
          self._kind === ASXMLKind.Comment ||
          self._kind === ASXMLKind.ProcessingInstruction ||
          self._kind === ASXMLKind.Attribute) {
        return;
      }
      if (ns.prefix !== undefined) {
        if (ns.prefix === "" && self._name.uri === "") {
          return;
        }
        var match = null;
        self._inScopeNamespaces.forEach(function (v, i) {
          if (v.prefix === ns.prefix) {
            match = v;
          }
        });
        if (match !== null && match.uri !== ns.uri) {
          self._inScopeNamespaces.forEach(function (v, i) {
            if (v.prefix === match.prefix) {
              self._inScopeNamespaces[i] = ns;  // replace old with new
            }
          });
        }
        if (self._name.prefix === ns.prefix) {
          self._name.prefix = undefined;
        }
        self._attributes.forEach(function (v, i) {
          if (v._name.prefix === ns.prefix) {
            v._name.prefix = undefined;
          }
        });
      }
    }

    // 9.1.1.8 [[Descendants]] (P)
    descendants(name: any = "*"): ASXMLList {
      name = toXMLName(name);
      var flags = name._flags;
      var self: ASXML = this;
      var xl = new XMLList();
      if (self._kind !== ASXMLKind.Element) {
        return xl;
      }
      var isAny = flags & ASQNameFlags.ANY_NAME;
      if (flags & ASQNameFlags.ATTR_NAME) {
        // Get attributes
        this._attributes.forEach(function (v, i) {
          if (isAny || name.localName === v._name.localName) {
            xl.appendChild(v);
          }
        });
      } else {
        // Get children
        this._children.forEach(function (v, i) {
          if (isAny || name.localName === v._name.localName) {
            xl.appendChild(v);
          }
        });
      }
      // Descend
      this._children.forEach(function (v, i) {
        xl.appendChild(v.descendants(name));
      });
      return xl;
    }

    comments() {
      // 13.4.4.9 XML.prototype.comments ( )
      var self: ASXML = this;
      var xl = new XMLList(self, null);
      self._children.forEach(function (v, i) {
        if (v._kind === ASXMLKind.Comment) {
          xl.appendChild(v);
        }
      });
      return xl;
    }

    text() {
      // 13.4.4.37 XML.prototype.text ( );
      var self: ASXML = this;
      var xl = new XMLList(self, null);
      self._children.forEach(function (v, i) {
        if (v._kind === ASXMLKind.Text) {
          xl.appendChild(v);
        }
      });
      return xl;
    }
  }

  function XML(kind?: ASXMLKind, uri?, name?, prefix?) {
    if (kind === undefined) {
      kind = ASXMLKind.Text;
    }
    if (uri === undefined) {
      uri = "";
    }
    if (name === undefined) {
      name = "";
    }
    this.init(kind, uri, name, prefix);
  }

  XML.prototype = ASXML.prototype;

  export class ASXMLList extends ASNative {
    public static instanceConstructor: any = ASXMLList;

    public static callableConstructor: any = function (value: any = undefined): ASXMLList {
      // 13.5.1 The XMLList Constructor Called as a Function
      if (value === null || value === undefined) {
        value = '';
      }
      return toXMLList(value);
    };

    private _children: ASXML [];
    constructor (value: any = undefined) {
      false && super();

      if (value === null || value === undefined) {
        value = "";
      }
      var xl = toXMLList(value);
      if (isXMLType(value)) {
        xl = xl._deepCopy();
      }
      return xl;
    }
    toString(): string {
      return toString(this);
    }
    // 9.2.1.7 [[DeepCopy]] ( )
    _deepCopy() {
      // TODO 2. Copy all internal properties of x to list
      var xl = new XMLList();
      for (var i = 0; i < this.length(); i++) {
        xl.appendChild(this._children[i]._deepCopy());
      }
      return xl;
    }

    hasOwnProperty(P: any = undefined): boolean {
      notImplemented("public.XMLList::hasOwnProperty"); return;
    }
    propertyIsEnumerable(P: any = undefined): boolean {

      notImplemented("public.XMLList::propertyIsEnumerable"); return;
    }
    attribute(arg: any): ASXMLList {
      return this.getProperty(arg, true, false);
    }
    attributes(): ASXMLList {
      // 13.5.4.3 XMLList.prototype.attributes ( )
      return this.getProperty('*', true, false);
    }
    child(propertyName: any): ASXMLList {
      return this.getProperty(propertyName, false, false);
    }
    children(): ASXMLList {
      // 13.5.4.4 XMLList.prototype.child ( propertyName )
      return this.getProperty('*', false, false);
    }
    comments(): ASXMLList {
      // 13.5.4.6 XMLList.prototype.comments ( )
      var xl = new XMLList(this);
      this._children.forEach(function (child) {
        if ((<any> child)._kind === ASXMLKind.Element) {
          var r = child.comments();
          Array.prototype.push.apply(xl._children, r._children);
        }
      });
      return xl;
    }
    contains(value: any): boolean {
      // 13.5.4.8 XMLList.prototype.contains ( value )
      return this._children.indexOf(value) >= 0;
    }
    copy(): ASXMLList {
      // 13.5.4.9 XMLList.prototype.copy ( )
      return this._deepCopy();
    }
    elements(name: any = "*"): ASXMLList {
      // 13.5.4.11 XMLList.prototype.elements ( [ name ] )
      var xl = new XMLList(this, new ASQName(name));
      this._children.forEach(function (child) {
        if ((<any> child)._kind === ASXMLKind.Element) {
          var r = child.elements(name);
          Array.prototype.push.apply(xl._children, r._children);
        }
      });
      return xl;
    }
    hasComplexContent(): boolean {
      // 13.5.4.13 XMLList.prototype.hasComplexContent( )
      switch (this.length()) {
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
      switch (this.length()) {
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
      return this._children[0].name();
    }
    normalize(): ASXMLList {
      notImplemented("public.XMLList::normalize"); return;
    }
    parent(): any {
      // 13.5.4.17 XMLList.prototype.parent ( )
      if (this.length() === 0) {
        return undefined;
      }
      var parent = (<any> this._children[0])._parent;
      for (var i = 1; i < this.length(); i++) {
        if (parent !== (<any> this._children[i])._parent) {
          return undefined;
        }
      }
      return parent;
    }
    processingInstructions(name: any = "*"): ASXMLList {

      notImplemented("public.XMLList::processingInstructions"); return;
    }
    text(): ASXMLList {
      // 13.5.4.20 XMLList.prototype.text ( )
      var xl = new XMLList(this);
      this._children.forEach(function (v:any, i) {
        if (v._kind === ASXMLKind.Element) {
          var gq = v.text();
          if (gq.length() > 0) {
            xl.appendChild(gq);
          }
        }
      });
      return xl;
    }
    toXMLString(): string {
      return toXMLString(this);
    }
    addNamespace(ns: any): ASXML {

      notImplemented("public.XMLList::addNamespace"); return;
    }
    appendChild(child: any) {
      if (child instanceof ASXMLList) {
        this._children.push.apply(this._children, child._children);
        return child;
      }
      this._children.push(child);
      return child;
      //notImplemented("public.XMLList::appendChild"); return;
    }
    childIndex(): number /*int*/ {
      notImplemented("public.XMLList::childIndex"); return;
    }
    inScopeNamespaces(): any [] {
      notImplemented("public.XMLList::inScopeNamespaces"); return;
    }
    insertChildAfter(child1: any, child2: any): any {

      notImplemented("public.XMLList::insertChildAfter"); return;
    }
    insertChildBefore(child1: any, child2: any): any {

      notImplemented("public.XMLList::insertChildBefore"); return;
    }
    nodeKind(): string {
      notImplemented("public.XMLList::nodeKind"); return;
    }
    private _namespace(prefix: any, argc: number /*int*/): any {
      argc = argc | 0;
      notImplemented("public.XMLList::private _namespace"); return;
    }
    localName(): Object {
      notImplemented("public.XMLList::localName"); return;
    }
    namespaceDeclarations(): any [] {
      notImplemented("public.XMLList::namespaceDeclarations"); return;
    }
    prependChild(value: any): ASXML {

      notImplemented("public.XMLList::prependChild"); return;
    }
    removeNamespace(ns: any): ASXML {

      notImplemented("public.XMLList::removeNamespace"); return;
    }
    replace(propertyName: any, value: any): ASXML {

      notImplemented("public.XMLList::replace"); return;
    }
    setChildren(value: any): ASXML {

      notImplemented("public.XMLList::setChildren"); return;
    }
    setLocalName(name: any): void {

      notImplemented("public.XMLList::setLocalName"); return;
    }
    setName(name: any): void {

      notImplemented("public.XMLList::setName"); return;
    }
    setNamespace(ns: any): void {

      notImplemented("public.XMLList::setNamespace"); return;
    }

    public static isTraitsOrDynamicPrototype(value): boolean {
      return value === ASXMLList.traitsPrototype || value === ASXMLList.dynamicPrototype;
    }

    asGetEnumerableKeys() {
      if (ASXMLList.isTraitsOrDynamicPrototype(this)) {
        return _asGetEnumerableKeys.call(this);
      }
      return this._children.asGetEnumerableKeys();
    }

    // 9.2.1.1 [[Get]] (P)
    getProperty(mn, isAttribute, isMethod) {
      if (isMethod) {
        var resolved = Multiname.isQName(mn) ? mn :
          this.resolveMultinameProperty(mn.namespaces, mn.name, mn.flags);
        return this[Multiname.getQualifiedName(resolved)];
      }
      if (isIndex(mn)) {
        return this._children[mn];
      }
      var name = toXMLName(mn);
      var xl = new XMLList(this, name);
      this._children.forEach(function (v:any, i) {
        // a. If x[i].[[Class]] == "element",
        if (v._kind === ASXMLKind.Element) {
          // i. Let gq be the result of calling the [[Get]] method of x[i] with argument P
          var gq = v.getProperty(name, isAttribute, isMethod);
          // ii. If gq.[[Length]] > 0, call the [[Append]] method of list with argument gq
          if (gq.length() > 0) {
            xl.appendChild(gq);
          }
        }
      });
      return xl;
    }

    public asGetNumericProperty(name: number) {
      return this.asGetProperty(null, name, 0);
    }

    public asSetNumericProperty(name: number, value) {
      this.asSetProperty(null, name, 0, value);
    }

    public asGetProperty(namespaces: Namespace [], name: any, flags: number) {
      if (ASXMLList.isTraitsOrDynamicPrototype(this)) {
        return _asGetProperty.call(this, namespaces, name, flags);
      }
      var isAttribute = flags & Multiname.ATTRIBUTE;
      return this.getProperty(prefixWithNamespace(namespaces, name, isAttribute),
        isAttribute, false);
    }

    hasProperty(mn, isAttribute) {
      if (isIndex(mn)) {
        return Number(mn) < this._children.length;
      }
      // TODO scan children on property presence?
      return true;
    }

    public asHasProperty(namespaces: Namespace [], name: any, flags: number) {
      if (ASXMLList.isTraitsOrDynamicPrototype(this)) {
        return _asGetProperty.call(this, namespaces, name, flags);
      }
      var isAttribute = flags & Multiname.ATTRIBUTE;
      return this.hasProperty(prefixWithNamespace(namespaces, name, isAttribute),
        isAttribute);
    }

    public asHasPropertyInternal(namespaces: Namespace [], name: any, flags: number) {
      var isAttribute = flags & Multiname.ATTRIBUTE;
      return this.hasProperty(prefixWithNamespace(namespaces, name, isAttribute),
        isAttribute);
    }

    setProperty(mn, isAttribute, value) {
      if (isIndex(mn)) {
        // TODO do we need to simulate a sparse array here?
        this.appendChild(value);
        return;
      }
      // TODO
      var node = this.getProperty(mn, isAttribute, false);
      toXML(node).replace(0, toXML(value));
    }

    public asSetProperty(namespaces: Namespace [], name: any, flags: number, value: any) {
      if (ASXMLList.isTraitsOrDynamicPrototype(this)) {
        return _asSetProperty.call(this, namespaces, name, flags, value);
      }
      var isAttribute = flags & Multiname.ATTRIBUTE;
      name = prefixWithNamespace(namespaces, name, isAttribute);
      return this.setProperty(name, isAttribute, value);
    }

    asCallProperty(namespaces: Namespace [], name: any, flags: number, isLex: boolean, args: any []) {
      if (ASXMLList.isTraitsOrDynamicPrototype(this) || isLex) {
        return _asCallProperty.call(this, namespaces, name, flags, isLex, args);
      }
      // Checking if the method exists before calling it
      var self: Object = this;
      var result;
      var method;
      var resolved = self.resolveMultinameProperty(namespaces, name, flags);
      if (self.asGetNumericProperty && Multiname.isNumeric(resolved)) {
        method = self.asGetNumericProperty(resolved);
      } else {
        var openMethods = self.asOpenMethods;
        method = (openMethods && openMethods[resolved]) || self[resolved];
      }
      if (method) {
        return _asCallProperty.call(this, namespaces, name, flags, isLex, args);
      }
      // Otherwise, 11.2.2.1 CallMethod ( r , args )
      // If f == undefined and Type(base) is XMLList and base.[[Length]] == 1
      //   ii. Return the result of calling CallMethod(r0, args) recursively
      if (this.length() === 1) {
        return this._children[0].asCallProperty(namespaces, name, flags, isLex, args);
      }
      throw new TypeError();
    }
  }

  function XMLList(targetObject?, targetProperty?) {
    this._targetObject = targetObject ? targetObject : null;
    this._targetProperty = targetProperty ? targetProperty : null;
    this._children = [];
  }

  XMLList.prototype = ASXMLList.prototype;
}
