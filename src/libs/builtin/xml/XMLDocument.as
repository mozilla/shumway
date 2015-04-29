/*
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package flash.xml
{
//
// XMLDocument
//

/**
 * The XMLDocument class represents the legacy XML object
 * that was present in ActionScript 2.0. It was renamed in ActionScript 3.0
 * to XMLDocument to avoid name conflicts with the new
 * XML class in ActionScript 3.0. In ActionScript 3.0,
 * it is recommended that you use the new 
 * <a href="../../XML.html">XML</a> class and related classes,
 * which support E4X (ECMAScript for XML).
 *
 * <p>The XMLDocument class, as well as XMLNode and XMLNodeType, are present for backward
 * compatibility. The functionality for loading XML documents can now be found in the
 * URLLoader class.</p>
 * 
 * @includeExample examples\XMLDocumentExample.as -noswf
 * 
 * @see flash.net.URLLoader
 * @see XML XML class
 * @playerversion Flash 9
 * @langversion 3.0
 */
[native]
public class XMLDocument extends XMLNode
{
    private static const kNoError:int                         = 0;
    private static const kEndOfDocument:int                   = -1;
    private static const kUnterminatedCdata:int               = -2;
    private static const kUnterminatedXmlDeclaration:int      = -3;
    private static const kUnterminatedDoctypeDeclaration:int  = -4;
    private static const kUnterminatedComment:int             = -5;
    private static const kMalformedElement:int                = -6;
    private static const kOutOfMemory:int                     = -7;
    private static const kUnterminatedAttributeValue:int      = -8;	
    private static const kUnterminatedElement:int             = -9;	
    private static const kElementNeverBegun:int               = -10;	

