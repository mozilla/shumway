/*
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package flash.xml
{
//
// XMLNode
//

/**
 * The XMLNode class represents the legacy XML object
 * that was present in ActionScript 2.0 and that was renamed in ActionScript 3.0.
 * In ActionScript 3.0, consider using the new top-level <a href="../../XML.html">XML</a>
 * class and related classes instead,
 * which support E4X (ECMAScript for XML).
 * The XMLNode class is present for backward compatibility.
 * 
 * @includeExample examples\XMLDocumentExample.as -noswf
 * @internal XMLNode uses XMLDocument's example. 
 *
 * @see XML
 * @see flash.xml.XMLDocument
 *
 * @helpid 
 * @refpath
 * @keyword XMLNode, XMLNode object, built-in class
 * @playerversion Flash 9
 * @langversion 3.0
 */
[native]
public class XMLNode
{
	/**
	 * A <code>nodeType</code> constant value, either <code>XMLNodeType.ELEMENT_NODE</code> for an XML element or
	 * <code>XMLNodeType.TEXT_NODE</code> for a text node.
	 * <p>The <code>nodeType</code> is a numeric value from the NodeType enumeration in the W3C DOM
	 * Level 1 recommendation:
	 * <a href="http://www.w3.org/TR/1998/REC-DOM-Level-1-19981001/level-one-core.html" target="_blank">http://www.w3.org/TR/1998/REC-DOM-Level-1-19981001/level-one-core.html</a>.
	 * The following table lists the values:</p>
	 * <p><table width="400"><tr><th width="150" align="left">Integer value</th><th align="left">Defined
	 * constant</th></tr><tr><td>1</td><td>ELEMENT_NODE</td></tr><tr><td>2</td><td>ATTRIBUTE_NODE</td>
	 * </tr><tr><td>3</td><td>TEXT_NODE</td></tr><tr><td>4</td><td>CDATA_SECTION_NODE</td></tr>
	 * <tr><td>5</td><td>ENTITY_REFERENCE_NODE</td></tr><tr><td>6</td><td>ENTITY_NODE</td></tr>
	 * <tr><td>7</td><td>PROCESSING_INSTRUCTION_NODE</td></tr><tr><td>8</td><td>COMMENT_NODE</td></tr>
	 * <tr><td>9</td><td>DOCUMENT_NODE</td></tr><tr><td>10</td><td>DOCUMENT_TYPE_NODE</td></tr>
	 * <tr><td>11</td><td>DOCUMENT_FRAGMENT_NODE</td></tr><tr><td>12</td><td>NOTATION_NODE</td></tr>
	 * </table></p>
	 * <p>In Flash Player, the built-in XMLNode class only supports <code>XMLNodeType.ELEMENT_NODE</code> and
	 * <code>XMLNodeType.TEXT_NODE</code>.</p>
	 *
	 * @oldexample The following example creates an element node and a text node, and checks the node
	 * type of each:
	 * <pre>
	 * // create an XML document
	 * var doc:XML = new XML();
	 *
	 * // create an XML node using createElement()
	 * var myNode:XMLNode = doc.createElement("rootNode");
	 *
	 * // place the new node into the XML tree
	 * doc.appendChild(myNode);
	 *
	 * // create an XML text node using createTextNode()
	 * var myTextNode:XMLNode = doc.createTextNode("TEXT_NODE");
	 *
	 * // place the new node into the XML tree
	 * myNode.appendChild(myTextNode);
	 *
	 * trace(myNode.nodeType);
	 * trace(myTextNode.nodeType);
	 *
	 * // output:
	 * // 1
	 * // 3
	 * </pre>
	 *
	 * @see XMLNodeType#TEXT_NODE
	 * @see XMLNodeType#ELEMENT_NODE
	 * @helpid x209FF
	 * @refpath Objects/Client/Server/XML/Properties/nodeType
	 * @keyword XML.nodetype, node type
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public var nodeType:uint;

	/**
	 * An XMLNode value that references the previous sibling in the parent node's child list.
	 * The property has a value of null if the node does not have a previous sibling node. This property
	 * cannot be used to manipulate child nodes; use the <code>appendChild()</code>,
	 * <code>insertBefore()</code>, and <code>removeNode()</code> methods to manipulate child nodes.
	 *
	 *
	 * @see XMLNode#lastChild
	 * @see XMLNode#appendChild()
	 * @see XMLNode#insertBefore()
	 * @see XMLNode#removeNode()
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.previousSibling, previousSibling
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public var previousSibling:XMLNode;

	/**
	 * An XMLNode value that references the next sibling in the parent node's child list. This property is
	 * <code>null</code> if the node does not have a next sibling node. This property cannot be used to
	 * manipulate child nodes; use the <code>appendChild()</code>, <code>insertBefore()</code>, and
	 * <code>removeNode()</code> methods to manipulate child nodes.
	 *
	 *
	 * @see XMLNode#firstChild
	 * @see XMLNode#appendChild()
	 * @see XMLNode#insertBefore()
	 * @see XMLNode#removeNode()
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.nextsibling, next sibling
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public var nextSibling:XMLNode;

	/**
	 * An XMLNode value that references the parent node of the specified XML object, or returns
	 * <code>null</code> if the node has no parent. This is a read-only property and cannot be used to
	 * manipulate child nodes; use the <code>appendChild()</code>, <code>insertBefore()</code>, and
	 * <code>removeNode()</code> methods to manipulate child nodes.
	 *
	 * @oldexample <span class="flashonly">The following example creates an XML packet and displays the parent node of the username node in the Output panel:</span><span class="flexonly">The following example creates an XML packet and writes the parent node of the username node to the log file:</span>
	 * <listing version="2.0">
	 * var my_xml:XML = new XML("&lt;login&gt;&lt;username&gt;morton&lt;/username&gt;&lt;password&gt;good&amp;evil&lt;/password&gt;&lt;/login&gt;");
	 *
	 * // first child is the &lt;login /&gt; node
	 * var rootNode:XMLNode = my_xml.firstChild;
	 *
 	 * // first child of the root is the &lt;username /&gt; node
	 * var targetNode:XMLNode = rootNode.firstChild;
	 * trace("the parent node of '"+targetNode.nodeName+"' is: "+targetNode.parentNode.nodeName);
	 * trace("contents of the parent node are:\n"+targetNode.parentNode);
	 * </listing>
	 * Output (line breaks added for clarity):
	 * <pre><code>
	 * the parent node of 'username' is: login
	 * contents of the parent node are:
	 * &lt;login&gt;
	 *    &lt;username&gt;morton&lt;/username&gt;
	 *    &lt;password&gt;good&amp;evil&lt;/password&gt;
	 * &lt;/login&gt;
	 * </code></pre>
	 *
	 * @see XMLNode#appendChild()
	 * @see XMLNode#insertBefore()
	 * @see XMLNode#removeNode()
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.parentnode, parentnode, parent node
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public var parentNode:XMLNode;


	/**
	 * Evaluates the specified XMLDocument object and references the first child in the parent node's child list.
	 * This property is <code>null</code> if the node does not have children. This property is
	 * <code>undefined</code> if the node is a text node. This is a read-only property and cannot be used
	 * to manipulate child nodes; use the <code>appendChild()</code>, <code>insertBefore()</code>, and
	 * <code>removeNode()</code> methods to manipulate child nodes.
	 *
	 *
	 * @see XMLNode#appendChild()
	 * @see XMLNode#insertBefore()
	 * @see XMLNode#removeNode()
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.firstchild, first child
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public var firstChild:XMLNode;


	/**
	 * An XMLNode value that references the last child in the node's child list. The
	 * <code>XMLNode.lastChild</code> property is <code>null</code> if the node does not have children.
	 * This property cannot be used to manipulate child nodes; use the <code>appendChild()</code>,
	 * <code>insertBefore()</code>, and <code>removeNode()</code> methods to manipulate child nodes.
	 *
	 *
	 * @see XMLNode#appendChild()
	 * @see XMLNode#insertBefore()
	 * @see XMLNode#removeNode()
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.lastchild, lastchild, last child
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public var lastChild:XMLNode;

	/**
	 * An array of the specified XMLNode object's children. Each element in the array is a reference
	 * to an XMLNode object that represents a child node. This is a read-only property and cannot be
	 * used to manipulate child nodes. Use the <code>appendChild()</code>, <code>insertBefore()</code>,
	 * and <code>removeNode()</code>  methods to manipulate child nodes.
	 *
	 * <p>This property is undefined for text nodes (<code>nodeType == 3</code>).</p>
	 *
	 *
	 * @see XMLNode#nodeType
	 * @see XMLNode#appendChild()
	 * @see XMLNode#insertBefore()
	 * @see XMLNode#removeNode()
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.childnodes, childnodes
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public function get childNodes():Array
	{
		// build our array if we need to
		if (_childNodes == null)
		{
			_childNodes = new Array();
			for (var child:XMLNode=firstChild;
				 child != null;
				 child = child.nextSibling)
			{
				_childNodes.push(child);
			}
		}

		return _childNodes;
	}

   /**
    * @private Do not document.  
    */
	private var _childNodes:Array;


