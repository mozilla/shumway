/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 4 -*- */
// The XML parser is designed only for parsing of simple XML documents (for unit testing purpose).

var XMLClass;
var XMLListClass;
var QNameClass;
var isXMLType;
var XML;
var XMLList;
var XMLBlank;
var XMLListBlank;

(function () {
  function XMLEncoder(pretty) {
    var indent = "\n  ";
    function visit(node, encode) {
      if (node._IS_XML) {
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
      } else if (node._IS_XMLLIST) {
        return encode.list(node);
      } else {
        throw "Not implemented";
      }
    }
    function encode(node, encoder) {
      return visit(node, {
        element: function (n) {
          var s = "<" + n._name;
          for (var i = 0; i < node._attributes.length; i++) {
            a = node._attributes[i];
            s += " " + a._name + "=" + a._value;
          }
          s += ">";
          for (var i = 0; i < node._.length; i++) {
            s += visit(node._[i], this);
          }
          s += "</" + n._name + ">";
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
    // parser
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
        throw "Unknow namespace: " + prefix;
      }
      function getName(name, resolveDefaultNs) {
        var j = name.indexOf(":");
        if (j >= 0) {
          return {name:name.substring(j + 1), prefix: name.substring(0,j), namespace: lookupNs(name.substring(0,j))};
        } else if(resolveDefaultNs) {
          return {name:name, prefix: "", namespace: lookupDefaultNs()};
        } else {
          return {name:name, prefix: "", namespace: ""};
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
                scope.namespaces[content.attributes[q].name.substring(6)] = trim(content.attributes[q].value);
              } else if (content.attributes[q].name === "xmlns") {
                scope["xmlns"] = trim(content.attributes[q].value);
              } else if (content.attributes[q].name.substring(0, 4) === "xml:") {
                scope[content.attributes[q].name.substring(4)] = trim(content.attributes[q].value);
              } else if (content.attributes[q].name.substring(0, 3) === "xml") {
                throw "Invalid xml attribute";
              } else {
                // handle ordinary attributes
              }
            }
            scopes.push(scope);
            var attributes = [];
            for (q = 0; q < content.attributes.length; ++q) {
              attributes.push({name: getName(content.attributes[q].name, false), value: content.attributes[q].value});
            }
            sink.beginElement(getName(content.name, true), attributes, isClosed);
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
      // this is a raw XML object
      var currentElement = new XMLBlank("element");  // placeholder
      var elementsStack = [];
      parseXml(s, {
        beginElement: function(name, attrs, isEmpty) {
          var parent = currentElement;
          elementsStack.push(parent);
          currentElement = createNode("element", name.namespace, name.name);
          for (var i = 0; i < attrs.length; ++i) {
            var attr = createNode("attribute", attrs[i].name.namespace, attrs[i].name.name);
            attr._value = attrs[i].value;
            currentElement._attributes.push(attr);
          }
          parent.insert(currentElement);
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
          currentElement.insert(node);
        },
        cdata: function(text) {
          var node = createNode("text", "", "");
          node._value = text;
          currentElement.insert(node);
        },
        comment: function(text) { },
        pi: function(name, attrs) { },
        doctype: function(text) { }
      });
      return currentElement._[0];
    };

    function createNode(kind, uri, name) {
      return new XMLBlank().init(kind, uri, name);
    }
  }

  // 10.1 ToString
  function toString(node) {
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
  }

  // 10.2 ToXMLString
  function toXMLString(node, ancestorNamespaces, indentLevel) {
    return new XMLEncoder(true).encode(node)
  }


  // 10.3 ToXML
  function toXML(v) {
    if (v === null) {
      throw new TypeError(formatErrorMessage(Errors.ConvertNullToObjectError));
    } else if (v === undefined) {
      throw new TypeError(formatErrorMessage(Errors.ConvertUndefinedToObjectError));
    } else if (v._IS_XML) {
      return v;
    } else if (v._IS_XMLLIST) {
      if (v.length() === 1) {
        return v._[0];
      }
      throw new TypeError(formatErrorMessage(Errors.XMLMarkupMustBeWellFormed));
    } else {
      var x = xmlParser.parseFromString(String(v));
      if (x.length() === 0) {
        var x = new XMLBlank("text");
        return x;
      }
      return toXML(x);
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
      var xl = new XMLListBlank();
      xl.append(value);
      xl._targetObject = value._parent;
      xl._targetProperty = value._name;
      return xl;
    } else if (value instanceof XMLList) {
      return value;
    } else {
      var s = "<parent xmlns='" + defaultNamespace + "'>" + String(value) + "</parent>";
      var x = new XML(s);
      var xl = new XMLListBlank();
      for (var i = 0; i < x.length(); i++) {
        var v = x._[i];
        v._parent = null;
        xl.append(v);
      }
      xl._targetObject = null;
      return xl;
    }
  }

  // 10.5 ToAttributeName
  function toAttributeName() {
    notImplemented("toAttributeName");
  }

  // 10.6 ToXMLName
  function toXMLName(mn) {
    return mn; // FIXME for now let's just use the multiname
  }

  var xmlParser = new XMLParser();

  isXMLType = function isXMLType(val) {
    return val._IS_XML || val._IS_XMLLIST;
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

   Element : Node {
     _kind: "element",
     _name: { localName: string, uri: string },
     _: [],             // children
     _attributes: [],   // attributes
   }

   Attribute : Node {
     _kind: "attribute",
     _name: { localName: string, uri: string },
     _value: string,
     _parent: XML,
   }

   Text : Node {
     _kind: "text",
     _value: string,
   }

   ProcessingInstruction : Node {
     _kind: "processing-instruction",
     _name: { localName: string, uri: string },
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

    XML = function (value) {
      var objectConstruction = this instanceof XML;
      if (!objectConstruction) {
        if (value instanceof XML) {
          return value; // no cloning
        }
        return new XML(value);
      }
//      this.init("element", "", "");
//      if (arguments.length === 0) {
//        return;
//      }
      if (value === null || value === undefined) {
        value = "";
      }
      var x = toXML(value);
      if (isXMLType(value)) {
        x = x.copy();
      }
      return x;
    };

    var c = new runtime.domain.system.Class("XML", XML, Domain.passthroughCallable(XML));
    c._flags = FLAG_IGNORE_COMMENTS |
      FLAG_IGNORE_PROCESSING_INSTRUCTIONS |
      FLAG_IGNORE_WHITESPACE |
      FLAG_PRETTY_PRINTING;

    c._prettyIndent = 2;
    c.extend(baseClass);

    var Xp = XML.prototype;

    XMLBlank = function (kind) {
      this.init(kind, "", "");
    }

    XMLBlank.prototype = Xp;
    
    // Initialize an XML node.
    Xp.init = function init(kind, uri, name) {
      this._name = name;
      this._uri = uri;
      this._kind = kind;    // E4X [[Class]]
      this._parent = null;
      this._inScopeNamespaces = [];
      switch (kind) {
      case "element":
        this._attributes = [];
        this._ = [];  // child nodes go here
        break;
      case "attribute":
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

    Xp.copy = function () {
      // WARNING lots of cases not handled by both toXMLString() and XML()
      return new XML(toXMLString(this));
    };

    // 13.4.4.16 XML.prototype.hasSimpleContent()
    Xp.hasSimpleContent = function hasSimpleContent() {
      if (this._kind === "attribute" || this._kind === "comment" || this._kind === "processing-instruction") {
        return false;
      }
      var result = true;
      this._.forEach(function (v) {
        if (v._kind === "element") {
          result = false;
        }
      });
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

    Xp.set = function (mn, value, isMethod) {
      if (isMethod) {
        return;
      }
      // FIXME need to set XML attributes and elements here
      switch (nameKind(mn)) {
      case ATTR_NAME:
        if (!this._attributes) {
          return;
        }
        this._attributes.forEach(function (v, i, o) {
          if (v._name === mn.name) {
            delete o[i];
          }
        });
        var a = new XMLBlank().init("attribute", "", mn.name);
        a._value = value;
        a._parent = this;
        this._attributes.push(a);
        break;
      case ANY_ATTR_NAME:
        break;
      case ANY_NAME:
        break;
      default:
        var x = new XMLBlank().init("element", "", mn.name);
        x._value = value;
        x._parent = this;
        this._.push(x);
        break;
      }
    };

    // 9.1.1.1 XML.[[Get]] (P)
    Xp.get = function (mn, isMethod) {
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
        val = new XMLListBlank();
        val._targetObject = this._parent;
        val._targetProperty = mn;
        var name = mn;  // E4X wants us to construct an XMLName here, but a
        // multiname has all the same information, minus a 'prefix', which is
        // optional.

        switch (nameKind(mn)) {
        case ANY_ATTR_NAME:
          var any = true;
          // fall through
        case ATTR_NAME:
          this._attributes.forEach(function (v, i) {
            if (any || (v._name === mn.name)) {
              val.append(v);
            }
          });
          break;
        case ANY_NAME:
          var any = true;
          // fall through
        default:
          this._.forEach(function (v, i) {
            if (any || v._name === mn.name) {
              // implement xmllist
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

    Xp._IS_XML = true;

    Xp.insert = function insert(node) {
      this._.push(node);
    };

    // 9.1.1.8 [[Descendants]] (P)
    Xp.descendants = function (mn) {
      var name = toXMLName(mn);
      var xl = new XMLListBlank();
      // SPEC BUG spec says nothing about what to do with non-element XML objects
      if (this._kind !== "element") {
        return xl;
      }
      if (mn.isAttribute()) {
        // Get attributes
        this._attributes.forEach(function (v, i) {
          if (mn.isAnyName() || mn.name === v.name) {
            xl.append(v);
          }
        });
      } else {
        // Get children
        this._.forEach(function (v, i) {
          if (mn.isAnyName() || mn.name === v._name) {
            xl.append(v);
          }
        });
      }
      // Descend
      this._.forEach(function (v, i) {
        xl.append(v.descendants(mn));
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
          return toString(this); //function () { return toString.bind(this); }
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
        attribute: function attribute(arg) { // (arg) -> XMLList
          notImplemented("XML.attribute");
        },
        attributes: function attributes() { // (void) -> XMLList
          notImplemented("XML.attributes");
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
          notImplemented("XML.comments");
        },
        contains: function contains(value) { // (value) -> Boolean
          notImplemented("XML.contains");
        },
        copy: function copy() { // (void) -> XML
          return this.copy();
        },
        descendants: function descendants(name) { // (name = "*") -> XMLList
          notImplemented("XML.descendants");
        },
        elements: function elements(name) { // (name = "*") -> XMLList
          notImplemented("XML.elements");
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
          notImplemented("XML.namespaceDeclarations");
        },
        nodeKind: function nodeKind() { // (void) -> String
          notImplemented("XML.nodeKind");
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
          notImplemented("XML.text");
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
    XMLList = function (value) {
      if (this instanceof XMLList) {
        return callXMLList(value);
      }
      return contructXMLList(value);
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
      if (val._IS_XMLLIST) {
        var xl = new XMLListBlank();
        xl.append(val);
        return xl;
      }
      return toXMLList(val);
    }

    var c = new runtime.domain.system.Class("XMLList", XMLList, Domain.passthroughCallable(XMLList));
    c.extend(baseClass);
    var XLp = XMLList.prototype;

    XMLListBlank = function (kind) {
      this._targetObject = null;
      this._ = [];
    }

    XMLListBlank.prototype = XLp;

    XLp.canHandleProperties = true;

    // 13.5.4.14 XMLList.prototype.hasSimpleContent()
    XLp.hasSimpleContent = function hasSimpleContent() {
      if (this._.length === 0) {
        return true;
      } else if (this._.length === 1) {
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

    XLp.set = function (mn, value, isMethod) {
      if (isMethod) {
        return;
      }
      if (!isNumeric(mn)) {
        return;
      }
        /*
          if (isNumeric(mn.name)) {
          if (this._target !== null) {
          var r = this._target.resolve()
          if (r === null) {
          return;
          }
          } else {
          var r = null;
          }
          if (r is XMLList) {
          if (r.length !== 1) {
          return;
          } else {
          var r = r[0];
          }
          }
          if (!(r is Element)) {
          return;
          }
          var y = new XML();
          y._parent = r;
          y._name = this._targetProp;
          }
        */
    };

    XLp.get = function (mn, isMethod) {
      var val;
      if (isMethod) {
        var resolved = Multiname.isQName(mn) ? mn : resolveMultiname(this, mn);
        val = this[Multiname.getQualifiedName(resolved)];
      } else {
        switch (nameKind(mn)) {
        case ATTR_NAME:
          val = toXML(this).get(mn, false);
        case ANY_ATTR_NAME:
          break;
        case ANY_NAME:
          val = new XMLList(); // FIXME set targets, set children
          val._targetObject = target;
          val._targetProperty = prop;
          break;
        default:
          val = toXML(this).get(mn, false);
          break;
        }
      }
      return val;
    };

    XLp.delete = function (key, isMethod) {
      debugger;
    };

    XLp.append = function (val) {
      if (val._IS_XMLLIST) {
        this._targetObject = val._targetObject;
        this._targetProperty = val._targetProperty;
        if (val._.length === 0) {
          return;
        }
        val._.forEach(function (v, i) {
          this._.push(v);
        });
      } else if (val._IS_XML) {
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
      var target = this._targetObject.get(_targetProp);
      if (base.length === 0) {
        notImplemented("XMLList.resolve");
        base.set(_targetProperty, "");
        target = base.get(_targetProperty);
        return target;
      }
    };

    XLp._IS_XMLLIST = true;

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
        attribute: function attribute(arg) { // (arg) -> XMLList
          notImplemented("XMLList.attribute");
        },
        attributes: function attributes() { // (void) -> XMLList
          notImplemented("XMLList.attributes");
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
          notImplemented("XMLList.comments");
        },
        contains: function contains(value) { // (value) -> Boolean
          notImplemented("XMLList.contains");
        },
        copy: function copy() { // (void) -> XMLList
          notImplemented("XMLList.copy");
        },
        descendants: function descendants(mn) { // (name = "*") -> XMLList
          return toXML(obj).descendants(mn);
        },
        elements: function elements(name) { // (name = "*") -> XMLList
          notImplemented("XMLList.elements");
        },
        hasComplexContent: function hasComplexContent() { // (void) -> Boolean
          notImplemented("XMLList.hasComplexContent");
        },
        hasSimpleContent: function hasSimpleContent() { // (void) -> Boolean
          return this.hasSimpleContent();
        },
        length: function length() { // (void) -> int
          return 1;
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
          notImplemented("XMLList.text");
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
          notImplemented("XMLList.nodeKind");
        },
        _namespace: function _namespace(prefix, argc) { // (prefix, argc:int) -> any
          notImplemented("XMLList._namespace");
        },
        localName: function localName() { // (void) -> Object
          notImplemented("XMLList.localName");
        },
        namespaceDeclarations: function namespaceDeclarations() { // (void) -> Array
          notImplemented("XMLList.namespaceDeclarations");
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
    function QName() {}
    var c = new runtime.domain.system.Class("QName", QName, Domain.passthroughCallable(QName));
    c.extend(baseClass);
    c.native = {
      static: {
      },
      instance: {
        localName: {
          get: function localName() { // (void) -> String
            notImplemented("QName.localName");
            return this._localName;
          }
        },
        uri: {
          get: function uri() { // (void) -> any
            notImplemented("QName.uri");
            return this._uri;
          }
        }
      }
    };
    return c;
  };
})();