	/**
	 * A string that specifies information about a document's XML declaration. 
	 * After the XML document is parsed into an XMLDocument object, this property is set
	 * to the text of the document's XML declaration. This property is set using a string
	 * representation of the XML declaration, not an XMLNode object. If no XML declaration
	 * is encountered during a parse operation, the property is set to <code>null</code>. 
	 * The <code>XMLDocument.toString()</code> method outputs the contents of the 
	 * <code>XML.xmlDecl</code> property before any other text in the XML object. 
	 * If the <code>XML.xmlDecl</code> property contains <code>null</code>, 
	 * no XML declaration is output.
	 * @maelexample The following example creates a text field called <code>my_txt</code> 
	 * that has the same dimensions as the Stage. The text field displays properties of the XML packet that loads into the SWF file. The doc type declaration displays in <code>my_txt</code>. Add the following ActionScript to your FLA or AS file:
	 * <listing>
	 * <code>var my_fmt:TextFormat = new TextFormat();</code>
	 * <code>my_fmt.font = "_typewriter";</code>
	 * <code>my_fmt.size = 12;</code>
	 * <code>my_fmt.leftMargin = 10;</code>
	 * 
	 * <code>this.createTextField("my_txt", this.getNextHighestDepth(), 0, 0, Stage.width, Stage.height);</code>
	 * <code>my_txt.border = true;</code>
	 * <code>my_txt.multiline = true;</code>
	 * <code>my_txt.wordWrap = true;</code>
	 * <code>my_txt.setNewTextFormat(my_fmt);</code>
	 * 
	 * <code>var my_xml:XML = new XML();</code>
	 * <code>my_xml.ignoreWhite = true;</code>
	 * <code>my_xml.onLoad = function(success:Boolean) {</code>
	 * <code>  var endTime:Number = getTimer();</code>
	 * <code>  var elapsedTime:Number = endTime-startTime;</code>
	 * <code>  if (success) {</code>
	 * <code>    my_txt.text = "xmlDecl:"+newline+my_xml.xmlDecl+newline+newline;</code>
	 * <code>    my_txt.text += "contentType:"+newline+my_xml.contentType+newline+newline;</code>
	 * <code>    my_txt.text += "docTypeDecl:"+newline+my_xml.docTypeDecl+newline+newline;</code>
	 * <code>    my_txt.text += "packet:"+newline+my_xml.toString()+newline+newline;</code>
	 * <code>  } else {</code>
	 * <code>    my_txt.text = "Unable to load remote XML."+newline+newline;</code>
	 * <code>  }</code>
	 * <code>  my_txt.text += "loaded in: "+elapsedTime+" ms.";</code>
	 * <code>};</code>
	 * <code>my_xml.load("http://www.helpexamples.com/crossdomain.xml");</code>
	 * <code>var startTime:Number = getTimer();</code>
	 * </listing>
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
    public var xmlDecl:Object = null;
	
	/**
	 * Specifies information about the XML document's <code>DOCTYPE</code> declaration. 
	 * After the XML text has been parsed into an XMLDocument object, the 
	 * <code>XMLDocument.docTypeDecl</code> property of the XMLDocument object is set to the 
	 * text of the XML document's <code>DOCTYPE</code> declaration 
	 * (for example, <code>&lt;!DOCTYPE</code> <code>greeting SYSTEM "hello.dtd"&gt;</code>). 
	 * This property is set using a string representation of the <code>DOCTYPE</code> declaration, 
	 * not an XMLNode object.
	 * <p>The legacy ActionScript XML parser is not a validating parser. The <code>DOCTYPE</code> 
	 * declaration is read by the parser and stored in the <code>XMLDocument.docTypeDecl</code> property,
	 * but no DTD validation is performed.</p>
	 * <p>If no <code>DOCTYPE</code> declaration was encountered during a parse operation, 
	 * the <code>XMLDocument.docTypeDecl</code> property is set to <code>null</code>. 
	 * The <code>XML.toString()</code> method outputs the contents of <code>XML.docTypeDecl</code>
	 * immediately after the XML declaration stored in <code>XML.xmlDecl</code>, and before any other
	 * text in the XML object. If <code>XMLDocument.docTypeDecl</code> is null, no
	 * <code>DOCTYPE</code> declaration is output.</p>
	 * @maelexample The following example uses the <code>XML.docTypeDecl</code> property to set the <code>DOCTYPE</code> declaration for an XML object:
	 * <listing>
	 * <code><em>my_xml</em></code>.<code>docTypeDecl = "&lt;!DOCTYPE greeting SYSTEM \"hello.dtd\"&gt;";</code>
	 * </listing>
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public var docTypeDecl:Object = null;

	 /**
	 * An Object containing the nodes of the XML that have an <code>id</code> attribute assigned. 
	 * The names of the properties of the object (each containing a node) match the values of the 
	 * <code>id</code> attributes.
	 * 
	 * <p>Consider the following XMLDocument object:</p>
	 * 
	 * <listing>
	 * &lt;employee id='41'&gt;
	 * 	&lt;name&gt;
	 * 		John Doe
	 * 	&lt;/name&gt;
	 * 	&lt;address&gt;
	 * 		601 Townsend St.
	 * 	&lt;/address&gt;
	 * &lt;/employee&gt;
	 * 
	 * &lt;employee id='42'&gt;
	 * 	&lt;name&gt;
	 * 		Jane Q. Public
	 * 	&lt;/name&gt;
	 * &lt;/employee&gt;
	 * &lt;department id="IT"&gt;
	 * 	Information Technology
	 * &lt;/department&gt;
	 * </listing>
	 * 
	 * <p>In this example, the <code>idMap</code> property for this XMLDocument object is an Object with 
	 * three properties: <code>41</code>, <code>42</code>, and <code>IT</code>. Each of these 
	 * properties is an XMLNode that has the matching <code>id</code> value. For example, 
	 * the <code>IT</code> property of the <code>idMap</code> object is this node:</p> 
	 * 
	 * <listing>
	 * &lt;department id="IT"&gt;
	 * 	Information Technology
	 * &lt;/department&gt;
	 * </listing>
	 * 
	 * <p>You must use the <code>parseXML()</code> method on the XMLDocument object for the 
	 * <code>idMap</code> property to be instantiated.</p>
	 * 
	 * <p>If there is more than one XMLNode with the same <code>id</code> value, the matching property
	 * of the <code>idNode</code> object is that of the last node parsed. For example:</p>
	 * 
	 * <listing>
	 * var x1:XML = new XMLDocument("&lt;a id='1'&gt;&lt;b id='2' /&gt;&lt;c id='1' /&gt;&lt;/a&gt;");
	 * x2 = new XMLDocument();
	 * x2.parseXML(x1);
	 * trace(x2.idMap['1']);
	 * </listing>
	 * 
	 * This will output the <code>&lt;c></code> node: 
	 * 
	 * <listing>
	 * <code>&lt;c id='1' /&gt;</code>
	 * </listing>
	 * 
	 * @maelexample Create a text file named "idMapTest.xml" containing the following text:
	 * 
	 * <listing>&lt;?xml version="1.0"?&gt; 
	 * &lt;doc xml:base="http://example.org/today/" xmlns:xlink="http://www.w3.org/1999/xlink"&gt; 
	 *   &lt;head&gt; 
	 *     &lt;title&gt;Virtual Library&lt;/title&gt; 
	 *   &lt;/head&gt; 
	 *   &lt;body&gt; 
	 *     &lt;paragraph id="linkP1"&gt;See &lt;link xlink:type="simple" xlink:href="new.xml"&gt;what's 
	 *       new&lt;/link&gt;!&lt;/paragraph&gt; 
	 *     &lt;paragraph&gt;Check out the hot picks of the day!&lt;/paragraph&gt; 
	 *     &lt;olist xml:base="/hotpicks/"&gt; 
	 *       &lt;item&gt; 
	 *         &lt;link id="foo" xlink:type="simple" xlink:href="pick1.xml"&gt;Hot Pick #1&lt;/link&gt; 
	 *       &lt;/item&gt; 
	 *       &lt;item&gt; 
	 *         &lt;link id="bar" xlink:type="simple" xlink:href="pick2.xml"&gt;Hot Pick #2&lt;/link&gt; 
	 *       &lt;/item&gt; 
	 *       &lt;item&gt; 
	 *         &lt;link xlink:type="simple" xlink:href="pick3.xml"&gt;Hot Pick #3&lt;/link&gt; 
	 *       &lt;/item&gt; 
	 *     &lt;/olist&gt;
	 *   &lt;/body&gt; 
	 *  &lt;/doc&gt;
	 * </listing>
	 * 
	 * <p>Then create a SWF file in the same directory as the XML file. Include the following
	 * script in the SWF:</p>
	 * 
	 * <listing>
	 * var readXML = new XMLDocument();
	 * readXML.load("idMapTest.xml");
	 * readXML.onLoad = function(success) {
	 * 	myXML = new XMLDocument();
	 * 	myXML.parseXML(readXML);	
	 * 	for (var x in myXML.idMap){
	 * 		 trace('idMap.' + x + " = " + newline + myXML.idMap[x]);
	 * 		 trace('____________' + newline);
	 * 	}
	 * }
	 * </listing>
	 * 
	 * <p>When you test the SWF file, the following output is generated:</p>
	 * 
	 * <listing>
	 * idMap.bar = 
	 * &lt;link id="bar" xlink:type="simple" xlink:href="pick2.xml"&gt;Hot Pick #2&lt;/link&gt;
	 * ____________
	 * 
	 * idMap.foo = 
	 * &lt;link id="foo" xlink:type="simple" xlink:href="pick1.xml"&gt;Hot Pick #1&lt;/link&gt;
	 * ____________
	 * 
	 * idMap.linkP1 = 
	 * &lt;paragraph id="linkP1"&gt;See &lt;link xlink:type="simple" xlink:href="new.xml"&gt;what&apos;s 
	 * 
	 *       new&lt;/link&gt;!&lt;/paragraph&gt;
	 * ____________
	 * </listing>
	 * 
	 * @langversion 3.0
	 * 
	 * @playerversion Flash 9
	 */
	public var idMap:Object = {};
	
