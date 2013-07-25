/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
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

// The XML parser is designed only for parsing of simple XML documents

var XMLClass, XMLListClass, QNameClass, ASXML, XML, ASXMLList, XMLList, isXMLType, isXMLName;
var XMLParser;

(function () {
  function XMLEncoder(ancestorNamespaces, indentLevel, prettyPrinting) {
    var indent = "\n  ";
    function visit(node, encode) {
      if (node.isXML) {
        switch (node.kind) {
        case "element":
          return encode.element(node);
        case "attribute":
          return encode.attribute(node);
        case "text":
          return encode.text(node);
        case "cdata":
          return encode.cdata(node);
        case "comment":
          return encode.comment(node);
        case "processing-instruction":
          return encode.pi(node);
        }
      } else if (node.isXMLList) {
        return encode.list(node);
      } else {
        throw "Not implemented";
      }
    }
    function encode(node, encoder) {
      return visit(node, {
        element: function (n) {
          var s, a;
          var ns = n.name.mn.namespaces[0];
          var prefix = ns.prefix ? (ns.prefix + ":") : "";
          s = "<" + prefix + n.name.localName;
          // Enumerate namespace declarations
          var namespaceDeclarations = [];
          if (ns.prefix || ns.originalURI) {
            // If either is a non-empty string then create a namespace
            // declaration for it
            namespaceDeclarations.push(ns)
          }
          if (prefix) {
            namespaceDeclarations[prefix] = true;
          }
          for (var i = 0; i < n.inScopeNamespaces.length; i++) {
            if (true) { // FIXME add check for ancestor
              somewhatImplemented("xml.js Encoder.encode() inscope namespaces");
              ns = n.inScopeNamespaces[i];
              if (!namespaceDeclarations[ns.prefix]) {
                namespaceDeclarations.push(ns);
                namespaceDeclarations[ns.prefix] = true;  // flag inclusion
              }
            }
          }
          for (var i = 0; i < namespaceDeclarations.length; i++) {
            a = namespaceDeclarations[i];
            if (a.prefix) {
              s += " xmlns:" + a.prefix + "=\"" + a.originalURI + "\"";
            } else {
              s += " xmlns=\"" + a.originalURI + "\"";
            }
          }
          for (var i = 0; i < n.attributes.length; i++) {
            a = n.attributes[i];
            var ns = n.name.uri;
            var prefix = n.prefix ? (ns.prefix + ":") : "";
            var name = prefix + a.name.localName;
            s += " " + name + "=\"" + a.value + "\"";
          }
          if (n.children.length) {
            s += ">";
            for (var i = 0; i < n.children.length; i++) {
              s += "\n";
              s += visit(n.children[i], this);
            }
            s += "</" + prefix + n.name.mn.name + ">";
          } else {
            s += "/>";
          }
          return s;
        },
        text: function(text) {
          return text.value.
            replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        },
        attribute: function(n) {
          return escapeAttributeValue(n.value);
        },
        cdata: function(n) {
        },
        comment: function(n) {
        },
        pi: function(n) {
        },
        doctype: function(n) {
        },
        list: function (n) {
          var s = "";
          for (var i = 0; i < n.children.length; i++) {
            if (i > 0) {
              s += "\n";
            }
            s += toXMLString(n.children[i], []/*ancestor namespaces*/);
          }
          return s;
        },
      });
    } 
    this.encode = encode;
  }

  function escapeAttributeValue(v) {
    return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  XMLParser = function XMLParser() {
    function parseXml(s, sink) {
      var i = 0, scopes = [{
        space:"default",
        xmlns:"",
        namespaces: {
          "xmlns":"http://www.w3.org/2000/xmlns/",
          "xml":"http://www.w3.org/XML/1998/namespace"
        }
      }];
      function trim(s) {
        return s.replace(/^\s+/, "").replace(/\s+$/, "");
      }
      function resolveEntities(s) {
        return s.replace(/&([^;]+);/g, function(all, entity) {
          if (entity.substring(0, 2) === "#x") {
            return String.fromCharCode(parseInt(entity.substring(2), 16));
          } else if(entity.substring(0,1) === "#") {
            return String.fromCharCode(parseInt(entity.substring(1), 10));
          }
          switch (entity) {
          case "lt": return "<";
          case "gt": return ">";
          case "amp": return "&";
          }
          throw "Unknown entity: " + entity;
        });
      }
      function isWhitespacePreserved() {
        for (var j = scopes.length - 1; j >= 0; --j) {
          if (scopes[j].space === "preserve") {
            return true;
          }
        }
        return false;
      }
      function lookupDefaultNs() {
        for (var j = scopes.length - 1; j >= 0; --j) {
          if (scopes[j].hasOwnProperty("xmlns")) {
            return scopes[j].xmlns;
          }
        }
      }
      function lookupNs(prefix) {
        for (var j = scopes.length - 1; j >= 0; --j) {
          if (scopes[j].namespaces.hasOwnProperty(prefix)) {
            return scopes[j].namespaces[prefix];
          }
        }
        throw "Unknown namespace: " + prefix;
      }
      function getName(name, resolveDefaultNs) {
        var j = name.indexOf(":");
        if (j >= 0) {
          var namespace = lookupNs(name.substring(0,j));
          var prefix = name.substring(0,j);
          var localName = name.substring(j + 1);
          return {
            name: namespace + "::" + localName,
            localName: localName,
            prefix: prefix,
            namespace: namespace,
          };
        } else if(resolveDefaultNs) {
          return {
            name: name,
            localName: name,
            prefix: "",
            namespace: lookupDefaultNs()
          };
        } else {
          return {
            name:name,
            localName: name,
            prefix: "",
            namespace: ""
          };
        }
      }
      function isWhitespace(s, index) {
        var ch = s.charCodeAt(index);
        return ch == 10 || ch == 13 || ch == 9 || ch == 32;
      }
      function parseContent(s, start) {
        var pos = start, name, attributes = [];
        function skipWs() {
          while (pos < s.length && isWhitespace(s, pos)) {
            ++pos;
          }
        }
        while (pos < s.length && !isWhitespace(s, pos) && s.charAt(pos) !== ">" && s.charAt(pos) !== "/") {
          ++pos;
        }
        name = s.substring(start, pos);
        skipWs();
        while (pos < s.length && s.charAt(pos) !== ">" &&
               s.charAt(pos) !== "/" && s.charAt(pos) !== "?") {
          skipWs();
          var attrName = "", attrValue = "";
          while (pos < s.length && !isWhitespace(s, pos) && s.charAt(pos) !== "=") {
            attrName += s.charAt(pos);
            ++pos;
          }
          skipWs();
          if (s.charAt(pos) !== "=") throw "'=' expected";
          ++pos;
          skipWs();
          var attrEndChar = s.charAt(pos);
          if (attrEndChar !== "\"" && attrEndChar !== "\'" ) throw "Quote expected";
          var attrEndIndex = s.indexOf(attrEndChar, ++pos);
          if (attrEndIndex < 0) throw new "Unexpected EOF[6]";
          attrValue = s.substring(pos, attrEndIndex);
          attributes.push({name: attrName, value: resolveEntities(attrValue)});
          pos = attrEndIndex + 1;
          skipWs();
        }
        return {name: name, attributes: attributes, parsed: pos - start};
      }
      while (i < s.length) {
        var ch = s.charAt(i);
        var j = i;
        if (ch === "<") {
          ++j;
          var ch2 = s.charAt(j), q, name;
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
            var content = parseContent(s, j);
            if (s.substring(j + content.parsed, j + content.parsed + 2) != "?>") {
              throw "Unexpected EOF[2]";
            }
            sink.pi(content.name, content.attributes);
            j += content.parsed + 2;
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
            var scope = {namespaces:[]};
            for (q = 0; q < content.attributes.length; ++q) {
              if (content.attributes[q].name.substring(0, 6) === "xmlns:") {
                var prefix = content.attributes[q].name.substring(6);
                var uri = content.attributes[q].value;
                scope.namespaces[prefix] = trim(uri);
                scope.namespaces.push({uri: uri, prefix: prefix});
                delete content.attributes[q];
              } else if (content.attributes[q].name === "xmlns") {
                var prefix = "";
                var uri = content.attributes[q].value;
                scope.namespaces["xmlns"] = trim(uri);
                scope.namespaces.push({uri: uri, prefix: prefix});
                delete content.attributes[q];
              } else if (content.attributes[q].name.substring(0, 4) === "xml:") {
                scope[content.attributes[q].name.substring(4)] = trim(content.attributes[q].value);
              } else if (content.attributes[q].name.substring(0, 3) === "xml") {
                throw "Invalid xml attribute";
              } else {
                // skip ordinary attributes until all xmlns have been handled
              }
            }
            scopes.push(scope);
            var attributes = [];
            for (q = 0; q < content.attributes.length; ++q) {
              if (content.attributes[q]) {
                attributes.push({name: getName(content.attributes[q].name, false), value: content.attributes[q].value});
              }
            }
            sink.beginElement(getName(content.name, true), attributes, scope, isClosed);
            j += content.parsed + (isClosed ? 2 : 1);
            if (isClosed) scopes.pop();
            break;
          }
        } else {
          do {
            if (++j >= s.length) break;
          } while(s.charAt(j) !== "<");
          var text = s.substring(i, j);
          var isWs = text.replace(/^\s+/, "").length === 0;
          if (!isWs || isWhitespacePreserved()) {
            sink.text(resolveEntities(text), isWs);
          }
        }
        i = j;
      }
    }
    // end of parser

    this.parseFromString = function(s, mimeType) {
      var currentElement = new XML("element");  // placeholder
      var elementsStack = [];
      parseXml(s, {
        beginElement: function(name, attrs, scope, isEmpty) {
          var parent = currentElement;
          elementsStack.push(parent);
          currentElement = createNode("element", name.namespace, name.localName, name.prefix);
          for (var i = 0; i < attrs.length; ++i) {
            var attr = createNode("attribute", attrs[i].name.namespace, attrs[i].name.localName, attrs[i].name.prefix);
            attr.value = attrs[i].value;
            currentElement.attributes.push(attr);
          }
          var namespaces = scope.namespaces;
          for (var i = 0; i < namespaces.length; ++i) {
            var ns = ShumwayNamespace.createNamespace(namespaces[i].uri, namespaces[i].prefix);
            currentElement.inScopeNamespaces.push(ns);
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
          var node = createNode("text", "", "");
          node.value = text;
          // isWhitespace?
          currentElement.insert(currentElement.length(), node);
        },
        cdata: function(text) {
          var node = createNode("text", "", "");
          node.value = text;
          currentElement.insert(currentElement.length(), node);
        },
        comment: function(text) { },
        pi: function(name, attrs) { },
        doctype: function(text) { }
      });
      return currentElement;
    };

    function createNode(kind, uri, name, prefix) {
      return new XML(kind, uri, name, prefix);
    }
  }

  var xmlParser = new XMLParser();

  isXMLType = function isXMLType(val) {
    return val.isXML || val.isXMLList;
  }

  // 10.1 ToString
  function toString(node) {
    if (typeof node === "object" && node !== null) {
      switch (node.kind) {
      case "text":
      case "attribute":
        return node.value;
      default:
        if (node.hasSimpleContent()) {
          var str = "";
          node.children.forEach(function (v, i) {
            str += toString(v);
          })
          return str;
        }
        return toXMLString(node);
      }
    } else {
      return String(node);
    }
  }

  // 10.2 ToXMLString
  function toXMLString(node, ancestorNamespaces, indentLevel) {
    return new XMLEncoder(ancestorNamespaces, indentLevel, true).encode(node)
  }


  // 10.3 ToXML
  function toXML(v) {
    if (v === null) {
      throw new TypeError(formatErrorMessage(Errors.ConvertNullToObjectError));
    } else if (v === undefined) {
      throw new TypeError(formatErrorMessage(Errors.ConvertUndefinedToObjectError));
    } else if (v.isXML) {
      return v;
    } else if (v.isXMLList) {
      if (v.length() === 1) {
        return v.children[0];
      }
      throw new TypeError(formatErrorMessage(Errors.XMLMarkupMustBeWellFormed));
    } else {
      var x = xmlParser.parseFromString(String(v));
      if (x.length() === 0) {
        var x = new XML("text");
        return x;
      } else if (x.length() === 1) {
        x.children[0].parent = null;
        return x.children[0];
      }
      throw "SyntaxError in ToXML";
    }
  }

  var defaultNamespace = "";

  // 10.4 ToXMLList
  function toXMLList(value) {
    if (value === null) {
      throw new TypeError(formatErrorMessage(Errors.ConvertNullToObjectError));
    } else if (value === undefined) {
      throw new TypeError(formatErrorMessage(Errors.ConvertUndefinedToObjectError));
    } else if (value instanceof XML) {
      var xl = new XMLList(value.parent, value.name);
      xl.append(value);
      return xl;
    } else if (value instanceof XMLList) {
      return value;
    } else {
      var s = "<parent xmlns='" + defaultNamespace + "'>" + String(value) + "</parent>";
      var x = new ASXML(s);
      var xl = new XMLList();
      for (var i = 0; i < x.length(); i++) {
        var v = x.children[i];
        v.parent = null;
        xl.append(v);
      }
      return xl;
    }
  }

  // 10.5 ToAttributeName
  function toAttributeName(v) {
    if (v === undefined || v === null || typeof v === "boolean" || typeof v === "number") {
      throw "TypeError: invalid operand to ToAttributeName()";
    } else if (isXMLType(v)) {
      v = toString(v);
    } else if (v instanceof Object && v !== null) {
      if (v instanceof QName) {
        return new QName(v.uri, v.localName, true);
      }
      v = toString(v);
    }
    if (typeof v === "string") {
      var ns = new ASNamespace();
      var qn = new QName(ns, v, true);
    } else {
      // FIXME implement
    }
    return qn;
  }

  // 10.6 ToXMLName
  function toXMLName(mn) {
    return new QName(mn);
  }

  // 12.1 GetDefaultNamespace
  function getDefaultNamespace(scope) {
    while (scope) {
      var obj = scope.object;
      if (obj.defaultNamepsace !== undefined) {
        return obj.defaultNamespace;
      }
      scope = scope.parent;
    }
    var ns = ShumwayNamespace.createNamespace("", "");
    return ns;
  }

  // 13.1.2.1 isXMLName ( value )
  // define global binding
  isXMLName = function isXMLName(v) {
    try {
      var qn = new QName(v);
    } catch (e) {
      return false;
    }
    // FIXME scan v to see if it is a valid lexeme and return false if not
    return true;
  }


  function getMultinameProperty(namespaces, name, flags, isMethod) {
    var mn = isNumeric(name) ? Number(name) : new Multiname(namespaces, name, flags);
    return this.getProperty(mn, isMethod);
  }

  function setMultinameProperty(namespaces, name, flags, value) {
    var mn = isNumeric(name) ? Number(name) : new Multiname(namespaces, name, flags);
    this.setProperty(mn, value);
  }

  function hasMultinameProperty(namespaces, name, flags) {
    var mn = isNumeric(name) ? Number(name) : new Multiname(namespaces, name, flags);
    return this.hasProperty(mn);
  }

  function callMultinameProperty(namespaces, name, flags, isLex, args) {
    var receiver = isLex ? null : this;
    var property = this.getMultinameProperty(namespaces, name, flags, true);
    if (!property) {
      return this.toString().callMultinameProperty(namespaces, name, flags, isLex, args);
    }
    return property.apply(receiver, args);
  }

  /**
   * XML.as
   *

   XML Node object structure

   Node {
     kind: ["element", "attribute", "text", "comment", "processing-instruction"]
     parent: [XML, null],
     inScopeNamespaces: [],
   }

   Multiname {
     name: string,
     namespaces: [],
     flags: int,
   }

   QName {
     mn: Multiname,
   },

   Element : Node {
     kind: "element",
     name: QName,
     children: [],
     attributes: [],
   }

   Attribute : Node {
     kind: "attribute",
     name: QName,
     value: string,
     parent: XML,
   }

   Text : Node {
     kind: "text",
     value: string,
   }

   ProcessingInstruction : Node {
     kind: "processing-instruction",
     name: QName,
     value: string,
   }

   Comment : Node {
     kind: "comment",
     value: string,
   }

   *
   *
   */

  XMLClass = function XMLClass(runtime, scope, instanceConstructor, baseClass) {
    var FLAG_IGNORE_COMMENTS                = 0x01;
    var FLAG_IGNORE_PROCESSING_INSTRUCTIONS = 0x02;
    var FLAG_IGNORE_WHITESPACE              = 0x04;
    var FLAG_PRETTY_PRINTING                = 0x08;

    ASXML = function (value) {
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
        x = x.deepCopy();
      }
      return x;
    };

    XML = function (kind, uri, name, prefix) {
      if (kind === undefined) {
        kind = "text";
      }
      if (uri === undefined) {
        uri = "";
      }
      if (name === undefined) {
        name = "";
      }
      this.init(kind, uri, name, prefix);
    }

    var c = new Class("XML", ASXML, Domain.passthroughCallable(ASXML));
    c.flags = FLAG_IGNORE_COMMENTS |
      FLAG_IGNORE_PROCESSING_INSTRUCTIONS |
      FLAG_IGNORE_WHITESPACE |
      FLAG_PRETTY_PRINTING;

    c.prettyIndent = 2;
    c.extend(baseClass);

    var Xp = XML.prototype = ASXML.prototype;

    // Initialize an XML node.
    Xp.init = function init(kind, uri, name, prefix) {
      this.name = new QName(new Multiname([new ASNamespace(prefix, uri)], name));
      this.kind = kind;    // E4X [[Class]]
      this.parent = null;
      this.inScopeNamespaces = [];
      switch (kind) {
      case "element":
        this.attributes = [];
        this.children = [];  // child nodes go here
        break;
      case "attribute":
      case "text":
        this.value = "";
        break;
      default:
        break;
      }
      return this;
    }

    // XML.[[Length]]
    Xp.length = function () {
      if (!this.children) {
        return 0;
      }
      return this.children.length;
    };

    Xp.canHandleProperties = true;


    // 9.1.1.7 [[DeepCopy]] ( )
    Xp.deepCopy = function () {
      // WARNING lots of cases not handled by both toXMLString() and XML()
      return new ASXML(toXMLString(this));
    };

    // 9.1.1.10 [[ResolveValue]] ( )
    Xp.resolveValue = function resolveValue () {
      return this;
    }

    // 13.4.4.16 XML.prototype.hasSimpleContent()
    Xp.hasSimpleContent = function hasSimpleContent() {
      if (this.kind === "comment" || this.kind === "processing-instruction") {
        return false;
      }
      var result = true;
      if (this.children) {
        this.children.forEach(function (v) {
          if (v.kind === "element") {
            result = false;
          }
        });
      }
      return result;
    }

    Xp.getEnumerationKeys = function getEnumerationKeys() {
      var keys = [];
      this.children.forEach(function (v, i) {
        keys.push(v.name);
      });
      return keys;
    };

    var ATTR_NAME = 1;
    var ANY_ATTR_NAME = 2;
    var ANY_NAME = 3;
    var ELEM_NAME = 4;
    function nameKind(mn) {
      if (mn.isAnyName()) {
        if (mn.isAttribute()) {
          return ANY_ATTR_NAME;
        } else {
          return ANY_NAME;
        }
      } else if (mn.isAttribute()) {
        return ATTR_NAME;
      } else {
        return ELEM_NAME;
      }
    }

    function setAttribute(node, name, value) {
      if (node.nodeType === Node.DOCUMENT_NODE) {
        node.childNodes[0].setAttribute(name, value);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.setAttribute(name, value);
      } else {
        throw "error or unhandled case in setAttribute";
      }
    }

    Xp.setProperty = function (p, v) {
      var x, i, c, n;
      x = this;
      if (p === p >>> 0) {
        throw "TypeError in XML.prototype.setProperty(): invalid property name " + p;
      }
      if (x.kind === "text" ||
          x.kind === "comment" ||
          x.kind === "processing-instruction" ||
          x.kind === "attribute") {
        return;
      }
      if (!v ||
          !v.isXML && !v.isXMLList ||
          v.kind === "text" ||
          v.kind === "attribute") {
        c = toString(v);
      } else {
        c = v.deepCopy();
      }
      n = toXMLName(p);
      if (n.isAttr) {
        if (!this.attributes) {
          return;
        }
        this.attributes.forEach(function (v, i, o) {
          if (v.name === n.localName) {
            delete o[i];
          }
        });
        var a = new XML("attribute", n.uri, n.localName);
        a.value = v;
        a.parent = this;
        this.attributes.push(a);
        return;
      }
      var isValidName = isXMLName(n)
      if (!isValidName && n.localName !== "*") {
          return; // We're done
      }
      var i = undefined;
      var primitiveAssign = !isXMLType(c) && n.localName !== "*";
      for (var k = x.length() - 1; k >= 0; k--) {
        // FIXME not ready from prime-time yet
        /*
        print("Xp.setProperty() x[k].localName="+x.children[k].name.localName+" localName="+n.localName);
        if ((n.localName === "*" ||
             x.children[k].kind === "element" &&
             x.children[k].localName === n.localName) &&
            (n.uri === null ||
             x.children[k].kind === "element" &&
             x.children[k].uri === n.uri)) {
          if (i !== undefined) {
            print("Xp.setProperty() mn="+mn);
            x.deleteByIndex(String(i));
          }
        }
        i = k;
        */
      }
      if (i === undefined) {
        i = x.length();
        if (primitiveAssign) {
          if (n.uri === null) {
            var name = new QName(getDefaultNamespace(scope), n);
          } else {
            var name = new QName(n);
          }
          var y = new XML("element", name.uri, name.localName, name.prefix);
          y.parent = x;
          var ns = name.getNamespace();
          x.replace(String(i), y);
          y.addInScopeNamespace(ns);
        }
      }
      if (primitiveAssign) {
        x.children[i].children = [];   // blow away kids of x[i]
        var s = toString(c);
        if (s !== "") {
          x.children[i].replace("0", s);
        }
      } else {
        x.replace(String(i), c);
      }
      return;
    };

    Xp.getMultinameProperty = getMultinameProperty;
    Xp.setMultinameProperty = setMultinameProperty;
    Xp.hasMultinameProperty = hasMultinameProperty;
    Xp.callMultinameProperty = callMultinameProperty;

    // 9.1.1.1 XML.[[Get]] (P)
    Xp.getProperty = function (mn, isMethod) {
      var val;
      if (isMethod) {
        var resolved = Multiname.isQName(mn) ? mn : resolveMultiname(this, mn);
        return this[Multiname.getQualifiedName(resolved)];
      }
      if (isNumeric(mn)) {
        // this is a shortcut to the E4X logic that wants us to create a new
        // XMLList with of size 1 and access it with the given index.
        if (Number(0) === 0) {
          return this;
        }
        return null;
      }
      var x = this;
      var name = toXMLName(mn);
      val = new XMLList(x, name);
      switch (nameKind(name.mn)) {
      case ANY_ATTR_NAME:
        var any = true;
        // fall through
      case ATTR_NAME:
        if (x.attributes) {
          x.attributes.forEach(function (v, i) {
            if ((any || (v.name.localName === name.localName)) &&
                ((name.uri === null || v.name.uri === name.uri))) {
              val.append(v);
            }
          });
        }
        break;
      case ANY_NAME:
        var any = true;
        // fall through
      default:
        x.children.forEach(function (v, i) {
          if ((any || v.kind === "element" && v.name.localName === name.localName) &&
              ((name.uri === null || v.kind === "element" && v.name.uri === name.uri))) {
            val.append(v);
          }
        });
        break;
      }
      return val;
    };

    Xp.hasProperty = function (mn, isMethod) {
      if (isMethod) {
        var resolved = Multiname.isQName(mn) ? mn : resolveMultiname(this, mn);
        return !!this[Multiname.getQualifiedName(resolved)];
      }
      if (isNumeric(mn)) {
        // this is a shortcut to the E4X logic that wants us to create a new
        // XMLList with of size 1 and access it with the given index.
        if (Number(0) === 0) {
          return true;
        }
        return false;
      }
      var name = toXMLName(mn);
      switch (nameKind(name.mn)) {
        case ANY_ATTR_NAME:
          var any = true;
        // fall through
        case ATTR_NAME:
          return this.attributes.some(function (v, i) {
            if ((any || (v.name.localName === name.localName)) &&
                ((name.uri === null || v.name.uri === name.uri))) {
              return true;
            }
          });
          break;
        case ANY_NAME:
          var any = true;
        // fall through
        default:
          return this.children.some(function (v, i) {
            if ((any || v.kind === "element" && v.name.localName === name.localName) &&
                ((name.uri === null || v.kind === "element" && v.name.uri === name.uri))) {
              return true;
            }
          });
      }
    };

    Xp.delete = function (key, isMethod) {
      debugger;
    };

    Xp.isXML = true;

    // 9.1.1.11 [[Insert]] (P, V)
    Xp.insert = function insert(p, v) {
      var x, s, i, n;
      x = this;
      if (x.kind === "text" ||
          x.kind === "comment" ||
          x.kind === "processing-instruction" ||
          x.kind === "attribute") {
        return;
      }
      i = p >>> 0;
      if (String(p) !== String(i)) {
        throw "TypeError in XML.prototype.insert(): invalid property name " + p;
      }
      if (x.kind === "element") {
        var a = x;
        while (a) {
          if (a === v) {
            throw "Error in XML.prototype.insert()";
          }
          a = a.parent;
        }
      }
      if (x.isXMLList) {
        n = x.length();
        if (n === 0) {
          return;
        }
      } else {
        n = 1;
      }
      for (var j = x.length() - 1; j >= i; j--) {
        x[j + n] = x[j];
      }
      if (x.isXMLList) {
        n = v.length();
        for (var j = 0; j < n; j++) {
          v.children[j].parent = x;
          x[i + j] = v[j];
        }
      } else {
        //x.replace(i, v);
        v.parent = x;
        x.children[i] = v;
      }
    };

    // 9.1.1.12 [[Replace]] (P, V)
    Xp.replace = function (p, v) {
      var x, s;
      x = this;
      if (x.kind === "text" ||
          x.kind === "comment" ||
          x.kind === "processing-instruction" ||
          x.kind === "attribute") {
        return;
      }
      var i = p >>> 0;
      if (String(p) !== String(i)) {
        throw "TypeError in XML.prototype.replace(): invalid name " + p;
      }
      if (i >= x.length()) {
        p = String(x.length());
      }
      if (v.kind === "element") {
        var a = x;
        while (a) {
          if (a === v) {
            throw "Error in XML.prototype.replace()";
          }
          a = a.parent;
        }
      }
      if (v.kind === "element" ||
          v.kind === "text" ||
          v.kind === "comment" ||
          v.kind === "processing-instruction") {
        v.parent = x;
        if (x[p]) {
          x.children[p].parent = null;
        }
        x.children[p] = v;
      } else if (x.isXMLList) {
        x.deleteByIndex(p);
        x.insert(p, v);
      } else {
        s = toString(v);
        t = new XML();
        t.parent = x;
        t.value = s;
        if (x[p]) {
          x.children[p].parent = null;
        }
        x.children[p] = t;
      }
    };

    // 9.1.1.13 [[AddInScopeNamespace]] ( N )
    Xp.addInScopeNamespace = function (ns) {
      var x, s;
      x = this;
      if (x.kind === "text" ||
          x.kind === "comment" ||
          x.kind === "processing-instruction" ||
          x.kind === "attribute") {
        return;
      }
      if (ns.prefix !== undefined) {
        if (ns.prefix === "" && x.name.uri === "") {
          return;
        }
        var match = null;
        x.inScopeNamespaces.forEach(function (v, i) {
          if (v.prefix === ns.prefix) {
            match = v;
          }
        });
        if (match !== null && match.uri !== ns.uri) {
          x.inScopeNamespaces.forEach(function (v, i) {
            if (v.prefix === match.prefix) {
              x.inScopeNamespaces[i] = ns;  // replace old with new
            }
          });
        }
        if (x.name.prefix === ns.prefix) {
          x.name.prefix = undefined;
        }
        x.attributes.forEach(function (v, i) {
          if (v.name.prefix === ns.name.prefix) {
            v.name.prefix = undefined;
          }
        });       
      }
    }

    // 9.1.1.8 [[Descendants]] (P)
    Xp.descendants = function (name) {
      name = toXMLName(name);
      var x = this;
      var xl = new XMLList();
      if (x.kind !== "element") {
        return xl;
      }
      if (name.isAttr) {
        // Get attributes
        this.attributes.forEach(function (v, i) {
          if (name.isAny || name.localName === v.name.localName) {
            xl.append(v);
          }
        });
      } else {
        // Get children
        this.children.forEach(function (v, i) {
          if (name.isAny || name.localName === v.name.localName) {
            xl.append(v);
          }
        });
      }
      // Descend
      this.children.forEach(function (v, i) {
        xl.append(v.descendants(name));
      });
      return xl;
    };

    Xp.comments = function () {
      var x = this;
      var xl = new XMLList(x, null);
      x.children.forEach(function (v, i) {
        if (v.kind === "comment") {
          xl.append(v);
        }
      });
      return xl;
    };

    Xp.text = function () {
      var x = this;
      var xl = new XMLList(x, null);
      x.children.forEach(function (v, i) {
        if (v.kind === "text") {
          xl.append(v);
        }
      });
      return xl;
    };

    c.native = {
      static: {
        ignoreComments: {
          get: function ignoreComments() {
            return getBitFlags(c.flags, FLAG_IGNORE_COMMENTS);
          },
          set: function ignoreComments(newIgnore) {
            c.flags = setBitFlags(c.flags, FLAG_IGNORE_COMMENTS, newIgnore);
          }
        },
        ignoreProcessingInstructions: {
          get: function ignoreProcessingInstructions() {
            return getBitFlags(c.flags, FLAG_IGNORE_PROCESSING_INSTRUCTIONS);
          },
          set: function ignoreProcessingInstructions(newIgnore) {
            c.flags = setBitFlags(c.flags, FLAG_IGNORE_PROCESSING_INSTRUCTIONS, newIgnore);
          }
        },
        ignoreWhitespace: {
          get: function ignoreWhitespace() {
            return getBitFlags(c.flags, FLAG_IGNORE_WHITESPACE);
          },
          set: function ignoreWhitespace(newIgnore) {
            c.flags = setBitFlags(c.flags, FLAG_IGNORE_WHITESPACE, newIgnore);
          }
        },
        prettyPrinting: {
          get: function prettyPrinting() {
            return getBitFlags(c.flags, FLAG_PRETTY_PRINTING);
          },
          set: function prettyPrinting(newPretty) {
            c.flags = setBitFlags(c.flags, FLAG_PRETTY_PRINTING, newPretty);
          }
        },
        prettyIndent: {
          get: function prettyIndent() {
            return c.prettyIndent;
          },
          set: function prettyIndent(newIndent) {
            c.prettyIndent = newIndent;
          }
        }
      },
      instance: {
        toString: function () { // (void) -> String
          return toString(this);
        },
        hasOwnProperty: function hasOwnProperty(P) { // (P) -> Boolean
          notImplemented("XML.hasOwnProperty");
        },
        propertyIsEnumerable: function propertyIsEnumerable(P) { // (P) -> Boolean
          notImplemented("XML.propertyIsEnumerable");
        },
        addNamespace: function addNamespace(ns) { // (ns) -> XML
          notImplemented("XML.addNamespace");
        },
        appendChild: function appendChild(child) { // (child) -> XML
          var children = this.getProperty("*");
          children.setProperty(children.length(), child);
          return this;
        },
        attribute: function attribute(name) { // (arg) -> XMLList
          return this.getProperty(toAttributeName(name));
        },
        attributes: function attributes() { // (void) -> XMLList
          return this.getProperty(toAttributeName("*"));
        },
        child: function child(name) { // (name) -> XMLList
          return this.getProperty(name);
        },
        childIndex: function childIndex() { // (void) -> int
          notImplemented("XML.childIndex");
        },
        children: function children() { // (void) -> XMLList
          var list = new XMLList();
          Array.prototype.push.apply(list.children, this.children);
          return list;
        },
        comments: function comments() { // (void) -> XMLList
          return this.comments();
        },
        contains: function contains(value) { // (value) -> Boolean
          notImplemented("XML.contains");
        },
        copy: function copy() { // (void) -> XML
          return this.deepCopy();
        },
        descendants: function descendants(name) { // (name = "*") -> XMLList
          if (name === undefined) {
            name = "*";
          }
          return this.descendants(name);
        },
        elements: function elements(name) { // (name = "*") -> XMLList
          var x = this;
          var any = false;
          if (name === undefined) {
            name = "*";
            any = true;
          }
          var name = toXMLName(name);
          var xl = new XMLList(this.parent, name);
          x.children.forEach(function (v, i) {
            if (v.kind === "element" &&
                (any || v.name.localName === name.localName) &&
                (name.uri === null || v.kind === "element" && v.name.uri === name.uri)) {
              xl.append(v);
            }
          });
          return xl;
        },
        hasComplexContent: function hasComplexContent() { // (void) -> Boolean
          notImplemented("XML.hasComplexContent");
        },
        hasSimpleContent: function hasSimpleContent() { // (void) -> Boolean
          return this.hasSimpleContent();
        },
        inScopeNamespaces: function inScopeNamespaces() { // (void) -> Array
          notImplemented("XML.inScopeNamespaces");
        },
        insertChildAfter: function insertChildAfter(child1, child2) { // (child1, child2) -> any
          notImplemented("XML.insertChildAfter");
        },
        insertChildBefore: function insertChildBefore(child1, child2) { // (child1, child2) -> any
          notImplemented("XML.insertChildBefore");
        },
        localName: function localName() { // (void) -> Object
          notImplemented("XML.localName");
        },
        name: function name() { // (void) -> Object
          return this.name;
        },
        _namespace: function _namespace(prefix, argc) { // (prefix, argc:int) -> any
          somewhatImplemented("XML._namespace()");
          return this.name.uri;
        },
        namespaceDeclarations: function namespaceDeclarations() { // (void) -> Array
          return new XMLList();  // FIXME needs implementation
        },
        nodeKind: function nodeKind() { // (void) -> String
          return this.kind;
        },
        normalize: function normalize() { // (void) -> XML
          notImplemented("XML.normalize");
        },
        parent: function parent() { // (void) -> any
          notImplemented("XML.parent");
        },
        processingInstructions: function processingInstructions(name) { // (name = "*") -> XMLList
          notImplemented("XML.processingInstructions");
        },
        prependChild: function prependChild(value) { // (value) -> XML
          notImplemented("XML.prependChild");
        },
        removeNamespace: function removeNamespace(ns) { // (ns) -> XML
          notImplemented("XML.removeNamespace");
        },
        replace: function replace(propertyName, value) { // (propertyName, value) -> XML
          notImplemented("XML.replace");
        },
        setChildren: function setChildren(value) { // (value) -> XML
          notImplemented("XML.setChildren");
        },
        setLocalName: function setLocalName(name) { // (name) -> void
          notImplemented("XML.setLocalName");
        },
        setName: function setName(name) { // (name) -> void
          notImplemented("XML.setName");
        },
        setNamespace: function setNamespace(ns) { // (ns) -> void
          notImplemented("XML.setNamespace");
        },
        text: function text() { // (void) -> XMLList
          return this.comments();
        },
        toXMLString: function () { // (void) -> String
          return toXMLString(this)
        },
        notification: function notification() { // (void) -> Function
          notImplemented("XML.notification");
        },
        setNotification: function setNotification(f) { // (f:Function) -> any
          notImplemented("XML.setNotification");
        },
      }
    };
    return c;
  }

  XMLListClass = function XMLListClass(runtime, scope, instanceConstructor, baseClass) {

    // Constructor used by ActionScript
    ASXMLList = function (value) {
      if (!(this instanceof ASXMLList)) {
        return callXMLList(value);
      }
      return constructXMLList(value);
    };

    // 13.5.1 The XMLList Constructor Called as a Function
    function callXMLList(v) {
      if (v === null || v === undefined) {
        v = "";
      }
      return toXMLList(v);
    }

    // 13.5.2 The XMLList Constructor
    function constructXMLList(val) {
      if (val === null || val === undefined) {
        val = "";
      }
      if (val.isXMLList) {
        var xl = new XMLList();
        xl.append(val);
        return xl;
      }
      return toXMLList(val);
    }

    // Internal constructor
    XMLList = function (targetObject, targetProperty) {
      this.targetObject = targetObject ? targetObject : null;
      this.targetProperty = targetProperty ? targetProperty : null;
      this.children = [];
    }

    var c = new Class("XMLList", ASXMLList, Domain.passthroughCallable(ASXMLList));
    c.extend(baseClass);

    var XLp = XMLList.prototype = ASXMLList.prototype;

    XLp.canHandleProperties = true;

    // 13.5.4.14 XMLList.prototype.hasSimpleContent()
    XLp.hasSimpleContent = function hasSimpleContent() {
      if (this.length() === 0) {
        return true;
      } else if (this.length() === 1) {
        return toXML(this).hasSimpleContent()
      }
      var result = true;
      this.children.forEach(function (v) {
        if (v.kind === "element") {
          result = false;
        }
      });
      return result;
    }

    XLp.getMultinameProperty = getMultinameProperty;
    XLp.setMultinameProperty = setMultinameProperty;
    XLp.hasMultinameProperty = hasMultinameProperty;
    XLp.callMultinameProperty = callMultinameProperty;

    XLp.setProperty = function (mn, v, isMethod) {
      var x, i, r;
      x = this;
      i = mn >>> 0;
      if (String(mn) === String(i)) {
        var targetObject = this.targetObject;
        var targetProperty = this.targetProperty;
        if (targetObject !== null) {
          r = targetObject.resolveValue();
          if (r === null) {
            return;
          }
        } else {
          r = null;
        }
        if (i >= x.length()) {
          if (r && r.isXMLList) {
            if (r.length !== 1) {
              return;
            } else {
              r = r.children[0];
            }
          }
          if (r && r.kind !== "element") {
            return;
          }
          var y = new XML();
          y.parent = r;
          y.name = x.targetProperty;
          if (targetProperty === null || targetProperty.localName === "*") {
            y.name = null;
            y.kind = "text";
          } else if (targetProperty.isAttr) {
            var attributeExists = r.getProperty(y.name);
            if (attributeExists.length() > 0) {
              return;
            }
            r.kind = "attribute";
          } else {
            y.kind = "element";
          }
          i = x.length();
          if (y.kind !== "attribute") {
            if (r !== null) {
              if (i > 0) {
                var j = 0;
                while (j < r.length() - 1 &&
                      r.children[j] !== x.children[i - 1]) {
                  j++;
                }
              } else {
                var j = r.length() - 1;
              }
              r.insert(String(j+1), y);
            }
            if (v.isXML) {
              y.name = v.name;
            } else if (v.isXMLList) {
              y.name = v.targetProperty;
            }
          }
          x.append(y);
        }
        if (!v.isXML && !v.isXMLList || v.kind === "text" || v.kind === "attribute") {
          v = toString(v);
        }
        if (x.children[i].kind === "attribute") {
          var z = toAttributeName(x.children[i].name);
          x.children[i].parent.setProperty(z, v);
          var attr = x.children[i].parent.getProperty(z);
          x.children[i] = attr.children[0];
        } else if (v.isXMLList) {
          var c = v.deepCopy();  // FIXME shallow copy
          var parent = x.children[i].parent;
          if (parent !== null) {
            var q;
            parent.children.some(function (v, p) {
              if (v == x.children[i]) {
                q = p;
                return true;
              }
            });
            parent.replace(q, c);
            c.children.forEach(function (v, j) {
              c.children[j] = parent.children[q >>> 0 + j]; 
            });
          }
          if (c.length() === 0) {
            for (var j = x + 1; j < x.length() - 1; j++) {
              x.children[String(j - 1)] = x.children[j];
            }
          } else {
            for (var j = x.length() - 1; j >= i + 1; j--) {
              x.children[String(j + c.length() - 1)] = x.children[j];
            }
          }
          // For j = 0 to c.[[Length]]-1, let x[i + j] = c[j]
          for (var j = 0; j < c.length(); j++) {
            x.children[i + j] = c.children[j];
          }
        } else if (v.isXML ||
                   (k = x.children[i].kind) === "text" ||
                   k === "comment" ||
                   k === "processing-instruction") {
          var parent = x.children[i].parent;
          if (parent !== null) {
            var q;
            parent.children.some(function (v, p) {
              if (v == x.children[i]) {
                q = p;
                return true;
              }
            });
            parent.replace(q, v);
            var v = parent.children[q];
          }
          if (typeof v === "string") {
            var t = new XML("text");
            t.parent = x;
            t.value = v;
            x.children[i] = t;
          } else {
            x.children[i] = v;
          }
        } else {
          x.children[i].setProperty("*", v);
        }
      } else if (x.length() <= 1) {
        if (x.length() === 0) {
          r = x.resolveValue();
          if (r === null || r.length() !== 1) {
            return;
          }
          x.append(r)
        }
        x.children[0].setProperty(p, v);
      }
    };

    XLp.getProperty = function (mn, isMethod) {
      if (isMethod) {
        var resolved = Multiname.isQName(mn) ? mn : resolveMultiname(this, mn);
        return this[Multiname.getQualifiedName(resolved)];
      }
      var x = this;
      var i = mn >>> 0;
      if (String(mn) === String(i)) {
        return x.children[mn];
      }
      var name = toXMLName(mn);
      var xl = new XMLList(this, name);
      this.children.forEach(function (v, i) {
        var xl2 = v.getProperty(mn);
        if (xl2.length() > 0) {
          xl.append(xl2);
        }
      });
      return xl;
    };

    XLp.hasProperty = function (mn, isMethod) {
      if (isMethod) {
        var resolved = Multiname.isQName(mn) ? mn : resolveMultiname(this, mn);
        return !!this[Multiname.getQualifiedName(resolved)];
      }
      var x = this;
      var i = mn >>> 0;
      if (String(mn) === String(i)) {
        return !!x.children[mn];
      }
      var name = toXMLName(mn);
      return this.children.some(function (v, i) {
        var xl2 = v.getProperty(mn);
        if (xl2.length() > 0) {
          return true;
        }
      });
    };

    XLp.delete = function (key, isMethod) {
      debugger;
    };

    XLp.append = function (val) {
      if (val.isXMLList) {
        this.targetObject = val.targetObject;
        this.targetProperty = val.targetProperty;
        if (val.length() === 0) {
          return;
        }
        for (var i = 0; i < val.length(); i++) {
          this.children.push(val.children[i]);
        }
      } else if (val.isXML) {
        this.children.push(val);
      }
    };

    // XMLList.[[Length]]
    XLp.length = function () {
      return this.children.length;
    };

    XLp.resolve = function () {
      var base = this.targetObject.resolveValue();
      if (base === null) {
        return null;
      }
      var target = this.targetObject.getProperty(this.targetProperty);
      if (base.length === 0) {
        notImplemented("XMLList.resolve");
        base.setProperty(this.targetProperty, "");
        target = base.getProperty(this.targetProperty);
        return target;
      }
    };

    // 9.2.1.7 [[DeepCopy]] ( )
    XLp.deepCopy = function () {
      var xl = new XMLList();
      this.children.forEach(function (v, i) {
        xl.children[i] = v.deepCopy();
      });
      return xl;
    };

    // 9.2.1.8 [[Descendants]] (P)
    XLp.descendants = function (name) {
      var xl = new XMLList(null);
      this.children.forEach(function (v, i) {
        if (v.kind === "element") {
          xl.append(v.descendants(name));
        }
      });
      return xl;
    };

    // 9.2.1.10 [[ResolveValue]] ( )
    XLp.resolveValue = function resolveValue () {
      if (this.length() > 0) {
        return this;
      }
      var x = this;
      var name = x.name;
      var targetObject = x.targetObject;
      var targetProperty = x.targetProperty;
      if (targetObject === null ||
          targetProperty === null ||
          name.isAttr ||
          name.isAny) {
        return null;
      }
      var base = targetObject.resolveValue();
      if (base === null) {
        return null;
      }
      var target = base.getProperty(targetProperty);
      if (target.length() === 0) {
        if (base.isXMLList && base.length() > 1) {
          return null;
        }
        base.setProperty(targetProperty, "");
        target = base.getProperty(targetProperty);
      }
      return target;
    }

    XLp.getEnumerationKeys = function getEnumerationKeys() {
      var keys = [];
      this.children.forEach(function (v, i) {
        keys.push(i);
      });
      return keys;
    };

    c.native = {
      instance: {
        init: function () {}
      }
    };



    XLp.isXMLList = true;

    c.native = {
      static: {
      },
      instance: {
        toString: function () { // (void) -> String
          return toString(this); //.bind(null, this);
        },
        hasOwnProperty: function hasOwnProperty(P) { // (P) -> Boolean
          notImplemented("XMLList.hasOwnProperty");
        },
        propertyIsEnumerable: function propertyIsEnumerable(P) { // (P) -> Boolean
          notImplemented("XMLList.propertyIsEnumerable");
        },
        attribute: function attribute(name) { // (arg) -> XMLList
          return this.getProperty(toAttributeName(name));
        },
        attributes: function attributes() { // (void) -> XMLList
          return this.getProperty(toAttributeName("*"));
        },
        child: function child(propertyName) { // (propertyName) -> XMLList
          notImplemented("XMLList.child");
        },
        children: function children() { // (void) -> XMLList
          var list = new XMLList();
          for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            Array.prototype.push.apply(list.children, child.children);
          }
          return list;
        },
        comments: function comments() { // (void) -> XMLList
          var x = this;
          var xl = new XMLList(x, null);
          x.children.forEach(function (v, i) {
            if (v.kind === "element") {
              xl.append(v.comments());
            }
          });
          return xl;
        },
        contains: function contains(value) { // (value) -> Boolean
          for (var i = 0; i < this.children.length; i++) {
            if (this.children[i] === value) {
              return true;
            }
          }
          return false;
        },
        copy: function copy() { // (void) -> XMLList
          return this.deepCopy();
        },
        descendants: function descendants(name) { // (name = "*") -> XMLList
          return this.descendants(name === undefined ? "*" : name);
        },
        elements: function elements(name) { // (name = "*") -> XMLList
          var x = this;
          var any = false;
          if (name === undefined) {
            name = "*";
            any = true;
          }
          var name = toXMLName(name);
          var xl = new XMLList(x, name);
          x.children.forEach(function (v, i) {
            if (v.kind === "element") {
              xl.append(v.comments());
            }
          });
          return xl;
        },
        hasComplexContent: function hasComplexContent() { // (void) -> Boolean
          notImplemented("XMLList.hasComplexContent");
        },
        hasSimpleContent: function hasSimpleContent() { // (void) -> Boolean
          return this.hasSimpleContent();
        },
        length: function length() { // (void) -> int
          return this.children.length;
        },
        name: function name() { // (void) -> Object
          return toXML(this).name;
        },
        normalize: function normalize() { // (void) -> XMLList
          notImplemented("XMLList.normalize");
        },
        parent: function parent() { // (void) -> any
          notImplemented("XMLList.parent");
        },
        processingInstructions: function processingInstructions(name) { // (name = "*") -> XMLList
          notImplemented("XMLList.processingInstructions");
        },
        text: function text() { // (void) -> XMLList
          var x = this;
          var xl = new XMLList(x, null);
          x.children.forEach(function (v, i) {
            if (v.kind === "element") {
              xl.append(v.text());
            }
          });
          return xl;
        },
        toXMLString: function () { // (void) -> String
          return toXMLString(this)
        },
        addNamespace: function addNamespace(ns) { // (ns) -> XML
          notImplemented("XMLList.addNamespace");
        },
        appendChild: function appendChild(child) { // (child) -> XML
          toXML(this).appendChild(child);
          return this;
        },
        childIndex: function childIndex() { // (void) -> int
          notImplemented("XMLList.childIndex");
        },
        inScopeNamespaces: function inScopeNamespaces() { // (void) -> Array
          notImplemented("XMLList.inScopeNamespaces");
        },
        insertChildAfter: function insertChildAfter(child1, child2) { // (child1, child2) -> any
          notImplemented("XMLList.insertChildAfter");
        },
        insertChildBefore: function insertChildBefore(child1, child2) { // (child1, child2) -> any
          notImplemented("XMLList.insertChildBefore");
        },
        nodeKind: function nodeKind() { // (void) -> String
          return toXML(this).kind;
        },
        _namespace: function _namespace(prefix, argc) { // (prefix, argc:int) -> any
          notImplemented("XMLList._namespace");
        },
        localName: function localName() { // (void) -> Object
          notImplemented("XMLList.localName");
        },
        namespaceDeclarations: function namespaceDeclarations() { // (void) -> Array
          somewhatImplemented("XMLList.prototype.namespaceDeclarations()");
          return new XMLList();
        },
        prependChild: function prependChild(value) { // (value) -> XML
          notImplemented("XMLList.prependChild");
        },
        removeNamespace: function removeNamespace(ns) { // (ns) -> XML
          notImplemented("XMLList.removeNamespace");
        },
        replace: function replace(propertyName, value) { // (propertyName, value) -> XML
          notImplemented("XMLList.replace");
        },
        setChildren: function setChildren(value) { // (value) -> XML
          notImplemented("XMLList.setChildren");
        },
        setLocalName: function setLocalName(name) { // (name) -> void
          notImplemented("XMLList.setLocalName");
        },
        setName: function setName(name) { // (name) -> void
          notImplemented("XMLList.setName");
        },
        setNamespace: function setNamespace(ns) { // (ns) -> void
          notImplemented("XMLList.setNamespace");
        }
      }
    };
    return c;
  }

  QNameClass = function QNameClass(runtime, scope, instanceConstructor, baseClass) {
    // Construct a QName from a ns and name. If name is a multiname with
    // multiple namespaces then it is an unqualified name and we need to
    // construct a new multiname with the default namespace. if it is a
    // multiname with one namespace, then it is a qualified name and we
    // use it as is. in all other cases we construct a new multiname from
    // the given namespace and name.
    QName = function QName(ns, name, isAttr) {
      // handle coerce case
      if (!(this instanceof QName)) {
        if (name === undefined && (ns instanceof QName)) {
          return ns;
        } else {
          return new QName(ns, name);
        }
      }
      // if only one arg, then its the name
      if (name === undefined) {
        name = ns;
        ns = undefined;
      }
      if (typeof ns === "string" || (ns instanceof QName)) {
        ns = new ASNamespace(ns);
      }
      // construct the multiname for this qname
      var mn;
      if (name instanceof QName) {
        if (ns === undefined) {
          // reuse the original multiname
          mn = name.mn;
        } else {
          mn = new Multiname([ns], name.mn.getName());
        }
      } else if (name instanceof Multiname) {
        if (ns === undefined) {
          if (name.isQName() || name.isAnyName()) {
            mn = name;
          } else {
            mn = new Multiname([getDefaultNamespace(scope)], name.getName(), name.flags);
          }
        } else {
          mn = new Multiname([ns], name.getName(), name.flags);
        }
      } else if (name === "*") {
        // Any name has a null name and is not a runtime name
        mn = new Multiname([ns], null, isAttr ? Multiname.ATTRIBUTE : 0);
      } else if (name === "@*") {
        // Any name has a null name and is not a runtime name
        mn = new Multiname([ns], null, Multiname.ATTRIBUTE);
      } else {
        ns = ns === undefined ? getDefaultNamespace(scope) : ns;
        if (name === undefined) {
          mn = new Multiname([ns], "");
        } else {
          mn = new Multiname([ns], toString(name), isAttr ? Multiname.ATTRIBUTE : 0);
        }
      }
      this.mn = mn;
      this.isAny = mn.isAnyName();
      this.isAttr = mn.isAttribute();
    }

    var c = new Class("QName", QName, Domain.passthroughCallable(QName));
    c.extend(baseClass);
    QNp = QName.prototype;
    defineNonEnumerableGetter(QNp, "localName", function () {
      if (!this._localName) {
        this._localName = this.isAny ? "*" : this.mn.getName();
      }
      return this._localName;
    });
    defineNonEnumerableGetter(QNp, "uri", function () {
      if (this._uri === undefined) {
        var ns = this.mn.namespaces[0]
        this._uri = ns && ns.originalURI ? ns.originalURI : "";
      }
      return this._uri;
    });
    defineNonEnumerableGetter(QNp, "prefix", function () {
      return this.mn.namespaces[0].prefix;
    });
    defineNonEnumerableSetter(QNp, "prefix", function (prefix) {
      this.mn.namespaces[0].prefix = prefix;
    });

    // 13.3.5.4 [[GetNamespace]]([InScopeNamespaces])
    QNp.getNamespace = function (isns) {
      if (this.uri === null) {
        throw "TypeError in QName.prototype.getNamespace()";
      }
      if (!isns) {
        isns = [];
      }
      var ns;
      for (var i = 0; i < isns.length; i++) {
        if (this.uri === isns[i].uri) {
          ns = isns[i];
        }
      }
      if (!ns) {
        ns = ShumwayNamespace.createNamespace(this.uri);  // FIXME what about the prefix
      }
      return ns;
    };

    c.native = {
      static: {
      },
      instance: {
        localName: {
          get: function localName() { // (void) -> String
            return this.localName;
          }
        },
        uri: {
          get: function uri() { // (void) -> any
            return this.uri;
          }
        }
      }
    };
    return c;
  };
})();