	/**
	 * An object containing all of the attributes of the specified XMLNode instance. The
	 * XMLNode.attributes object contains one variable for each attribute of the XMLNode instance.
	 * Because these variables are defined as part of the object, they are generally referred to as
	 * properties of the object. The value of each attribute is stored in the corresponding property as a
     * string. For example, if you have an attribute named <code>color</code>, you would retrieve 
     * that attribute's value
	 * by specifying <code>color</code> as the property name, as the following code shows:
	 * <pre>
	 * var myColor:String = doc.firstChild.attributes.color
	 * </pre>
	 *
	 *
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.attributes, attributes
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public function get attributes():Object
	{
		if (_attributes == null)
		{
			_attributes = {};
		}
		return _attributes;
	}

	public function set attributes(value:Object):void
	{
		_attributes = value;
	}

   /**
    * @private Do not document.
    */
	private var _attributes:Object;

	/**
	 * A string representing the node name of the XMLNode object. If the XMLNode object is an XML
	 * element (<code>nodeType == 1</code>), <code>nodeName</code> is the name of the tag that
	 * represents the node in the XML file. For example, <code>TITLE</code> is the <code>nodeName</code>
	 * of an HTML <code>TITLE</code> tag. If the XMLNode object is a text node
	 * (<code>nodeType == 3</code>), nodeName is <code>null</code>.
	 *
	 *
	 * @see XMLNode#nodeType
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.nodename, node name
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public var nodeName:String;

	/**
	 * The node value of the XMLDocument object. If the XMLDocument object is a text node, the <code>nodeType</code>
	 * is 3, and the <code>nodeValue</code> is the text of the node. If the XMLDocument object is an XML element
	 * (<code>nodeType</code> is 1), <code>nodeValue</code> is <code>null</code> and read-only.
	 *
	 *
	 * @see XMLNode#nodeType
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.nodevalue, nodevalue, node value
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public var nodeValue:String;

/**
 * Creates a new XMLNode object. You must use the constructor to create an XMLNode object before you 
 * call any of the methods of the XMLNode class.
 * <p><strong>Note: </strong>Use the <code>createElement()</code> and <code>createTextNode()</code>
 * methods to add elements and text nodes to an XML document tree.</p>
 *
 * @param type The node type: either 1 for an XML element or 3 for a text node.
 * @param value The XML text parsed to create the new XMLNode object. 
 *
 *
 *
 *
 *
 * @see XMLDocument#createElement()
 * @see XMLDocument#createTextNode()
 * @helpid
 * @refpath
 * @keyword new XMLNode, new, constructor
 * @playerversion Flash 9
 * @langversion 3.0
 */	
	public function XMLNode(type:uint, value:String)
	{
		init(type, value);
	}