	/**
	 * When set to <code>true</code>, text nodes that contain only white space are discarded during the parsing process. Text nodes with leading or trailing white space are unaffected. The default setting is <code>false</code>. 
	 * <p>You can set the <code>ignoreWhite</code> property for individual XMLDocument objects, as the following code shows:</p>
	 * <listing>
	 * my_xml.ignoreWhite = true;
	 * </listing>
	 *
	 * @maelexample The following example loads an XML file with a text node that contains only white space; the <code>foyer</code> tag comprises fourteen space characters. To run this example, create a text file named <em>flooring.xml</em>, and copy the following tags into it:
	 * <listing>
	 * &lt;house&gt;
	 *    &lt;kitchen&gt;   ceramic tile   &lt;/kitchen&gt;
	 *    &lt;bathroom&gt;linoleum&lt;/bathroom&gt;
	 *    &lt;foyer&gt;              &lt;/foyer&gt;
	 * &lt;/house&gt;
	 * </listing>
	 * <p>Create a new Flash document named <em>flooring.fla</em> and save it to the same directory as the XML file. Place the following code into the main Timeline:</p>
	 * <listing>
	 * // create a new XML object
	 * var flooring:XML = new XML();
	 * 
	 * // set the ignoreWhite property to true (default value is false)
	 * flooring.ignoreWhite = true;
	 * 
	 * // After loading is complete, trace the XML object
	 * flooring.onLoad = function(success:Boolean) {
	 *   trace(flooring);
	 * }
	 * 
	 * // load the XML into the flooring object
	 * flooring.load("flooring.xml");
	 * 
	 * // output (line breaks added for clarity):
	 * &lt;house&gt;
	 *    &lt;kitchen&gt;   ceramic tile   &lt;/kitchen&gt;
	 *    &lt;bathroom&gt;linoleum&lt;/bathroom&gt;
	 *    &lt;foyer /&gt;
	 * &lt;/house&gt;
	 * 
	 * </listing>
	 * <p>If you then change the setting of <code>flooring.ignoreWhite</code> to <code>false</code>, or simply remove that line of code entirely, the fourteen space characters in the <code>foyer</code> tag will be preserved:</p>
	 * <listing>
	 * ...
	 * // set the ignoreWhite property to false (default value)
	 * flooring.ignoreWhite = false;
	 * ...
	 * // output (line breaks added for clarity):
	 * &lt;house&gt;
	 *    &lt;kitchen&gt;   ceramic tile   &lt;/kitchen&gt;
	 *    &lt;bathroom&gt;linoleum&lt;/bathroom&gt;
	 *    &lt;foyer&gt;              &lt;/foyer&gt;
	 * &lt;/house&gt;
	 * 
	 * </listing>
	 * <span class="flashonly"><p>The XML_blogTracker.fla and XML_languagePicker.fla files in the ActionScript samples folder also contain a code example. The following are typical paths to this folder:</p>
	 * <ul>
	 *   <li>Windows: <i>boot drive</i>\Program Files\Macromedia\Flash 8\Samples and Tutorials\Samples\ActionScript </li>
	 *   <li>Macintosh: <i>Macintosh HD</i>/Applications/Macromedia Flash 8/Samples and Tutorials/Samples/ActionScript </li>
	 *   <li></li>
	 * </ul>
	 * </span>
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public var ignoreWhite:Boolean = false;

	/**
	 * Creates a new XMLDocument object. You must use the constructor to create an XMLDocument object before you call any of the methods of the XMLDocument class.
	 * <p><strong>Note: </strong>Use the <code>createElement()</code> and <code>createTextNode()</code> methods to add elements and text nodes to an XML document tree.</p>
	 *
	 * @param source The XML text parsed to create the new XMLDocument object. 
	 *
	 * @maelexample The following example creates a new, empty XMLDocument object:
	 * <listing>
	 * var my_xml:XML = new XML();
	 * </listing>
	 * <p>The following example creates an XML object by parsing the XML text specified in the <code>source</code> parameter, and populates the newly created XML object with the resulting XML document tree:</p>
	 * <listing>
	 * var other_xml:XML = new XML("&lt;state name=\"California\"&gt;&lt;city&gt;San Francisco&lt;/city&gt;&lt;/state&gt;");
	 * </listing>
	 *
	 * @see XMLDocument#createElement()
	 * @see XMLDocument#createTextNode()
	 * @langversion 3.0
	 * @playerversion Flash 9
	 */	
	
