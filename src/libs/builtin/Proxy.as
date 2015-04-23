/* -*- c-basic-offset: 4; indent-tabs-mode: nil; tab-width: 4 -*- */
/* vi: set ts=4 sw=4 expandtab: (add to ~/.vimrc: set modeline modelines=5) */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package flash.utils {

public namespace flash_proxy = "http://www.adobe.com/2006/actionscript/flash/proxy";

[native(cls="ProxyClass", gc="exact", instance="ProxyObject", methods="auto")]
public class Proxy {
  flash_proxy native function getProperty(name:*):*;
  flash_proxy native function setProperty(name:*, value:*):void;
  flash_proxy native function callProperty(name:*, ...rest):*;
  flash_proxy native function hasProperty(name:*):Boolean;
  flash_proxy native function deleteProperty(name:*):Boolean;

  flash_proxy native function getDescendants(name:*):*;

  flash_proxy native function nextNameIndex(index:int):int;
  flash_proxy native function nextName(index:int):String;
  flash_proxy native function nextValue(index:int):*;
}

}
