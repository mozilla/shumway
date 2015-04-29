/*
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package flash.xml
{

/**
 * @private Internal only
 * This class is package internal and only intended for
 * use by internal Flash Player code.
 *
 * The <code>XMLTag</code> class represents a single XML
 * tag.  This class is part of the XML pull parser implemented
 * by the <code>XMLParser</code> class.
 *
 * <p>To use <code>XMLTag</code>, create an instance of it
 * with the <code>new</code> operator, and then pass it
 * repeatedly to the <code>XMLParser.getNext</code> method
 * to parse tags from an XML document.</p>
 */
[native]
internal final class XMLTag
{
  /**
   * The type of the XML tag.  The type constants
   * are specified in the <code>XMLDocument</code> class,
   * and may be one of <code>ELEMENT_NODE</code>,
   * <code>TEXT_NODE</code>, <code>XML_DECLARATION</code>,
   * <code>DOCUMENT_TYPE_NODE</code>, <code>COMMENT_NODE</code>,
   * or <code>PROCESSING_INSTRUCTION_NODE</code>.
   */
  public native function get type():uint;
  public native function set type(value:uint):void;

  /**
   * If <code>true</code>, the XML tag represents
   * an empty element (e.g. <code>&lt;emptyTag/&gt;</code>).
   */
  public native function get empty():Boolean;
  public native function set empty(value:Boolean):void;

  /**
   * The text of the XML tag.
   */
  public native function get value():String;
  public native function set value(v:String):void;

  /**
   * The attributes of the XML tag, specified as an
   * associative array or null if no attributes.
   */
  public native function get attrs():Object;
  public native function set attrs(value:Object):void;
}

/*
 * [ggrossman 04/07/05] API SCRUB
 * - _XMLTag_ is now marked package internal instead of public.
 *   It is an internal class and should not be documented.
 */


}