	public function XMLDocument(source:String=null)
	{
		super(1, "");
		nodeName = null;

		if (source != null) {
			parseXML(source);
		}			
	}

	/**
	 * Creates a new XMLNode object with the name specified in the parameter. 
	 * The new node initially has no parent, no children, and no siblings. 
	 * The method returns a reference to the newly created XMLNode object
	 * that represents the element. This method and the <code>XMLDocument.createTextNode()</code>
	 * method are the constructor methods for creating nodes for an XMLDocument object.
	 *
	 * @param name The tag name of the XMLDocument element being created.
	 *
	 * @return An XMLNode object.
	 *
	 * @maelexample The following example creates three XML nodes using the <code>createElement()</code> method:
	 * <listing>
	 * // create an XML document
	 * var doc:XML = new XML();
	 * 
	 * // create three XML nodes using createElement()
	 * var element1:XMLNode = doc.createElement("element1");
	 * var element2:XMLNode = doc.createElement("element2");
	 * var element3:XMLNode = doc.createElement("element3");
	 * 
	 * // place the new nodes into the XML tree
	 * doc.appendChild(element1);
	 * element1.appendChild(element2);
	 * element1.appendChild(element3);
	 * 
	 * trace(doc);
	 * // output: &lt;element1&gt;&lt;element2 /&gt;&lt;element3 /&gt;&lt;/element1&gt;
	 * </listing>
	 *
	 * @see XMLDocument#createTextNode()
	 * @langversion 3.0
	 * @playerversion Flash 9
	 */
	public function createElement(name:String):XMLNode
	{
		return new XMLNode(1, name);
	}