    private function init(type:uint, value:String):void
	{
		nodeType = type;
		if (type == 1/*XMLNodeType.ELEMENT_NODE*/)
		{
			nodeName  = value;
		}
		else
		{
			nodeValue = value;
		}
	}

	/**
	 * Indicates whether the specified XMLNode object has child nodes. This property is <code>true</code> if the
	 * specified XMLNode object has child nodes; otherwise, it is <code>false</code>.
	 *
	 * @return Returns <code>true</code> if the
	 * specified XMLNode object has child nodes; otherwise, <code>false</code>.
	 *
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.haschildnodes, haschildnodes, has child nodes
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public function hasChildNodes():Boolean
	{
		// Just check if we have a firstChild in case we haven't
		// created our childNodes array yet
		return (firstChild != null);
	}

	/**
	 *
	 * Constructs and returns a new XML node of the same type, name, value, and attributes as the
	 * specified XML object. If <code>deep</code> is set to <code>true</code>, all child nodes are
	 * recursively cloned, resulting in an exact copy of the original object's document tree.
	 * <p>The clone of the node that is returned is no longer associated with the tree of the cloned item.
	 * Consequently, <code>nextSibling</code>, <code>parentNode</code>, and <code>previousSibling</code>
	 * all have a value of <code>null</code>. If the <code>deep</code> parameter is set to
	 * <code>false</code>, or the <code>my_xml</code> node has no child nodes,
	 * <code>firstChild</code> and <code>lastChild</code> are also null.</p>
	 *
	 * @param deep A Boolean value; if set to <code>true</code>, the children of the specified XML object will be recursively cloned.
	 *
	 * @return An XMLNode Object.
	 *
	 *
	 *
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.clonenode, clodenode
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public function cloneNode(deep:Boolean):XMLNode
	{
		var result:XMLNode = new XMLNode(nodeType,
										 (nodeType == XMLNodeType.ELEMENT_NODE)?nodeName:nodeValue);

		if (_attributes !== null)
		{
			result.attributes = {};
			for (var name:String in _attributes)
			{
				result.attributes[name] = _attributes[name];
			}
		}

		if (deep)
		{
			for (var child:XMLNode=firstChild;
				 child != null;
				 child = child.nextSibling)
			{
				result.appendChild(child.cloneNode(true));
			}
		}
		return result;
	}

	/**
	 * Removes the specified XML object from its parent. Also deletes all descendants of the node.
	 *
	 *
	 *
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.removenode, removenode, remove node
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public function removeNode():void
	{
		// Remove from hierarchy only if it's *in* the hierarchy
		if (parentNode === null)
		{
			return;
		}

		// Chain previous sibling to next sibling
		if (previousSibling === null) {
			parentNode.firstChild = nextSibling;
		} else {
			previousSibling.nextSibling = nextSibling;
		}

		// Chain next sibling to previous sibling
		if (nextSibling === null) {
			parentNode.lastChild = previousSibling;
		} else {
			nextSibling.previousSibling = previousSibling;
		}

		// Remove from childNodes collection of parent
		if (parentNode._childNodes !== null)
		{
			for (var i:int = 0; i < parentNode._childNodes.length; i++) {
				if (parentNode._childNodes[i] == this) {
					// Found ourselves!  Delete this spot.
					parentNode._childNodes.splice(i, 1);
					break;
				}
			}
		}

		// Clear parentNode, previousSibling, nextSibling references
		parentNode      = null;
		previousSibling = null;
		nextSibling     = null;
	}

	/**
	 * Inserts a new child node into the XML object's child list, before the
	 * <code>beforeNode</code> node. If the <code>beforeNode</code> parameter is undefined
	 * or null, the node is added using the <code>appendChild()</code> method. If <code>beforeNode</code>
	 * is not a child of <code>my_xml</code>, the insertion fails.
	 *
	 * @param node The XMLNode object to be inserted.
	 * @param before The XMLNode object before the insertion point for the <code>childNode</code>.
	 *
	 * @see XMLNode#cloneNode()
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.insertbefore, insertbefore, insert before
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
    public function insertBefore(node:XMLNode, before:XMLNode):void
	{
		// If b is not specified, this reduces to appendChild
		if (before === null)
		{
			return appendChild(node);
		}

		// Do only if "before" node is our child
		// Do only if new node not already our child
		if ((before.parentNode !== this) || (node.parentNode === this))
		{
            Error.throwError(Error, 2102/*kNotAnXMLChildError*/);
		}

		// Remove new node from whatever parent it has
		node.removeNode();

		// Chain it into the linked list
		if (before.previousSibling === null)
		{
			firstChild = node;
		}
		else
		{
			before.previousSibling.nextSibling = node;
		}

		node.previousSibling = before.previousSibling;
		node.nextSibling = before;
		before.previousSibling = node;
		node.parentNode = this;

		// Locate before in childNodes
		if (_childNodes !== null)
		{
			for (var i:uint=0; i < _childNodes.length; i++)
			{
				if (_childNodes[i] == before)
				{
					_childNodes.splice(i, 0, node);
					return;
				}
			}
		}
		else
		{
			return;
		}

		// Something has gone wrong...
        Error.throwError(Error, 2102/*kNotAnXMLChildError*/);
	}

	/**
	 *
	 * Appends the specified node to the XML object's child list. This method operates directly on the
	 * node referenced by the <code>childNode</code> parameter; it does not append a copy of the
	 * node. If the node to be appended already exists in another tree structure, appending the node to the
	 * new location will remove it from its current location. If the <code>childNode</code>
	 * parameter refers to a node that already exists in another XML tree structure, the appended child node
	 * is placed in the new tree structure after it is removed from its existing parent node.
	 *
	 * @param node An XMLNode that represents the node to be moved from its current location to the child
	 * list of the <code>my_xml</code> object.
	 *
	 *
	 *
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.appendchild, appendchild
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public function appendChild(node:XMLNode):void
	{
		// Don't allow circular references.
		var x:XMLNode = this;
		while (x)
		{
			if (x === node)
			{
		        Error.throwError(Error, 2103/*kXMLRecursionError*/);
			}
			x = x.parentNode;
		}

		// Do something only if not already our child
		if (node.parentNode === this)
		{
			return;
		}

		// Remove child from its current parent
		node.removeNode();

		// Add the child to our linked list
		if (lastChild === null)
		{
			firstChild = node;
		}
		else
		{
			lastChild.nextSibling = node;
		}

		node.previousSibling = lastChild;
		node.nextSibling = null;
		node.parentNode = this;
		lastChild = node;

		// Add the child to our childNodes collection
		if (_childNodes !== null)
		{
			_childNodes.push(node);
		}
	}

    private native static function escapeXML(value:String):String;

	/**
	 * Evaluates the specified XMLNode object, constructs a textual representation of the XML structure,
	 * including the node, children, and attributes, and returns the result as a string.
	 *
	 * <p>For top-level XMLDocument objects (those created with the constructor),
	 * the <code>XMLDocument.toString()</code> method outputs the document's XML declaration
	 * (stored in the <code>XMLDocument.xmlDecl</code> property), followed by the document's
	 * <code>DOCTYPE</code> declaration (stored in the <code>XMLDocument.docTypeDecl</code> property),
	 * followed by the text representation of all XML nodes in the object. The XML declaration is not
	 * output if the <code>XMLDocument.xmlDecl</code> property is <code>null</code>.
	 * The <code>DOCTYPE</code> declaration is not output if the
	 <code>XMLDocument.docTypeDecl</code> property is <code>null</code>.</p>
	 *
	 * @return The string representing the XMLNode object.
	 *
	 *
	 * @see XMLDocument#docTypeDecl
	 * @see XMLDocument#xmlDecl
	 * @helpid
	 * @refpath
	 * @keyword XMLNode.tostring, tostring
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public function toString():String
	{
		var s:String = "";
		if (nodeType == XMLNodeType.ELEMENT_NODE)
		{
			// Element
			if (nodeName != null)
				s +=  "<" + nodeName;

			// Add all the attributes
			for (var attribute:String in _attributes)
			{
				s += " " + attribute + "=\"" + escapeXML(String(_attributes[attribute])) + "\"";
			}
			if (nodeName != null)
			{
				if (hasChildNodes())
					s += ">";
				else
					s += " />"
			}
			if (hasChildNodes())
			{
				for (var node:XMLNode = firstChild;
					 node != null;
					 node = node.nextSibling)
				{
					s += node.toString();
				}
				if (nodeName != null)
					s += "</" + nodeName + ">";
			}
		}
		else
		{
			s += escapeXML(nodeValue);
		}

		return s;
	}

	/**
	 * Returns the namespace URI that is associated with the specified prefix for the node. To determine
	 * the URI, <code>getPrefixForNamespace()</code> searches up the XML hierarchy from the node, as
	 * necessary, and returns the namespace URI of the first <code>xmlns</code> declaration for the
	 * given <code>prefix</code>.
	 *
	 * <p>If no namespace is defined for the specified prefix, the method returns <code>null</code>.</p>
	 *
	 * <p>If you specify an empty string (<code>""</code>) as the <code>prefix</code> and there is a
	 * default namespace defined for the node (as in <code>xmlns="http://www.example.com/"</code>),
	 * the method returns that default namespace URI.
	 * </p>
	 *
	 * @param prefix The prefix for which the method returns the associated namespace.
	 *
	 * @return The namespace that is associated with the specified prefix.
	 *
	 * @maelexample The following example creates a very simple XML object
	 * and outputs the result of a call to <code>getNamespaceForPrefix()</code>
	 * <listing version="2.0">
	 * function createXML():XMLNode {
	 *     var str:String = "&lt;Outer xmlns:exu=\"http://www.example.com/util\">"
	 *         + "&lt;exu:Child id='1' /&gt;"
	 *         + "&lt;exu:Child id='2' /&gt;"
	 *         + "&lt;exu:Child id='3' /&gt;"
	 *         + "&lt;/Outer&gt;";
	 *     return new XML(str).firstChild;
	 * }
	 *
 	 * var xml:XMLNode = createXML();
 	 * trace(xml.getNamespaceForPrefix("exu")); // output: http://www.example.com/util
	 * trace(xml.getNamespaceForPrefix(""));    // output: null
	 * </listing>
	 *
	 * @see XMLNode#getPrefixForNamespace()
	 * @see XMLNode#namespaceURI
	 *
	 * @category Method
	 * @keyword XMLNode.getNamespaceForPrefix, getNamespaceForPrefix
	 *
	 * @helpid
	 * @refpath
	 * @keyword
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public function getNamespaceForPrefix(prefix:String):String
	{
		// iterate _attributes looking for a match
		var name:String;
		for (name in _attributes)
		{
			if (name.indexOf("xmlns") == 0)
			{
				if (name.charCodeAt(5) == 58) // 58 = ':'
				{
					var newString:String = name.substring(6);
					if (newString == prefix)
					{
						return _attributes[name];
					}

				}
				else if (prefix.length == 0)
				{
					return _attributes[name];
				}
			}
		}

		// if parent, call up
		if (parentNode !== null)
			return parentNode.getNamespaceForPrefix(prefix);

		return null;
	}

	/**
	 * Returns the prefix that is associated with the specified namespace URI for the node. To determine
	 * the prefix, <code>getPrefixForNamespace()</code> searches up the XML hierarchy from the node, as
	 * necessary, and returns the prefix of the first <code>xmlns</code> declaration with a namespace URI
	 * that matches <code>ns</code>.
	 *
	 * <p>If there is no <code>xmlns</code>
	 * assignment for the given URI, the method returns <code>null</code>. If there is an
	 * <code>xmlns</code> assignment for the given URI but no prefix is associated with the assignment,
	 * the method returns an empty string
	 * (<code>""</code>).
	 * </p>
	 *
	 * @param ns The namespace URI for which the method returns the associated prefix.
	 *
	 * @return The prefix associated with the specified namespace.
	 *
	 * @maelexample The following example creates a very simple XML object
	 * and outputs the result of a call to the <code>getPrefixForNamespace()</code> method.
	 * The <code>Outer</code> XML node, which is represented by the <code>xmlDoc</code> variable,
	 * defines a namespace URI and assigns it to the <code>exu</code>
	 * prefix. Calling the <code>getPrefixForNamespace()</code> method with the defined
	 * namespace URI ("http://www.example.com/util")
	 * returns the prefix <code>exu</code>, but calling this method with an
	 * undefined URI ("http://www.example.com/other") returns <code>null</code>.
	 * The first <code>exu:Child</code> node, which is represented by the
	 * <code>child1</code> variable, also defines a
	 * namespace URI ("http://www.example.com/child"), but does not assign it to a prefix.
	 * Calling this method on the defined, but unassigned, namespace URI returns an empty string.
	 * <listing version="2.0">
	 * function createXML():XMLNode {
	 *     var str:String = "&lt;Outer xmlns:exu=\"http://www.example.com/util\">"
	 *         + "&lt;exu:Child id='1' xmlns=\"http://www.example.com/child\"/&gt;"
	 *         + "&lt;exu:Child id='2' /&gt;"
	 *         + "&lt;exu:Child id='3' /&gt;"
	 *         + "&lt;/Outer&gt;";
	 *     return new XML(str).firstChild;
	 * }
	 *
	 * var xmlDoc:XMLNode = createXML();
	 * trace(xmlDoc.getPrefixForNamespace("http://www.example.com/util")); // output: exu
	 * trace(xmlDoc.getPrefixForNamespace("http://www.example.com/other")); // output: null
	 *
	 * var child1:XMLNode = xmlDoc.firstChild;
	 * trace(child1.getPrefixForNamespace("http://www.example.com/child")); // output: [empty string]
	 * trace(child1.getPrefixForNamespace("http://www.example.com/other")); // output: null
	 * </listing>
	 *
	 * @see XMLNode#getNamespaceForPrefix()
	 * @see XMLNode#namespaceURI
	 *
	 * @category Method
	 * @helpid
	 * @refpath
	 * @keyword
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public function getPrefixForNamespace(ns:String):String
	{
		// iterate _attributes looking for a match
		var name:String;
		for (name in _attributes)
		{
			// if name starts with "xmlns" and name == ns)
			if (name.indexOf("xmlns") == 0)
			{
				if (_attributes[name] == ns)
				{
					if (name.charCodeAt(5) == 58) // 58 = ':'
					{
						return name.substring(6);
					}
					else
					{
						return "";
					}
				}
			}
		}

		// if parent, call up
		if (parentNode !== null)
			return parentNode.getPrefixForNamespace(ns);

		return null;
	}

	/**
	 * The local name portion of the XML node's name. This is the element name without
	 * the namespace prefix. For example, the node
	 * <code>&lt;contact:mailbox/&gt;bob&#64;example.com&lt;/contact:mailbox&gt;</code>
	 * has the local name "mailbox", and the prefix "contact", which comprise the full
	 * element name "contact.mailbox".
	 *
	 * <p>You can access the namespace prefix through the <code>prefix</code> property of
	 * the XML node object. The <code>nodeName</code> property returns the full name
	 * (including the prefix and the local name).</p>
	 *
	 * @maelexample This example uses a SWF file and an XML file located in the same directory.
	 * The XML file, named "SoapSample.xml" contains the following:
	 *
	 * <pre><code>
	 * &lt;?xml version="1.0"?&gt;
	 * &lt;soap:Envelope xmlns:soap="http://www.w3.org/2001/12/soap-envelope"&gt;
	 *   &lt;soap:Body xmlns:w="http://www.example.com/weather"&gt;
	 *     &lt;w:GetTemperature&gt;
	 *       &lt;w:City&gt;San Francisco&lt;/w:City&gt;
	 *     &lt;/w:GetTemperature&gt;
	 *   &lt;/soap:Body&gt;
	 * &lt;/soap:Envelope&gt;
	 * </code></pre>
	 *
	 * <p>The source for the SWF file contains the following script (note the comments for the
	 * Output strings):</p>
	 *
	 * <listing version="2.0">
	 * var xmlDoc:XML = new XML()
	 * xmlDoc.ignoreWhite = true;
	 * xmlDoc.load("SoapSample.xml")
	 * xmlDoc.onLoad = function(success:Boolean)
	 * {
	 * 	var tempNode:XMLNode = xmlDoc.childNodes[0].childNodes[0].childNodes[0];
	 * 	trace("w:GetTemperature localname: " + tempNode.localName); // Output: ... GetTemperature
	 * 	var soapEnvNode:XMLNode = xmlDoc.childNodes[0];
	 * 	trace("soap:Envelope localname: " + soapEnvNode.localName); // Output: ... Envelope
	 * }
	 * </listing>
	 *
	 * @helpid
	 * @refpath
	 * @keyword
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public function get localName():String
	{
		if (nodeName == null) // text node
			return null;

		var i:int = nodeName.indexOf(":");
		if (i != -1)
		{
			return nodeName.substring (i+1);
		}
		return nodeName;
	}

	/**
	 * The prefix portion of the XML node name. For example, the node
	 * <code>&lt;contact:mailbox/&gt;bob&#64;example.com&lt;/contact:mailbox&gt;</code> prefix
	 * "contact" and the local name "mailbox", which comprise the full element name "contact.mailbox".
	 *
	 * <p>The <code>nodeName</code> property of an XML node object returns the full name
	 * (including the prefix and the  local name). You can access the local name portion of the
	 * element's name via the <code>localName</code> property. </p>
	 *
	 *
	 * @maelexample A directory contains a SWF file and an XML file. The XML file, named
	 * "SoapSample.xml" contains the following:
	 *
	 * <pre><code>
	 * &lt;?xml version="1.0"?&gt;
	 * &lt;soap:Envelope xmlns:soap="http://www.w3.org/2001/12/soap-envelope"&gt;
	 *   &lt;soap:Body xmlns:w="http://www.example.com/weather"&gt;
	 *     &lt;w:GetTemperature&gt;
	 *       &lt;w:City&gt;San Francisco&lt;/w:City&gt;
	 *     &lt;/w:GetTemperature&gt;
	 *   &lt;/soap:Body&gt;
	 * &lt;/soap:Envelope&gt;
	 * </code></pre>
	 *
	 * <p>The source for the SWF file contains the following script (note the comments for
	 * the Output strings):</p>
	 *
	 * <listing version="2.0">
	 * var xmlDoc:XML = new XML();
	 * xmlDoc.ignoreWhite = true;
	 * xmlDoc.load("SoapSample.xml");
	 * xmlDoc.onLoad = function(success:Boolean)
	 * {
	 * 	var tempNode:XMLNode = xmlDoc.childNodes[0].childNodes[0].childNodes[0];
	 * 	trace("w:GetTemperature prefix: " + tempNode.prefix); // Output: ... w
	 * 	var soapEnvNode:XMLNode = xmlDoc.childNodes[0];
	 * 	trace("soap:Envelope prefix: " + soapEnvNode.prefix); // Output: ... soap
	 * }
	 * </listing>
	 *
	 * @helpid
	 * @refpath
	 * @keyword
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public function get prefix():String
	{
		if (nodeName == null) // text node
			return null;

		var i:int = nodeName.indexOf(":");
		if (i != -1)
		{
			return nodeName.substring (0, i);
		}

		return "";
	}

	/**
	 * If the XML node has a prefix, <code>namespaceURI</code> is the value of the <code>xmlns</code>
	 * declaration for that prefix (the URI), which is typically called the namespace URI.
	 * The <code>xmlns</code> declaration is in the current node or in a node higher in the XML
	 * hierarchy.
	 *
	 * <p>If the XML node does not have a prefix, the value of the <code>namespaceURI</code> property
	 * depends on whether there is a default namespace defined (as in
	 * <code>xmlns="http://www.example.com/"</code>). If there is a default namespace, the value of
	 * the <code>namespaceURI</code> property is the value of the default namespace.
	 * If there is no default namespace, the <code>namespaceURI</code> property for
	 * that node is an empty string (<code>""</code>).</p>
	 *
	 * <p>You can use the <code>getNamespaceForPrefix()</code> method to identify the namespace associated with a
	 * specific prefix. The <code>namespaceURI</code> property returns the prefix associated with the node name.</p>
	 *
	 * @tiptext The URI of the namespace to which the XML node's prefix resolves.
	 *
	 * @maelexample The following example shows how the <code>namespaceURI</code> property is affected by the use of prefixes. A directory contains a SWF file and an XML file. The XML file, named <code>SoapSample.xml</code> contains the following tags.
	 *
	 * <pre><code>
	 * &lt;?xml version="1.0"?&gt;
	 * &lt;soap:Envelope xmlns:soap="http://www.w3.org/2001/12/soap-envelope"&gt;
	 *   &lt;soap:Body xmlns:w="http://www.example.com/weather"&gt;
	 *     &lt;w:GetTemperature&gt;
	 *       &lt;w:City&gt;San Francisco&lt;/w:City&gt;
	 *     &lt;/w:GetTemperature&gt;
	 *   &lt;/soap:Body&gt;
	 * &lt;/soap:Envelope&gt;
	 * </code></pre>
	 *
	 * <p>The source for the SWF file contains the following script (note the comments for the Output strings). For <code>tempNode</code>, which represents the <code>w:GetTemperature</code> node, the value of <code>namespaceURI</code> is defined in the <code>soap:Body</code> tag. For <code>soapBodyNode</code>, which represents the <code>soap:Body</code> node, the value of <code>namespaceURI</code> is determined by the definition of the <code>soap</code> prefix in the node above it, rather than the definition of the <code>w</code> prefix that the <code>soap:Body</code> node contains.</p>
	 *
	 * <listing version="2.0">
	 * var xmlDoc:XML = new XML();
	 * xmlDoc.load("SoapSample.xml");
	 * xmlDoc.ignoreWhite = true;
	 * xmlDoc.onLoad = function(success:Boolean)
	 * {
	 * 	var tempNode:XMLNode = xmlDoc.childNodes[0].childNodes[0].childNodes[0];
	 * 	trace("w:GetTemperature namespaceURI: " + tempNode.namespaceURI);
	 * 		// Output: ... http://www.example.com/weather
	 *
	 * 	trace("w:GetTemperature soap namespace: " + tempNode.getNamespaceForPrefix("soap"));
	 * 		// Output: ... http://www.w3.org/2001/12/soap-envelope
	 *
	 * 	var soapBodyNode:XMLNode = xmlDoc.childNodes[0].childNodes[0];
	 * 	trace("soap:Envelope namespaceURI: " + soapBodyNode.namespaceURI);
	 * 		// Output: ... http://www.w3.org/2001/12/soap-envelope
	 * }
	 * </listing>
	 *
	 * <p>The following example uses XML tags without prefixes. It uses a SWF file and an XML file located in the same directory.
	 * The XML file, named <code>NoPrefix.xml</code> contains the following tags.
	 *
	 * <pre><code>
	 * &lt;?xml version="1.0"?&gt;
	 * &lt;rootnode&gt;
	 *   &lt;simplenode xmlns="http://www.w3.org/2001/12/soap-envelope"&gt;
	 *     &lt;innernode /&gt;
	 *   &lt;/simplenode&gt;
	 * &lt;/rootnode&gt;
	 * </code></pre>

	 * The source for the SWF file contains the following script (note the comments for the Output strings). The <code>rootNode</code> does
	 * not have a default namespace, so its <code>namespaceURI</code> value is an empty string.
	 * The <code>simpleNode</code> defines a default namespace, so its <code>namespaceURI</code>
	 * value is the default namespace. The <code>innerNode</code> does not define a default namespace,
	 * but uses the default namespace defined by <code>simpleNode</code>, so its
	 * <code>namespaceURI</code> value is the same as that of <code>simpleNode</code>.</p>
	 *
	 * <listing version="2.0">
	 * var xmlDoc:XML = new XML()
	 * xmlDoc.load("NoPrefix.xml");
	 * xmlDoc.ignoreWhite = true;
	 * xmlDoc.onLoad = function(success:Boolean)
	 * {
	 *     var rootNode:XMLNode = xmlDoc.childNodes[0];
	 *     trace("rootNode Node namespaceURI: " + rootNode.namespaceURI);
	 *         // Output: [empty string]
	 *
	 *     var simpleNode:XMLNode = xmlDoc.childNodes[0].childNodes[0];
	 *     trace("simpleNode Node namespaceURI: " + simpleNode.namespaceURI);
	 *         // Output: ... http://www.w3.org/2001/12/soap-envelope
	 *
	 *     var innerNode:XMLNode = xmlDoc.childNodes[0].childNodes[0].childNodes[0];
	 *     trace("innerNode Node namespaceURI: " + innerNode.namespaceURI);
	 *         // Output: ... http://www.w3.org/2001/12/soap-envelope
	 * }
	 * </listing>
	 *
	 * @see #getNamespaceForPrefix()
	 * @see #getPrefixForNamespace()
	 *
	 * @helpid
	 * @refpath
	 * @keyword
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public function get namespaceURI():String
	{
		if (nodeName == null) // text node
			return null;

		var s:String = String(this.prefix);

		return this.getNamespaceForPrefix (s);
	}
}

/*
 * [ggrossman 04/07/05] API SCRUB
 * - Added _NodeType_ inner class with enum constants for node types.
 *   Moved here from _XMLDocument_
 * - Changed type of _nodeType_ from _int_ to _uint_
 * - [srahim 04/05/05] Doc scrub
 */

}
