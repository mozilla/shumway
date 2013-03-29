// The XML parser is designed only for parsing of simple XML documents (for unit testing purpose).
function DOMParser() {
  // parser
  function parseXml(s, sink) {
    var i = 0, scopes = [{space:"default", xmlns:"", namespaces: {"xmlns":"http://www.w3.org/2000/xmlns/", "xml":"http://www.w3.org/XML/1998/namespace"}}];

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
      while (pos < s.length && !isWhitespace(s, pos) && s.charAt(pos) !== ">") {
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

  var implementation = this;

  function NodeList(init) {
    var nodes = [];
    if (init) {
      nodes = nodes.concat(init);
    }
    nodes.item = function(index) { return nodes[index]; };
    return nodes;
  }
  function NamedNodeMap(owner) {
    var nodes = [];
    nodes.item = function(index) { return nodes[index]; };
    nodes.getNamedItem = function(name) {
      for (var i = 0; i < nodes.length; ++i) {
        if (nodes[i].name === name) return nodes[i];
      }
      return null;
    };
    nodes.setNamedItem = function(arg) {
      for (var i = 0; i < nodes.length; ++i) {
        if (nodes[i].name === arg.name) {
          var old = nodes[i];
          nodes[i] = arg;
          old.ownerElement = null;
          return old;
        }
      }
      arg.ownerElement = owner;
      nodes.push(arg);
      return null;
    };
    nodes.removeNamedItem = function(name) {
      for (var i = 0; i < nodes.length; ++i) {
        if (nodes[i].name === name) {
          var old = nodes[i];
          nodes.splice(i, 1);
          old.ownerElement = null;
          return old;
        }
      }
      return null;
    };
    nodes.getNamedItemNS = function(namespaceURI, localName) {
      for (var i = 0; i < nodes.length; ++i) {
        if (nodes[i].localName === localName &&
          nodes[i].namespaceURI === namespaceURI) return nodes[i];
      }
      return null;
    };
    nodes.setNamedItemNS = function(arg) {
      for (var i = 0; i < nodes.length; ++i) {
        if (nodes[i].localName === arg.localName &&
          nodes[i].namespaceURI === arg.namespaceURI) {
          var old = nodes[i];
          nodes[i] = arg;
          old.ownerElement = null;
          return old;
        }
      }
      arg.ownerElement = owner;
      nodes.push(arg);
      return null;
    };
    nodes.removeNamedItemNS = function(namespaceURI, localName) {
      for (var i = 0; i < nodes.length; ++i) {
        if (nodes[i].localName === localName &&
          nodes[i].namespaceURI === namespaceURI) {
          var old = nodes[i];
          nodes.splice(i, 1);
          old.ownerElement = null;
          return old;
        }
      }
      return null;
    };
    return nodes;
  }
  function Node() {
    this.childNodes = new NodeList();
  }
  Node.ELEMENT_NODE = 1;
  Node.ATTRIBUTE_NODE = 2;
  Node.TEXT_NODE = 3;
  Node.CDATA_SECTION_NODE = 4;
  Node.ENTITY_REFERENCE_NODE = 5;
  Node.ENTITY_NODE = 6;
  Node.PROCESSING_INSTRUCTION_NODE = 7;
  Node.COMMENT_NODE = 8;
  Node.DOCUMENT_NODE = 9;
  Node.DOCUMENT_TYPE_NODE = 10;
  Node.DOCUMENT_FRAGMENT_NODE = 11;
  Node.NOTATION_NODE = 12;
  Node.prototype.nodeName = null;
  Node.prototype.nodeValue = null;
  Node.prototype.nodeType = 0;
  Node.prototype.parentNode = null;
  //Node.prototype.childNodes = [];
  Node.prototype.firstChild = null;
  Node.prototype.lastChild = null;
  Node.prototype.previousSibling = null;
  Node.prototype.nextSibling = null;
  Node.prototype.ownerDocument = null;
  Node.prototype.attributes = null;
  Node.prototype.onChildNodesChanged = function() {};
  // XXX newChild in tree remove first
  // XXX document fragment
  Node.prototype.insertBefore = function(newChild, refChild) {
    if (refChild == null) {
      return this.appendChild(newChild);
    }
    var i = 0;
    while (i < this.childNodes.length && this.childNodes[i] != refChild) {
      ++i;
    }
    if (!this.childNodes[i]) throw "Ref child not found";
    newChild.parentNode = this;
    newChild.previousSibling = refChild.previousSibling;
    if (newChild.previousSibling) newChild.previousSibling.nextSibling = newChild;
    newChild.nextSibling = refChild;
    refChild.previousSibling = newChild;
    if (this.firstChild == refChild) this.firstChild = newChild;
    this.childNodes.splice(i,0,newChild);
    this.onChildNodesChanged();
    return newChild;
  };
  Node.prototype.replaceChild = function(newChild, oldChild) {
    var i = 0;
    while (i < this.childNodes.length && this.childNodes[i] != oldChild) {
      ++i;
    }
    if (!this.childNodes[i]) throw "Old child not found";
    newChild.parentNode = this;
    newChild.previousSibling = oldChild.previousSibling;
    if (newChild.previousSibling) newChild.previousSibling.nextSibling = newChild;
    newChild.nextSibling = oldChild.nextSibling;
    if (newChild.nextSibling) newChild.nextSibling.previousSibling = newChild;
    oldChild.parentNode = null;
    oldChild.previousSibling = null;
    oldChild.nextSibling = null;
    if (this.lastChild == oldChild) this.lastChild = newChild;
    if (this.firstChild == oldChild) this.firstChild = newChild;
    this.childNodes[i] = newChild;
    this.onChildNodesChanged();
    return oldChild;
  };
  Node.prototype.removeChild = function(oldChild) {
    var i = 0;
    while (i < this.childNodes.length && this.childNodes[i] != oldChild) {
      ++i;
    }
    if (!this.childNodes[i]) throw "Old child not found";
    if (this.lastChild == oldChild) this.lastChild = oldChild.previousSibling;
    if (this.firstChild == oldChild) this.firstChild = oldChild.nextSibling;
    if (oldChild.nextSibling) oldChild.nextSibling.previousSibling = oldChild.previousSibling;
    if (oldChild.previousSibling) oldChild.previousSibling.nextSibling = oldChild.nextSibling;
    oldChild.parentNode = null;
    oldChild.previousSibling = null;
    oldChild.nextSibling = null;
    this.childNodes.splice(i, 1);
    this.onChildNodesChanged();
    return oldChild;
  };
  Node.prototype.appendChild = function(newChild) {
    newChild.parentNode = this;
    var lastChild = this.lastChild;
    if (lastChild) {
      newChild.nextSibling = lastChild.nextSibling;
      if (newChild.nextSibling) newChild.nextSibling.previousSibling = newChild;
      newChild.previousSibling = lastChild;
      lastChild.nextSibling = newChild;
    } else {
      this.firstChild = newChild;
      newChild.previousSibling = null;
      newChild.nextSibling = null;
    }
    this.lastChild = newChild;
    this.childNodes.push(newChild);
    this.onChildNodesChanged();
    return newChild;
  };
  Node.prototype.hasChildNodes = function() {
    return this.childNodes.length > 0;
  };
  Node.prototype.cloneNode = function(deep) {
    throw "Not implemented";
  };
  Node.prototype.normalize = function() {
    var lastWasText = false;
    for (var i = 0; i < this.childNodes.length; ++i) {
      if (this.childNodes[i].nodeType == Node.ELEMENT_NODE) {
        this.childNodes[i].normalize();
      }
      if (this.childNodes[i].nodeType == Node.TEXT_NODE) {
        if (lastWasText) {
          this.childNodes[i - 1].appendData(this.childNodes[i].data);
          this.removeChild(this.childNodes[i]);
          --i;
        }
        lastWasText = true;
      } else {
        lastWasText = false;
      }
    }
  };
  Node.prototype.isSupported = function(feature, version) {
    return false;
  };
  Node.prototype.namespaceURI = null;
  Node.prototype.prefix = null;
  Node.prototype.localName = null;
  Node.prototype.hasAttributes = function() {
    return this.attributes.length > 0;
  };

  Node.prototype.textContent = "";

  function Document() {
    var node = new Node();
    node.nodeType = Node.DOCUMENT_NODE;
    node.doctype = null;
    node.implementation = implementation;
    node.documentElement = null;
    node.createElement = function(tagName) {
      return node.createElementNS("", tagName);
    };
    node.createTextNode = function(data, nodeTypeOverride) {
      var text = new Node();
      text.nodeType = (nodeTypeOverride ? nodeTypeOverride : Node.TEXT_NODE);
      text.ownerDocument = node;
      text.nodeValue = data;
      Object.defineProperty(text, "data", {
        get: function() { return this.nodeValue; },
        set: function(value) { this.nodeValue = value; },
        enumerable: true
      });

      text.data = data;
      text.length = data.length;
      text.appendData = function(arg) {
        this.nodeValue += arg;
      };

      Object.defineProperty(text, "textContent", {
        get: function() { return this.nodeValue; },
        enumerable: true
      });
      // TODO appendData, substringData, etc.
      return text;
    };
    node.createCDATASection = function(data) {
      return this.createTextNode(data, Node.CDATA_SECTION_NODE);
    };
    node.createAttribute = function(name) {
      return node.createAttributeNS("", name);
    };
    node.getElementsByTagName = function(tagName) {
      return node.getElementsByTagNameNS("", tagName);
    };
    node.createElementNS = function(namespaceURI, qualifiedName) {
      var element = new Node();
      element.nodeType = Node.ELEMENT_NODE;
      element.ownerDocument = node;
      element.attributes = new NamedNodeMap(element);
      element.tagName = qualifiedName;
      element.nodeName = qualifiedName;
      var i = qualifiedName.indexOf(":");
      element.localName = i < 0 ? qualifiedName : qualifiedName.substring(i + 1);
      element.prefix = i < 0 ? "" : qualifiedName.substring(0, i);
      element.namespaceURI = namespaceURI;
      element.getAttributeNode = function(name) {
        return this.attributes.getNamedItem(name);
      };
      element.getAttribute = function(name) {
        var attr = this.getAttributeNode(name);
        return attr ? attr.value : "";
      };
      element.setAttributeNode = function(newAttr) {
        return this.attributes.setNamedItem(newAttr);
      };
      element.setAttribute = function(name, value) {
        var attr = this.ownerDocument.createAttribute(name);
        attr.value = value || "";
        this.setAttributeNode(attr);
      };
      element.removeAttribute = function(name) {
        this.attributes.removeNamedItem(name);
      }
      element.removeAttributeNode = function(oldAttr) {
        return this.attributes.removeNamedItem(oldAttr.name);
      }
      element.hasAttribute = function(name) {
        return this.attributes.getNamedItem(name) != null;
      }
      element.getAttributeNodeNS = function(namespaceURI, localName) {
        return this.attributes.getNamedItemNS(namespaceURI, localName);
      };
      element.getAttributeNS = function(namespaceURI, localName) {
        var attr = this.getAttributeNodeNS(namespaceURI, localName);
        return attr ? attr.value : "";
      };
      element.setAttributeNodeNS = function(newAttr) {
        return this.attributes.setNamedItemNS(newAttr);
      };
      element.setAttribute = function(namespaceURI, qualifiedName) {
        var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
        attr.value = value || "";
        this.setAttributeNodeNS(attr);
      };
      element.removeAttributeNS = function(namespaceURI, localName) {
        this.attributes.removeNamedItemNS(namespaceURI, localName);
      }
      element.removeAttributeNode = function(oldAttr) {
        return this.attributes.removeNamedItemNS(oldAttr.namespaceNS, oldAttr.localName);
      }
      element.hasAttributeNS = function(namespaceURI, localName) {
        return this.attributes.getNamedItemNS(namespaceURI, localName) != null;
      }
      element.getElementsByTagName = function(name) {
        return this.getElementsByTagNameNS("", name);
      };
      element.getElementsByTagNameNS = function(namespaceURI, localName) {
        var q = [this];
        var result = [];
        while (q.length > 0) {
          var current = q.shift();
          if (current.nodeType == Node.ELEMENT_NODE) {
            if (current.namespaceURI == namespaceURI && current.localName == localName) {
              result.push(current);
            }

            for (var i = 0; i < current.childNodes.length; ++i) {
              q.push(current.childNodes[i]);
            }
          }
        }
        return new NodeList(result);
      };

      Object.defineProperty(element, "textContent", {
        get: function() {
          var result = "";
          for (var i = 0; i < this.childNodes.length; ++i) {
            result += this.childNodes[i].textContent;
          }
          return result;
        },
        enumerable: true
      });

      return element;
    };
    node.createAttributeNS = function(namespaceURI, qualifiedName) {
      var attr = new Node();
      attr.nodeType = Node.ATTRIBUTE_NODE;
      attr.ownerDocument = node;
      attr.name = qualifiedName;
      attr.nodeName = qualifiedName;
      var i = qualifiedName.indexOf(":");
      attr.localName = i < 0 ? qualifiedName : qualifiedName.substring(i + 1);
      attr.prefix = i < 0 ? "" : qualifiedName.substring(0, i);
      attr.namespaceURI = namespaceURI;
      attr.specified = true;
      attr.nodeValue = null;
      Object.defineProperty(attr, "value", {
        get: function() { return this.nodeValue; },
        set: function(value) { this.nodeValue = value; },
        enumerable: true
      });
      return attr;
    };
    node.getElementsByTagNameNS = function(namespaceURI, localName) {
      if (!this.documentElement) return null;
      return this.documentElement.getElementsByTagNameNS(namespaceURI, localName);
    };
    node.getElementById = function(elementId) {
      if (this.documentElement) return null;
      var q = [this.documentElement];
      while (q.length > 0) {
        var current = q.shift();
        if (current.nodeType == Node.ELEMENT_NODE) {
          if (current.getAttribute("id") == elementId) return current;

          for (var i = 0; i < current.childNodes.length; ++i) {
            q.push(current.childNodes[i]);
          }
        }
      }
      return null;
    };
    node.onChildNodesChanged = function() {
      this.documentElement = null;
      for (var i = 0; i < this.childNodes.length; ++i) {
        if (this.childNodes[i].nodeType == Node.ELEMENT_NODE) {
          this.documentElement = this.childNodes[i];
        }
      }
    };

    Object.defineProperty(node, "textContent", {
      get: function() {
        return this.documentElement.textContent;
      },
      enumerable: true
    });
    return node;
  }

  function buildQualifiedName(name) {
    return name.prefix ? name.prefix + ":" + name.name : name.name;
  }

  this.parseFromString = function(s, mimeType) {
    var document = new Document();
    var elementsStack = [], currentElement = document;
    parseXml(s, {
      beginElement: function(name, attrs, isEmpty) {
        var parent = currentElement;
        elementsStack.push(parent);
        currentElement = document.createElementNS(name.namespace, buildQualifiedName(name));
        for (var i = 0; i < attrs.length; ++i) {
          var attr = document.createAttributeNS(attrs[i].name.namespace,
            buildQualifiedName(attrs[i].name));
          attr.value = attrs[i].value;
          currentElement.attributes.setNamedItem(attr);
        }
        parent.appendChild(currentElement);
        if (isEmpty) {
          currentElement = elementsStack.pop();
        }
      },
      endElement: function(name) {
        currentElement = elementsStack.pop();
      },
      text: function(text, isWhitespace) {
        var node = document.createTextNode(text);
        currentElement.appendChild(node);
      },
      cdata: function(text) {
        var node = document.createCDATASection(text);
        currentElement.appendChild(node);
      },
      comment: function(text) { },
      pi: function(name, attrs) { },
      doctype: function(text) { }
    });
    document.normalize();
    document.xmlString = s;
    return document;
  };
}

var xmlParser = new DOMParser();

/**
 * XML.as
 */

var XML;
var XMLList;

function XMLClass(runtime, scope, instance, baseClass) {
  var FLAG_IGNORE_COMMENTS                = 0x01;
  var FLAG_IGNORE_PROCESSING_INSTRUCTIONS = 0x02;
  var FLAG_IGNORE_WHITESPACE              = 0x04;
  var FLAG_PRETTY_PRINTING                = 0x08;

  XML = function (value) {
    if (!value) {
      toXML.call(this, "");
    } else if (value instanceof XML || value instanceof XMLList) {
      constructFromXML.call(this, xml);
    } else {
      toXML.call(this, value);
    }
  };

  // E4X 10.3
  function toXML(value) {
    if (value === null) {
      throw new TypeError(formatErrorMessage(Errors.ConvertNullToObjectError));
    } else if (value === undefined) {
      throw new TypeError(formatErrorMessage(Errors.ConvertUndefinedToObjectError));
    } else if (value instanceof XML) {
      return value;
    } else if (value instanceof XMLList) {
      // TODO: Return first XML element in the list.
      throw new TypeError(formatErrorMessage(Errors.XMLMarkupMustBeWellFormed));
    } else {
      return constructFromString.call(this, toString(value));
    }
  }

  function constructFromString(string) {
    warning("TODO: Parse: " + string);
  }

  function constructFromXML(xml) {
    warning("TODO: Clone: " + xml);
  }

  var c = new runtime.domain.system.Class("XML", XML, Domain.passthroughCallable(XML));

  c._flags = FLAG_IGNORE_COMMENTS | FLAG_IGNORE_PROCESSING_INSTRUCTIONS | FLAG_IGNORE_WHITESPACE | FLAG_PRETTY_PRINTING;
  c._prettyIndent = 2;

  c.extend(baseClass);
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
      toString: function toString() { // (void) -> String
        return this._value;
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
        notImplemented("XML.appendChild");
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
        notImplemented("XML.children");
      },
      comments: function comments() { // (void) -> XMLList
        notImplemented("XML.comments");
      },
      contains: function contains(value) { // (value) -> Boolean
        notImplemented("XML.contains");
      },
      copy: function copy() { // (void) -> XML
        notImplemented("XML.copy");
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
        notImplemented("XML.hasSimpleContent");
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
        notImplemented("XML.name");
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
      toXMLString: function toXMLString() { // (void) -> String
        notImplemented("XML.toXMLString");
      },
      notification: function notification() { // (void) -> Function
        notImplemented("XML.notification");
      },
      setNotification: function setNotification(f) { // (f:Function) -> any
        notImplemented("XML.setNotification");
      }
    }
  };
  return c;
}

function XMLListClass(runtime, scope, instance, baseClass) {
  XMLList = function () {}
  var c = new runtime.domain.system.Class("XMLList", XMLList, Domain.passthroughCallable(XMLList));
  c.extend(baseClass);
  c.native = {
    static: {
    },
    instance: {
      toString: function toString() { // (void) -> String
        notImplemented("XMLList.toString");
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
        notImplemented("XMLList.children");
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
      descendants: function descendants(name) { // (name = "*") -> XMLList
        notImplemented("XMLList.descendants");
      },
      elements: function elements(name) { // (name = "*") -> XMLList
        notImplemented("XMLList.elements");
      },
      hasComplexContent: function hasComplexContent() { // (void) -> Boolean
        notImplemented("XMLList.hasComplexContent");
      },
      hasSimpleContent: function hasSimpleContent() { // (void) -> Boolean
        notImplemented("XMLList.hasSimpleContent");
      },
      length: function length() { // (void) -> int
        notImplemented("XMLList.length");
      },
      name: function name() { // (void) -> Object
        notImplemented("XMLList.name");
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
      toXMLString: function toXMLString() { // (void) -> String
        notImplemented("XMLList.toXMLString");
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

function QNameClass(runtime, scope, instance, baseClass) {
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
