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
    private var _type:uint;
  public function get type():uint {
      trace("is.get type()");
      return _type;
    }
  public function set type(value:uint):void {
      trace("is.set type()");
      _type=value;
    }

  /**
   * If <code>true</code>, the XML tag represents
   * an empty element (e.g. <code>&lt;emptyTag/&gt;</code>).
   */
    private var _empty:Boolean;
  public function get empty():Boolean {
      trace("is.get empty()");
      return _empty;
    }
  public function set empty(value:Boolean):void {
      trace("is.set empty()");
      _empty=value;
    }

  /**
   * The text of the XML tag.
   */
    private var _value:String;
  public function get value():String {
      trace("is.get value()");
      return _value;
    }
  public function set value(v:String):void {
      trace("is.set value()");
      _value=v;
    }

  /**
   * The attributes of the XML tag, specified as an
   * associative array or null if no attributes.
   */
    private var _attrs:Object;
  public function get attrs():Object {
      trace("is.get attrs()");
      return _attrs;
    }
  public function set attrs(value:Object):void {
      trace("is.set attrs()");
      _attrs=value;
    }
}

/*
 * [ggrossman 04/07/05] API SCRUB
 * - _XMLTag_ is now marked package internal instead of public.
 *   It is an internal class and should not be documented.
 */


}