	/**
	 * Creates a new XML text node with the specified text. The new node initially has no parent, and text nodes cannot have children or siblings. This method returns a reference to the XMLDocument object that represents the new text node. This method and the <code>XMLDocument.createElement()</code> method are the constructor methods for creating nodes for an XMLDocument object.
	 *
	 *
	 * @param value The text used to create the new text node.
	 *
	 * @return An XMLNode object.
	 *
	 * @maelexample The following example creates two XML text nodes using the <code>createTextNode()</code> method, and places them into existing XML nodes:
	 * <listing>
	 * // create an XML document
	 * var doc:XML = new XML();
	 * 
	 * // create three XML nodes using createElement()
	 * var element1:XMLNode = doc.createElement("element1");
	 * var element2:XMLNode = doc.createElement("element2");
	 * var element3:XMLNode = doc.createElement("element3");
	 * 
	 * // place the new nodes into the XML tree
	 * doc.appendChild(element1);
	 * element1.appendChild(element2);
	 * element1.appendChild(element3);
	 * 
	 * // create two XML text nodes using createTextNode()
	 * var textNode1:XMLNode = doc.createTextNode("textNode1 String value");
	 * var textNode2:XMLNode = doc.createTextNode("textNode2 String value");
	 * 
	 * // place the new nodes into the XML tree
	 * element2.appendChild(textNode1);
	 * element3.appendChild(textNode2);
	 * 
	 * trace(doc);
	 * // output (with line breaks added between tags):
	 * // &lt;element1&gt;
	 * //    &lt;element2&gt;textNode1 String value&lt;/element2&gt;
	 * //    &lt;element3&gt;textNode2 String value&lt;/element3&gt;
	 * // &lt;/element1&gt;
	 * </listing>
	 *
	 *
	 * @see XMLDocument#createElement()
	 * @langversion 3.0
	 * @playerversion Flash 9
	 */
	public function createTextNode(text:String):XMLNode
	{
		return new XMLNode(3, text);
	}

