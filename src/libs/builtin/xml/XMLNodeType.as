/*
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package flash.xml
{

//
// XMLNodeType
//

/**
 * The XMLNodeType class contains constants used with 
 * <code>XMLNode.nodeType</code>. The values are defined
 * by the NodeType enumeration in the
 * W3C DOM Level 1 recommendation: 
 * <a href="http://www.w3.org/TR/1998/REC-DOM-Level-1-19981001/level-one-core.html" target="_blank">http://www.w3.org/TR/1998/REC-DOM-Level-1-19981001/level-one-core.html</a>
 *
 * @see XMLNode#nodeType
 * @playerversion Flash 9
 * @langversion 3.0
 */
[native]
public final class XMLNodeType
{
 	/**
 	 * Specifies that the node is an element.
 	 * This constant is used with <code>XMLNode.nodeType</code>. 
 	 * The value is defined by the NodeType enumeration in the
 	 * W3C DOM Level 1 recommendation: 
 	 * <a href="http://www.w3.org/TR/1998/REC-DOM-Level-1-19981001/level-one-core.html" target="_blank">http://www.w3.org/TR/1998/REC-DOM-Level-1-19981001/level-one-core.html</a>
 	 *
 	 * @see XMLNode#nodeType
 	 * @playerversion Flash 9
     * @langversion 3.0
 	 */
 	public static const ELEMENT_NODE:uint					= 1;

	/**
	 * Specifies that the node is a text node.
	 * This constant is used with <code>XMLNode.nodeType</code>. 
	 * The value is defined by the NodeType enumeration in the
	 * W3C DOM Level 1 recommendation: 
	 * <a href="http://www.w3.org/TR/1998/REC-DOM-Level-1-19981001/level-one-core.html" target="_blank">http://www.w3.org/TR/1998/REC-DOM-Level-1-19981001/level-one-core.html</a>
 	 *
 	 * @see XMLNode#nodeType
	 * @playerversion Flash 9
     * @langversion 3.0
	 */
	public static const TEXT_NODE:uint						= 3;

	[Inspectable(environment="none")] 
	/**
	 * @private Suppressing the following nodes after discussion among
	 * Werner, Shimi and Francis. Our internal parser returns these 
	 * nodes, but XMLDocument either ignores or converts to text 
	 * any node type other than 1 or 3.
	 */
	public static const CDATA_NODE:uint						= 4;

	[Inspectable(environment="none")] 
	/**
	 * @private
	 */
	public static const PROCESSING_INSTRUCTION_NODE:uint	= 7;

	[Inspectable(environment="none")] 
	/**
	 * @private
	 */
	public static const COMMENT_NODE:uint					= 8;

	[Inspectable(environment="none")] 
	/**
	 * @private
	 */
	public static const DOCUMENT_TYPE_NODE:uint				= 10;

	[Inspectable(environment="none")] 
	/**
	 * @private
	 */
	public static const XML_DECLARATION:uint				= 13;
}

}
