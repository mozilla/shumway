/**
 * XML.as
 */
function XMLClass(runtime, scope, instance, baseClass) {
  function XML() {}
  var c = new runtime.domain.system.Class("XML", XML, Domain.passthroughCallable(XML));
  c.extend(baseClass);
  c.native = {
    static: {
      ignoreComments: {
        get: function ignoreComments() { // (void) -> Boolean
          notImplemented("XML.ignoreComments");
        },
        set: function ignoreComments(newIgnore) { // (newIgnore:Boolean) -> any
          notImplemented("XML.ignoreComments");
        }
      },
      ignoreProcessingInstructions: {
        get: function ignoreProcessingInstructions() { // (void) -> Boolean
          notImplemented("XML.ignoreProcessingInstructions");
        },
        set: function ignoreProcessingInstructions(newIgnore) { // (newIgnore:Boolean) -> any
          notImplemented("XML.ignoreProcessingInstructions");
        }
      },
      ignoreWhitespace: {
        get: function ignoreWhitespace() { // (void) -> Boolean
          notImplemented("XML.ignoreWhitespace");
        },
        set: function ignoreWhitespace(newIgnore) { // (newIgnore:Boolean) -> any
          notImplemented("XML.ignoreWhitespace");
        }
      },
      prettyPrinting: {
        get: function prettyPrinting() { // (void) -> Boolean
          notImplemented("XML.prettyPrinting");
        },
        set: function prettyPrinting(newPretty) { // (newPretty:Boolean) -> any
          notImplemented("XML.prettyPrinting");
        }
      },
      prettyIndent: {
        get: function prettyIndent() { // (void) -> int
          notImplemented("XML.prettyIndent");
        },
        set: function prettyIndent(newIndent) { // (newIndent:int) -> any
          notImplemented("XML.prettyIndent");
        }
      }
    },
    instance: {
      toString: function toString() { // (void) -> String
        notImplemented("XML.toString");
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
  function XMLList() {}
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