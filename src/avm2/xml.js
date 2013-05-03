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

(function () {
  function XMLEncoder(ancestorNamespaces, indentLevel, prettyPrinting) {
    var indent = "\n  ";
    function visit(node, encode) {
      if (node.isXML) {
        switch (node._kind) {
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
          var ns = n._name.mn.namespaces[0];
          var prefix = ns.prefix ? (ns.prefix + ":") : "";
          s = "<" + prefix + n._name.localName;
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
          for (var i = 0; i < n._inScopeNamespaces.length; i++) {
            if (true) { // FIXME add check for ancestor
              somewhatImplemented("xml.js Encoder.encode() inscope namespaces");
              ns = n._inScopeNamespaces[i];
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
          for (var i = 0; i < n._attributes.length; i++) {
            a = n._attributes[i];
            var ns = n._name.uri;
            var prefix = n.prefix ? (ns.prefix + ":") : "";
            var name = prefix + a._name.localName;
            s += " " + name + "=\"" + a._value + "\"";
          }
          if (n._.length) {
            s += ">";
            for (var i = 0; i < n._.length; i++) {
              s += visit(n._[i], this);
            }
            s += "</" + prefix + n._name.mn.name + ">";
          } else {
            s += "/>";
          }
          return s;
        },
        text: function(text) {
          return text._value.
            replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        },
        attribute: function(n) {
          return escapeAttributeValue(n._value);
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
          for (var i = 0; i < n._.length; i++) {
            if (i > 0) {
              s += "\n";
            }
            s += toXMLString(n._[i], []/*ancestor namespaces*/);
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

  function XMLParser() {
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
            attr._value = attrs[i].value;
            currentElement._attributes.push(attr);
          }
          var namespaces = scope.namespaces;
          for (var i = 0; i < namespaces.length; ++i) {
            var ns = ShumwayNamespace.createNamespace(namespaces[i].uri, namespaces[i].prefix);
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
          var node = createNode("text", "", "");
          node._value = text;
          // isWhitespace?
          currentElement.insert(currentElement.length(), node);
        },
        cdata: function(text) {
          var node = createNode("text", "", "");
          node._value = text;
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
      switch (node._kind) {
      case "text":
      case "attribute":
        return node._value;
      default:
        if (node.hasSimpleContent()) {
          var str = "";
          node._.forEach(function (v, i) {
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
        return v._[0];
      }
      throw new TypeError(formatErrorMessage(Errors.XMLMarkupMustBeWellFormed));
    } else {
      var x = xmlParser.parseFromString(String(v));
      if (x.length() === 0) {
        var x = new XML("text");
        return x;
      }
      x._[0]._parent = null;
      return x._[0];
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
      var xl = new XMLList(value._parent, value._name);
      xl.append(value);
      return xl;
    } else if (value instanceof XMLList) {
      return value;
    } else {
      var s = "<parent xmlns='" + defaultNamespace + "'>" + String(value) + "</parent>";
      var x = new ASXML(s);
      var xl = new XMLList();
      for (var i = 0; i < x.length(); i++) {
        var v = x._[i];
        v._parent = null;
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
      if (v.IS_QNAME) {
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
      if (obj._defaultNamespace) {
        return obj._defaultNamespace;
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



  /**
   * XML.as
   *

   XML Node object structure

   Node {
     _kind: ["element", "attribute", "text", "comment", "processing-instruction"]
     _parent: [XML, null],
     _inScopeNamespaces: [],
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
     _kind: "element",
     _name: QName,
     _: [],             // children
     _attributes: [],   // attributes
   }

   Attribute : Node {
     _kind: "attribute",
     _name: QName,
     _value: string,
     _parent: XML,
   }

   Text : Node {
     _kind: "text",
     _value: string,
   }

   ProcessingInstruction : Node {
     _kind: "processing-instruction",
     _name: QName,
     _value: string,
   }

   Comment : Node {
     _kind: "comment",
     _value: string,
   }

   *
   *
   */

  XMLClass = function XMLClass(runtime, scope, instance, baseClass) {
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

    var c = new runtime.domain.system.Class("XML", ASXML, Domain.passthroughCallable(ASXML));
    c._flags = FLAG_IGNORE_COMMENTS |
      FLAG_IGNORE_PROCESSING_INSTRUCTIONS |
      FLAG_IGNORE_WHITESPACE |
      FLAG_PRETTY_PRINTING;

    c._prettyIndent = 2;
    c.extend(baseClass);

    var Xp = XML.prototype = ASXML.prototype;

    // Initialize an XML node.
    Xp.init = function init(kind, uri, name, prefix) {
      this._name = new QName(new Multiname([new ASNamespace(prefix, uri)], name));
      this._kind = kind;    // E4X [[Class]]
      this._parent = null;
      this._inScopeNamespaces = [];
      switch (kind) {
      case "element":
        this._attributes = [];
        this._ = [];  // child nodes go here
        break;
      case "attribute":
      case "text":
        this._value = "";
        break;
      default:
        break;
      }
      return this;
    }

    // XML.[[Length]]
    Xp.length = function () {
      if (!this._) {
        return 0;
      }
      return this._.length;
    };

    Xp.canHandleProperties = true;


    // 9.1.1.7 [[DeepCopy]] ( )
    Xp.deepCopy = function () {
      // WARNING lots of cases not handled by both toXMLString() and XML()
      return new ASXML(toXMLString(this));
    };

    // 13.4.4.16 XML.prototype.hasSimpleContent()
    Xp.hasSimpleContent = function hasSimpleContent() {
      if (this._kind === "comment" || this._kind === "processing-instruction") {
        return false;
      }
      var result = true;
      if (this._) {
        this._.forEach(function (v) {
          if (v._kind === "element") {
            result = false;
          }
        });
      }
      return result;
    }

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

    Xp.setProperty = function (p, v, isMethod) {
      var x, i, c, n;
      if (isMethod) {
        return;
      }
      x = this;
      if (p === p >>> 0) {
        throw "TypeError in XML.prototype.setProperty(): invalid property name " + p;
      }
      if (x._kind === "text" ||
          x._kind === "comment" ||
          x._kind === "processing-instruction" ||
          x._kind === "attribute") {
        return;
      }
      if (!v || !v.isXML && !v.isXMLList || v._kind === "text" || v._kind === "attribute") {
        c = toString(v);
      } else {
        c = v.deepCopy();
      }
      n = toXMLName(p);
      if (nameKind(n.mn) === ATTR_NAME) {
        if (!this._attributes) {
          return;
        }
        this._attributes.forEach(function (v, i, o) {
          if (v._name === n.localName) {
            delete o[i];
          }
        });
        var a = new XML("attribute", n.uri, n.localName);
        a._value = v;
        a._parent = this;
        this._attributes.push(a);
        return;
      }
      var isValidName = isXMLName(n)
      if (!isValidName && n.localName !== "*") {
          return; // We're done
      }
      var i = undefined;
      var primitiveAssign = !isXMLType(c) && n.localName !== "*";
      for (var k = x.length() - 1; k >= 0; k--) {
        // FIXME remove all but the last matching child
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
          y._parent = x;
          var ns = name.getNamespace();
          x.replace(String(i), y);
          y.addInScopeNamespace(ns);
        }
      }
      if (primitiveAssign) {
        x._[i]._ = [];   // blow away kids of x[i]
        var s = toString(c);
        if (s !== "") {
          x._[i].replace("0", s);
        } 
      } else {
        x.replace(String(i), c);
      }
      return;
    };

    // 9.1.1.1 XML.[[Get]] (P)
    Xp.getProperty = function (mn, isMethod) {
      var val;
      if (isMethod) {
        var resolved = Multiname.isQName(mn) ? mn : resolveMultiname(this, mn);
        val = this[Multiname.getQualifiedName(resolved)];
      } else {
        if (isNumeric(mn)) {
          // this is a shortcut to the E4X logic that wants us to create a new
          // XMLList with of size 1 and access it with the given index.
          if (Number(0) === 0) {
            return this;
          }
          return null;
        }
        var name = toXMLName(mn);
        val = new XMLList(this._parent, name);
        switch (nameKind(name.mn)) {
        case ANY_ATTR_NAME:
          var any = true;
          // fall through
        case ATTR_NAME:
          this._attributes.forEach(function (v, i) {
            if ((any || (v._name.localName === name.localName)) &&
                ((name.uri === null || v._name.uri === name.uri))) {
              val.append(v);
            }
          });
          break;
        case ANY_NAME:
          var any = true;
          // fall through
        default:
          this._.forEach(function (v, i) {
            if ((any || v._kind === "element" && v._name.localName === name.localName) &&
                ((name.uri === null || v._kind === "element" && v._name.uri === name.uri))) {
              val.append(v);
            }
          });
          break;
        }
      }
      return val;
    };

    Xp.delete = function (key, isMethod) {
      debugger;
    };

    Xp.isXML = true;

    // 9.1.1.11 [[Insert]] (P, V)
    Xp.insert = function insert(p, v) {
      var x, s, i, n;
      x = this;
      if (x._kind === "text" ||
          x._kind === "comment" ||
          x._kind === "processing-instruction" ||
          x._kind === "attribute") {
        return;
      }
      i = p >>> 0;
      if (String(p) !== String(i)) {
        throw "TypeError in XML.prototype.insert(): invalid property name " + p;
      }
      if (x._kind === "element") {
        var a = v;
        while (a) {
          if (a === this) {
            throw "Error in XML.prototype.insert()";
          }
          a = a._parent;
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
          v._[j]._parent = x;
          x[i + j] = v[j];
        }
      } else {
        //x.replace(i, v);
        v._parent = x;
        x._[i] = v;
      }
    };

    // 9.1.1.12 [[Replace]] (P, V)
    Xp.replace = function (p, v) {
      var x, s;
      x = this;
      if (x._kind === "text" ||
          x._kind === "comment" ||
          x._kind === "processing-instruction" ||
          x._kind === "attribute") {
        return;
      }
      var i = p >>> 0;
      if (String(p) !== String(i)) {
        throw "TypeError in XML.prototype.replace(): invalid name " + p;
      }
      if (i >= x.length()) {
        p = String(x.length());
      }
      if (v._kind === "element") {
        var a = x;
        while (a) {
          if (a === v) {
            throw "Error in XML.prototype.replace()";
          }
          a = a._parent;
        }
      }
      if (v._kind === "element" ||
          v._kind === "text" ||
          v._kind === "comment" ||
          v._kind === "processing-instruction") {
        v._parent = x;
        if (x[p]) {
          x._[p]._parent = null;
        }
        x._[p] = v;
      } else if (x.isXMLList) {
        x.deleteByIndex(p);
        x.insert(p, v);
      } else {
        s = toString(v);
        t = new XML();
        t._parent = x;
        t._value = s;
        if (x[p]) {
          x._[p]._parent = null;
        }
        x._[p] = t;
      }
      return;
    };

    // 9.1.1.13 [[AddInScopeNamespace]] ( N )
    Xp.addInScopeNamespace = function (ns) {
      var x, s;
      x = this;
      if (x._kind === "text" ||
          x._kind === "comment" ||
          x._kind === "processing-instruction" ||
          x._kind === "attribute") {
        return;
      }
      if (ns.prefix !== undefined) {
        if (ns.prefix === "" && x._name.uri === "") {
          return;
        }
        var match = null;
        x._inScopeNamespaces.forEach(function (v, i) {
          if (v.prefix === ns.prefix) {
            match = v;
          }
        });
        if (match !== null && match.uri !== ns.uri) {
          x._inScopeNamespaces.forEach(function (v, i) {
            if (v.prefix === match.prefix) {
              x._inScopeNamespaces[i] = ns;  // replace old with new
            }
          });
        }
        if (x._name.prefix === ns.prefix) {
          x._name.prefix = undefined;
        }
        x._attributes.forEach(function (v, i) {
          if (v._name.prefix === ns._name.prefix) {
            v._name.prefix = undefined;
          }
        });       
      }
      return;
    }

    // 9.1.1.8 [[Descendants]] (P)
    Xp.descendants = function (name) {
      name = toXMLName(name);
      var x = this;
      var xl = new XMLList();
      if (x._kind !== "element") {
        return xl;
      }
      if (name.IS_ATTR) {
        // Get attributes
        this._attributes.forEach(function (v, i) {
          if (name.IS_ANY || name.localName === v.name.localName) {
            xl.append(v);
          }
        });
      } else {
        // Get children
        this._.forEach(function (v, i) {
          if (name.IS_ANY || name.localName === v._name.localName) {
            xl.append(v);
          }
        });
      }
      // Descend
      this._.forEach(function (v, i) {
        xl.append(v.descendants(name));
      });
      return xl;
    };

    Xp.comments = function () {
      var x = this;
      var xl = new XMLList(x, null);
      x._.forEach(function (v, i) {
        if (v._kind === "comment") {
          xl.append(v);
        }
      });
      return xl;
    };

    Xp.text = function () {
      var x = this;
      var xl = new XMLList(x, null);
      x._.forEach(function (v, i) {
        if (v._kind === "text") {
          xl.append(v);
        }
      });
      return xl;
    };

    c.native = {
      static: {
        ignoreComments: {
          get: function ignoreComments() {
            return getBitFlags(c._flags, FLAG_IGNORE_COMMENTS);
          },
          set: function ignoreComments(newIgnore) {
            c._flags = setBitFlags(c._flags, FLAG_IGNORE_COMMENTS, newIgnore);
          }
        },
        ignoreProcessingInstructions: {
          get: function ignoreProcessingInstructions() {
            return getBitFlags(c._flags, FLAG_IGNORE_PROCESSING_INSTRUCTIONS);
          },
          set: function ignoreProcessingInstructions(newIgnore) {
            c._flags = setBitFlags(c._flags, FLAG_IGNORE_PROCESSING_INSTRUCTIONS, newIgnore);
          }
        },
        ignoreWhitespace: {
          get: function ignoreWhitespace() {
            return getBitFlags(c._flags, FLAG_IGNORE_WHITESPACE);
          },
          set: function ignoreWhitespace(newIgnore) {
            c._flags = setBitFlags(c._flags, FLAG_IGNORE_WHITESPACE, newIgnore);
          }
        },
        prettyPrinting: {
          get: function prettyPrinting() {
            return getBitFlags(c._flags, FLAG_PRETTY_PRINTING);
          },
          set: function prettyPrinting(newPretty) {
            c._flags = setBitFlags(c._flags, FLAG_PRETTY_PRINTING, newPretty);
          }
        },
        prettyIndent: {
          get: function prettyIndent() {
            return c._prettyIndent;
          },
          set: function prettyIndent(newIndent) {
            c._prettyIndent = newIndent;
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
          return this;
        },
        attribute: function attribute(name) { // (arg) -> XMLList
          return this.getProperty(toAttributeName(name));
        },
        attributes: function attributes() { // (void) -> XMLList
          return this.getProperty(toAttributeName("*"));
        },
        child: function child(propertyName) { // (propertyName) -> XMLList
          notImplemented("XML.child");
        },
        childIndex: function childIndex() { // (void) -> int
          notImplemented("XML.childIndex");
        },
        children: function children() { // (void) -> XMLList
          var list = new XMLList();
          Array.prototype.push.apply(list._, this._);
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
          var xl = new XMLList(this._parent, name);
          x._.forEach(function (v, i) {
            if (v._kind === "element" &&
                (any || v._name.localName === name.localName) &&
                (name.uri === null || v._kind === "element" && v._name.uri === name.uri)) {
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
          return this._name;
        },
        _namespace: function _namespace(prefix, argc) { // (prefix, argc:int) -> any
          notImplemented("XML._namespace");
        },
        namespaceDeclarations: function namespaceDeclarations() { // (void) -> Array
          return new XMLList();  // FIXME needs implementation
        },
        nodeKind: function nodeKind() { // (void) -> String
          return this._kind;
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

  XMLListClass = function XMLListClass(runtime, scope, instance, baseClass) {

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
      this._targetObject = targetObject ? targetObject : null;
      this._targetProperty = targetProperty ? targetProperty : null;
      this._ = [];
    }

    var c = new runtime.domain.system.Class("XMLList", ASXMLList, Domain.passthroughCallable(ASXMLList));
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
      this._.forEach(function (v) {
        if (v._kind === "element") {
          result = false;
        }
      });
      return result;
    }

    XLp.setProperty = function (mn, v, isMethod) {
      var x, i, r;
      if (isMethod) {
        return;
      }
      return;   // until this function is properly implemented
      x = this;
      i = mn >>> 0;
      if (String(mn) === String(i)) {
        if (this._targetObject !== null) {
          r = this._targetObject.resolveValue();
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
              r = r[0];
            }
          }
          if (r && r._kind !== "element") {
            return;
          }
          var y = new XML();
          y._parent = r;
          y._name = this._targetProp;
          if (x._targetProperty.IS_ATTR) {
            // FIXME implement
          } else if (x._targetProperty === null || x._targetProperty.localName === "*") {
            y._name = null;
            y._kind = "text";
          } else {
            y._kind = "element";
          }
          i = x.length();
          if (y._kind !== "attribute") {
            // FIXME implement
          }
          x.append(y);
        }
        if (!v.isXML && !v.isXMLList || v._kind === "text" || v._kind === "attribute") {
          v = toString(v);
        }
        if (x._[i]._kind === "attribute") {
          // FIXME implement
        } else if (v.isXMLList) {
          // FIXME implement
        } else if (v.isXML || (k = x._[i]._kind) === "text" ||
                   k === "comment" || k === "processing-instruction") {
          // FIXME implement
        } else {
          x._[i].setProperty("*", v);
        }        
      } else if (x.length() <= 1) {
        if (x.length() === 0) {
          r = x.resolveValue();
          if (r === null || r.length() !== 1) {
            return;
          }
          x.append(r)
        }
        x._[0].setProperty(p, v);
      }
      return;
    };

    XLp.getProperty = function (mn, isMethod) {
      if (isMethod) {
        var resolved = Multiname.isQName(mn) ? mn : resolveMultiname(this, mn);
        return this[Multiname.getQualifiedName(resolved)];
      }
      var x = this;
      var i = mn >>> 0;
      if (String(mn) === String(i)) {
        return x._[mn];
      }
      var name = toXMLName(mn);
      var xl = new XMLList(this, name);
      this._.forEach(function (v, i) {
        var xl2 = v.getProperty(mn);
        if (xl2.length() > 0) {
          xl.append(xl2);
        }
      });
      return xl;
    };

    XLp.delete = function (key, isMethod) {
      debugger;
    };

    XLp.append = function (val) {
      if (val.isXMLList) {
        this._targetObject = val._targetObject;
        this._targetProperty = val._targetProperty;
        if (val.length() === 0) {
          return;
        }
        for (var i = 0; i < val.length(); i++) {
          this._.push(val._[i]);
        }
      } else if (val.isXML) {
        this._.push(val);
      }
      return;
    };

    // XMLList.[[Length]]
    XLp.length = function () {
      return this._.length;
    };

    XLp.resolve = function () {
      var base = this._targetObject._resolve();
      if (base === null) {
        return null;
      }
      var target = this._targetObject.getProperty(_targetProp);
      if (base.length === 0) {
        notImplemented("XMLList.resolve");
        base.setProperty(_targetProperty, "");
        target = base.getProperty(_targetProperty);
        return target;
      }
    };

    // 9.2.1.7 [[DeepCopy]] ( )
    XLp.deepCopy = function () {
      var xl = new XMLList();
      this._.forEach(function (v, i) {
        xl._[i] = v.deepCopy();
      });
      return xl;
    };

    // 9.2.1.8 [[Descendants]] (P)
    XLp.descendants = function (name) {
      var xl = new XMLList(null);
      this._.forEach(function (v, i) {
        if (v._kind === "element") {
          xl.append(v.descendants(name));
        }
      });
      return xl;
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
          Array.prototype.push.apply(list._, this._);
          return list;
        },
        comments: function comments() { // (void) -> XMLList
          var x = this;
          var xl = new XMLList(x, null);
          x._.forEach(function (v, i) {
            if (v._kind === "element") {
              xl.append(v.comments());
            }
          });
          return xl;
        },
        contains: function contains(value) { // (value) -> Boolean
          for (var i = 0; i < this._.length; i++) {
            if (this._[i] === value) {
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
          x._.forEach(function (v, i) {
            if (v._kind === "element") {
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
          return this._.length;
        },
        name: function name() { // (void) -> Object
          return toXML(this)._name;
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
          x._.forEach(function (v, i) {
            if (v._kind === "element") {
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
          notImplemented("XMLList.appendChild");
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
          return toXML(this)._kind;
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

  QNameClass = function QNameClass(runtime, scope, instance, baseClass) {
    // Construct a QName from a ns and name. If name is a multiname with
    // multiple namespaces then it is an unqualified name and we need to
    // construct a new multiname with the default namespace. if it is a
    // multiname with one namespace, then it is a qualified name and we
    // use it as is. in all other cases we construct a new multiname from
    // the given namespace and name.
    QName = function QName(ns, name, isAttr) {
      // handle coerce case
      if (!(this instanceof QName)) {
        if (name === undefined && ns.IS_QNAME) {
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
      if (typeof ns === "string" || ns && ns.IS_QNAME) {
        ns = new ASNamespace(ns);
      }
      // construct the multiname for this qname
      var mn;
      if (name && name.IS_QNAME) {
        if (ns === undefined) {
          // reuse the original multiname
          mn = name.mn;
        } else {
          mn = new Multiname([ns], name.mn.getName());
        }
      } else if (name && name instanceof Multiname) {
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
      this.IS_ANY = mn.isAnyName();
      this.IS_ATTR = mn.isAttribute();
    }

    var c = new runtime.domain.system.Class("QName", QName, Domain.passthroughCallable(QName));
    c.extend(baseClass);
    QNp = QName.prototype;
    defineNonEnumerableGetter(QNp, "localName", function () {
      if (!this._localName) {
        this._localName = this.mn.getName();
      }
      return this._localName;
    });
    defineNonEnumerableGetter(QNp, "uri", function () {
      if (this._uri === undefined) {
        var ns = this.mn.namespaces[0]
        this._uri = ns ? ns.originalURI : null;
      }
      return this._uri;
    });
    defineNonEnumerableGetter(QNp, "prefix", function () {
      return this.mn.namespaces[0].prefix;
    });
    defineNonEnumerableSetter(QNp, "prefix", function (prefix) {
      this.mn.namespaces[0].prefix = prefix;
    });
    QNp.IS_QNAME = true;

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