	/**
	 * Returns a string representation of the XML object.
	 *
 	 * @playerversion Flash 9
         * @langversion 3.0
         * @return A string representation of the XML object.
 	 */
	public override function toString():String
	{
		var s:String = "";
		if (xmlDecl != null) {
			s += xmlDecl;
		}
		if (docTypeDecl != null) {
			s += docTypeDecl;
		}

		// code is duplicated until super() works
		//result += super();
		if (hasChildNodes())
		{
			for (var node:XMLNode = firstChild;
					node != null;
					node = node.nextSibling)
			{
				s += node.toString();;
			}
		}
		else 
		{
			s += "<>";
		}

		return s;
	}

	/**
	 * Parses the XML text specified in the <code>value</code> parameter
     * and populates the specified XMLDocument object with the resulting XML tree. Any existing trees in the XMLDocument object are discarded.
	 *
	 * @param source The XML text to be parsed and passed to the specified XMLDocument object.
	 *
	 * @maelexample The following example creates and parses an XML packet:
	 * <listing>
	 * var xml_str:String = "&lt;state name=\"California\"&gt;
	 * &lt;city&gt;San Francisco&lt;/city&gt;&lt;/state&gt;"
	 * 
	 * // defining the XML source within the XML constructor:
	 * var my1_xml:XML = new XML(xml_str);
	 * trace(my1_xml.firstChild.attributes.name); // output: California
	 * 
	 * // defining the XML source using the XML.parseXML method:
	 * var my2_xml:XML = new XML();
	 * my2_xml.parseXML(xml_str);
	 * trace(my2_xml.firstChild.attributes.name); // output: California
	 * </listing>
	 *
	 * @langversion 3.0
	 * @playerversion Flash 9
	 */
	public function parseXML(source:String):void
	{
		// Clear out existing nodes
		firstChild = null;
		lastChild  = null;
		childNodes.splice(0); // remove all elements
		attributes = null;
		
		// Native code is used to parse raw elements.
		xmlDecl     = null;
		docTypeDecl = null;

		var parser:XMLParser = new XMLParser();
		parser.startParse(source, ignoreWhite);
		
		var parent:XMLNode = this;

		var result:int;
		var tag:XMLTag = new XMLTag();
		var localStatus:int = 0;
		
		while ((result = parser.getNext(tag)) == kNoError)
		{
			var tagType:int = tag.type;
			var tagValue:String = tag.value;
			if (tagType === 1/*XMLNodeType.ELEMENT_NODE*/)
			{
				var element:XMLNode = new XMLNode (1, tagValue); // createElement
				if (tag.attrs !== null)
				{
					var o:Object = tag.attrs;
					// Copy attributes into DOM object
					if ("id" in o) {
						idMap[o.id] = element;
					}
					element.attributes = o;
				}

				// Is this a closing tag?
				if (tagValue.charCodeAt(0) == 47) // 47 = "/"
				{
					if (tagValue.substr(1) === parent.nodeName)
					{
						parent = parent.parentNode;
					}
					else
					{
						// Unsolicited closing element.
						localStatus = kElementNeverBegun;
					}
				} else {
					parent.appendChild(element);
					if (!tag.empty) {
						parent = element;
					}
				}
			} 
			// Text Nodes and CDATA sections
			else if ((tagType === 3/*XMLNodeType.TEXT_NODE*/) || (tagType === 4/*XMLNodeType.CDATA_NODE*/))
			{
				var element:XMLNode = new XMLNode (3, tagValue); //createTextNode
				parent.appendChild(element);
			}
			else if (tagType === 13/*XMLNodeType.XML_DECLARATION*/)
			{
				if (xmlDecl == null) {
					xmlDecl = "";
				}
				xmlDecl += "<?" + tagValue + "?>";
			}
			else if (tagType === 10/*XMLNodeType.DOCUMENT_TYPE_NODE*/)
			{
				docTypeDecl = tagValue;
			}
			else //if ((tag.type == XMLNodeType.PROCESSING_INSTRUCTION_NODE) || (tag.type == XMLNodeType.COMMENT_NODE))
			{
				// The AS3 XMLDocument code uses the new E4X XMLParser code which
				// returns comment and PI nodes.  Just ignore these nodes for XMLDocument
				// just like we did in AS2.
			}
		}
		
		if(result == kEndOfDocument )
			result = kNoError;
		else
			localStatus = result;

	
		if (parent != this && result == kNoError ) {
			// There must be an unterminated element.
			localStatus = kUnterminatedElement;
		}

		if(localStatus != kNoError)
		{
			// clear the puppy out
			nodeType        = 1;
			nextSibling     = null;
			previousSibling = null;
			parentNode      = null;
			firstChild      = null;
			lastChild       = null;
			childNodes.splice(0); // remove all elements
			attributes     = null;
			nodeName  = "";
			nodeValue = null;
			
			switch(localStatus)
			{
				case kUnterminatedCdata:
					Error.throwError(Error, 1091 /* kXMLUnterminatedCData */);
				break;
				case kUnterminatedXmlDeclaration:
					Error.throwError(Error, 1092 /* kXMLUnterminatedXMLDecl */);
				break;
				case kUnterminatedDoctypeDeclaration:
					Error.throwError(Error, 1093 /* kXMLUnterminatedDocTypeDecl */);
				break;
				case kUnterminatedComment:
					Error.throwError(Error, 1094 /* kXMLUnterminatedComment */);
				break;
				case kMalformedElement:
					Error.throwError(Error, 1090 /* kXMLMalformedElement */);
				break;
				case kOutOfMemory:
					Error.throwError(Error, 1000 /* kOutOfMemoryError */);
				break;
				case kUnterminatedAttributeValue:
					Error.throwError(Error, 1095 /* kXMLUnterminatedAttribute */);
				break;
				case kUnterminatedElement:
					Error.throwError(Error, 1096 /* kXMLUnterminatedElement */);
				break;
				case kElementNeverBegun:
					Error.throwError(Error, 2070 /* kXMLElementNeverBegun */);
				break;
				default:
					Error.throwError(Error, 2071 /* kXMLUnknownError */);
				break;
			}
		}
	}
}

/*
 * [ggrossman 03/24/05] API SCRUB
 * - Expanded abbreviation: Renamed _XMLDoc_ to _XMLDocument_
 * - Removed loading support; use _URLLoader_ and feed the results
 *   to _XMLDocument_.  The loading support really complicated this
 *   class, bringing in all kinds of progress and data notifications
 *   that duplicated other areas of the API.  Enough code needs to be
 *   changed to port AS2 XML code to AS3 that using _URLLoader_ to
 *   actually load the text shouldn't be a huge additional migration
 *   cost.  
 * - _status_ removed, should throw exceptions in _parseXML_ instead
 * - The error constants (_NO_ERROR_, etc.) should be removed.  Made
 *   them _private_ for now.  Instead, we should use regular
 *   exception error messages, just like the rest of AS3.
 * - The node type constants have been moved to _XMLNode_, into
 *   the _NodeType_ inner class.
 * - Filed bug #120455 to have _parseXML_ throw an exception
 *   if parsing fails.
 */

}
