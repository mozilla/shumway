/* -*- c-basic-offset: 4; indent-tabs-mode: nil; tab-width: 4 -*- */
/* vi: set ts=4 sw=4 expandtab: (add to ~/.vimrc: set modeline modelines=5) */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package {
    [native(cls="JSONClass", classgc="exact", methods="auto", construct="none")]
    public final class JSON {
        public static native function parse(text:String, reviver:Function = null):Object;
        public static native function stringify(value:Object, replacer=null, space=null):String;
    }
}
