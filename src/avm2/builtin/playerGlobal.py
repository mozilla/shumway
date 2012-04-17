#!/usr/bin/env python
# -*- Mode: Python; c-basic-offset: 4; indent-tabs-mode: nil; tab-width: 4 -*-
# vi: set ts=4 sw=4 expandtab:

# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Original Code is [Open Source Virtual Machine.].
#
# The Initial Developer of the Original Code is
# Adobe System Incorporated.
# Portions created by the Initial Developer are Copyright (C) 2004-2006
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#   Adobe AS3 Team
#
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****

import os
import shutil
import sys

def mv(oldfile, newfile):
    shutil.copyfile(oldfile,newfile)
    os.remove(oldfile)

def rm(file):
    if os.access(file, os.F_OK) == True:
        os.remove(file)

classpath = os.environ.get('ASC')
if classpath == None:
    classpath = "../utils/asc.jar"
    #print "ERROR: ASC environment variable must point to asc.jar"
    #exit(1)

javacmd = "java -ea -DAS3 -DAVMPLUS -classpath " + classpath
asc = javacmd + " macromedia.asc.embedding.ScriptCompiler "

print("ASC=" + classpath)
print("Building playerGlobal...")

# https://bugzilla.mozilla.org/show_bug.cgi?id=697977
if len(sys.argv) == 1:
    print('To build the float/float4 enabled builtins pass the following:');
    print('    >$ ./playerGlobal.py -config CONFIG::VMCFG_FLOAT=true -abcfuture');
    print('');
    print('To compile the builtins without float/float4 support:');
    print('    >$ ./playerGlobal.py -config CONFIG::VMCFG_FLOAT=false');
    exit(1);

configs = " ".join(sys.argv[1:])

os.system(asc + " -builtin ../generated/builtin.abc -out playerGlobal Capabilities.as IEventDispatcher.as EventDispatcher.as Event.as IBitmapDrawable.as DisplayObject.as DisplayObjectContainer.as InteractiveObject.as Stage.as Point.as Rectangle.as Transform.as Matrix.as ColorTransform.as Matrix3D.as PerspectiveProjection.as Vector3D.as LoaderInfo.as AccessibilityProperties.as ShaderData.as Shader.as ApplicationDomain.as Loader.as UncaughtErrorEvents.as AccessibilityImplementation.as ContextMenu.as NativeMenu.as ContextMenuClipboardItems.as ContextMenuBuiltInItems.as URLRequest.as TextSnapshot.as LoaderContext.as SecurityDomain.as Sprite.as Graphics.as IGraphicsStroke.as IGraphicsFill.as IGraphicsPath.as BitmapData.as BitmapFilter.as SoundTransform.as MovieClip.as Scene.as " + configs)

rm("playerGlobal.h")
rm("playerGlobal.cpp")
mv("playerGlobal.abc", "../generated/playerGlobal.abc")

print("Done.")
