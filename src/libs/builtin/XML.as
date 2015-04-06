/* -*- c-basic-offset: 4; indent-tabs-mode: nil; tab-width: 4 -*- */
/* vi: set ts=4 sw=4 expandtab: (add to ~/.vimrc: set modeline modelines=5) */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is [Open Source Virtual Machine.].
 *
 * The Initial Developer of the Original Code is
 * Adobe System Incorporated.
 * Portions created by the Initial Developer are Copyright (C) 2004-2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Adobe AS3 Team
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

package {

// E4X definitions.  based on ECMA-357

[native(cls="XMLClass", gc="exact", instance="XMLObject", methods="auto", construct="override")]
public final dynamic class XML extends Object
{
    // { DontDelete, DontEnum }
    public native static function get ignoreComments():Boolean
    public native static function set ignoreComments(newIgnore:Boolean)

    // { DontDelete, DontEnum }
    public native static function get ignoreProcessingInstructions():Boolean
    public native static function set ignoreProcessingInstructions(newIgnore:Boolean)

    // { DontDelete, DontEnum }
    public native static function get ignoreWhitespace():Boolean
    public native static function set ignoreWhitespace(newIgnore:Boolean)

    // { DontDelete, DontEnum }
    public native static function get prettyPrinting():Boolean
    public native static function set prettyPrinting(newPretty:Boolean)

    // { DontDelete, DontEnum }
    public native static function get prettyIndent():int
    public native static function set prettyIndent(newIndent:int)

    AS3 native static function settings():Object;

    AS3 native static function setSettings(o:Object=null):void;

    AS3 native static function defaultSettings():Object;

    // override (hide) functions from object
    // ISSUE why do we override valueOf?  it does the same thing as the one in Object

    AS3 native function toString ():String;

    // override AS3 methods from Object
    override AS3 native function hasOwnProperty (P=void 0):Boolean;
    override AS3 native function propertyIsEnumerable (P=void 0):Boolean;

    // XML functions
    AS3 native function addNamespace (ns):XML;
    AS3 native function appendChild (child):XML;
    AS3 native function attribute (arg):XMLList;
    AS3 native function attributes():XMLList;
    AS3 native function child (propertyName):XMLList;
    AS3 native function childIndex():int;
    AS3 native function children ():XMLList;
    AS3 native function comments ():XMLList;
    AS3 native function contains (value):Boolean;
    AS3 native function copy ():XML;
    AS3 native function descendants (name="*"):XMLList; // name is optional
    AS3 native function elements (name="*"):XMLList; // name is optional
    AS3 native function hasComplexContent ():Boolean;
    AS3 native function hasSimpleContent ():Boolean;
    AS3 native function inScopeNamespaces ():Array;
    AS3 native function insertChildAfter (child1, child2):*; // undefined or XML
    AS3 native function insertChildBefore (child1, child2):*; // undefined or XML
    AS3 function length ():int { return 1; }
    AS3 native function localName ():Object; // null or String;
    AS3 native function name ():Object; // null or String;
    AS3 native function namespace (prefix:String = null):*;
    AS3 native function namespaceDeclarations ():Array;
    AS3 native function nodeKind ():String;
    AS3 native function normalize ():XML;
    AS3 native function parent ():*; // undefined or String
    AS3 native function processingInstructions (name="*"):XMLList; // name is optional
    AS3 native function prependChild (value):XML;
    AS3 native function removeNamespace (ns):XML;
    AS3 native function replace (propertyName, value):XML;
    AS3 native function setChildren (value):XML;
    AS3 native function setLocalName (name):void;
    AS3 native function setName (name):void;
    AS3 native function setNamespace (ns):void;
    AS3 native function text ():XMLList;
    AS3 native function toXMLString ():String;

    // Bug 652200: level of indirection so JSON sidesteps E4X [[Get]] semantics
    AS3 native function toJSON (k:String):*;

    // Dummy constructor function - This is neccessary so the compiler can do arg # checking for the ctor in strict mode
    // The code for the actual ctor is in XMLClass::construct in the avmplus
    public native function XML(value = void 0);

    AS3 native function valueOf():XML;
}

[native(cls="XMLListClass", gc="exact", instance="XMLListObject", methods="auto", construct="override")]
public final dynamic class XMLList extends Object
{
    AS3 native function toString ():String
    AS3 native function valueOf():XMLList;

    // these Override (hide) the same functions from Object
    override AS3 native function hasOwnProperty (P=void 0):Boolean
    override AS3 native function propertyIsEnumerable (P=void 0):Boolean

    // XMLList functions
    AS3 native function attribute (arg):XMLList;
    AS3 native function attributes():XMLList;
    AS3 native function child (propertyName):XMLList;
    AS3 native function children ():XMLList;
    AS3 native function comments ():XMLList;
    AS3 native function contains (value):Boolean;
    AS3 native function copy ():XMLList;

    // E4X 13.4.4.12, pg 76
    AS3 native function descendants (name="*"):XMLList; // name is optional

    AS3 native function elements (name="*"):XMLList; // name is optional
    AS3 native function hasComplexContent ():Boolean;
    AS3 native function hasSimpleContent ():Boolean;
    AS3 native function length ():int;
    AS3 native function name ():Object;  // null or a string;
    AS3 native function normalize ():XMLList;
    AS3 native function parent ():*; // undefined or XML;
    AS3 native function processingInstructions (name="*"):XMLList; // name is optional
    AS3 native function text ():XMLList;
    AS3 native function toXMLString ():String;

    // These are not in the spec but work if the length of the XMLList is one
    // (Function just gets propagated to the first and only list element)
    AS3 native function addNamespace (ns):XML;
    AS3 native function appendChild (child):XML;
    AS3 native function childIndex():int;
    AS3 native function inScopeNamespaces ():Array;
    AS3 native function insertChildAfter (child1, child2):*; // undefined or this
    AS3 native function insertChildBefore (child1, child2):*; // undefined or this
    AS3 native function nodeKind ():String;
    AS3 native function namespace (prefix: String = null):*;
    AS3 native function localName ():Object; // null or String
    AS3 native function namespaceDeclarations ():Array;
    AS3 native function prependChild (value):XML;
    AS3 native function removeNamespace (ns):XML;
    AS3 native function replace (propertyName, value):XML;
    AS3 native function setChildren (value):XML;
    AS3 native function setLocalName (name):void;
    AS3 native function setName (name):void;
    AS3 native function setNamespace (ns):void;

    // Bug 652200: level of indirection so JSON sidesteps E4X [[Get]] semantics
    AS3 native function toJSON (k:String):*;

    // notification extensions(reserved)
    //public native function notification():Function;
    //public native function setNotification(f:Function);

    // Dummy constructor function - This is neccessary so the compiler can do arg # checking for the ctor in strict mode
    // The code for the actual ctor is in XMLList::construct in the avmplus
    public native function XMLList(value = void 0);
}

}
