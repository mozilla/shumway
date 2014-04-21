/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Package file that includes all Shumway files. This packaging system is a bit magical.
 * We use esprima to parse the sources and then estransform to apply a series of AST
 * level transformations. First we fold identifiers prefixed by "$". These are usually
 * environment variables. Next, we fold simple binary expression like "+" which then let
 * us evaluate the argument to the load call expressions below. For these we include the
 * source file and recurse.
 *
 */

load($SHUMWAY_ROOT + "src/global.js");
load($SHUMWAY_ROOT + "src/utilities.js");
load($SHUMWAY_ROOT + "src/options.js");
load($SHUMWAY_ROOT + "src/settings.js");

load($SHUMWAY_ROOT + "src/swf/Timeline.js");
load($SHUMWAY_ROOT + "src/flash/util.js");
load($SHUMWAY_ROOT + "src/swf/swf.js");
load($SHUMWAY_ROOT + "src/swf/inflate.js");
load($SHUMWAY_ROOT + "src/swf/stream.js");

load($SHUMWAY_ROOT + "src/swf/bitmap.js");
load($SHUMWAY_ROOT + "src/swf/button.js");
load($SHUMWAY_ROOT + "src/swf/font.js");

load($SHUMWAY_ROOT + "src/swf/image.js");
load($SHUMWAY_ROOT + "src/swf/label.js");
load($SHUMWAY_ROOT + "src/swf/shape.js");
load($SHUMWAY_ROOT + "src/swf/sound.js");
load($SHUMWAY_ROOT + "src/swf/text.js");
load($SHUMWAY_ROOT + "src/swf/mp3worker.js");
load($SHUMWAY_ROOT + "src/swf/embed.js");
load($SHUMWAY_ROOT + "src/swf/renderer.js");
load($SHUMWAY_ROOT + "src/swf/handlers.js");
load($SHUMWAY_ROOT + "src/swf/parser.js");
load($SHUMWAY_ROOT + "src/swf/resourceloader.js");

load($SHUMWAY_ROOT + "src/avm2/settings.js");
load($SHUMWAY_ROOT + "src/avm2/avm2Util.js");

load($SHUMWAY_ROOT + "src/avm2/metrics.js");

var Timer = Shumway.Metrics.Timer;
var Counter = new Shumway.Metrics.Counter(true);
var FrameCounter = new Shumway.Metrics.Counter(true);

var avm2Options = shumwayOptions.register(new OptionSet("AVM2"));
var sysCompiler = avm2Options.register(new Option("sysCompiler", "sysCompiler", "boolean", true, "system compiler/interpreter"));
var appCompiler = avm2Options.register(new Option("appCompiler", "appCompiler", "boolean", true, "application compiler/interpreter"));
var traceLevel = avm2Options.register(new Option("t", "traceLevel", "number", 0, "trace level", { choices: { "off":0, "normal":1, "verbose":2 } }));

window.print = function(s) {
  console.log(s);
};

load($SHUMWAY_ROOT + "src/avm2/constants.js");
load($SHUMWAY_ROOT + "src/avm2/errors.js");

var Errors = Shumway.AVM2.Errors;
var getErrorMessage = Shumway.AVM2.getErrorMessage;
var formatErrorMessage = Shumway.AVM2.formatErrorMessage;
var translateErrorMessage = Shumway.AVM2.translateErrorMessage;

load($SHUMWAY_ROOT + "src/avm2/opcodes.js");

var opcodeTable = Shumway.AVM2.opcodeTable;
var opcodeName = Shumway.AVM2.opcodeName;

load($SHUMWAY_ROOT + "src/avm2/parser.js");

var AbcFile = Shumway.AVM2.ABC.AbcFile;
var AbcStream = Shumway.AVM2.ABC.AbcStream;
var ConstantPool = Shumway.AVM2.ABC.ConstantPool;
var ClassInfo = Shumway.AVM2.ABC.ClassInfo;
var MetaDataInfo = Shumway.AVM2.ABC.MetaDataInfo;
var InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
var ScriptInfo = Shumway.AVM2.ABC.ScriptInfo;
var Trait = Shumway.AVM2.ABC.Trait;
var MethodInfo = Shumway.AVM2.ABC.MethodInfo;
var Multiname = Shumway.AVM2.ABC.Multiname;
var ASNamespace = Shumway.AVM2.ABC.Namespace;

load($SHUMWAY_ROOT + "src/avm2/analyze.js");

load($SHUMWAY_ROOT + "src/avm2/compiler/lljs/src/estransform.js");
load($SHUMWAY_ROOT + "src/avm2/compiler/lljs/src/escodegen.js");
load($SHUMWAY_ROOT + "src/avm2/compiler/inferrer.js");
load($SHUMWAY_ROOT + "src/avm2/compiler/c4/ir.js");
load($SHUMWAY_ROOT + "src/avm2/compiler/builder.js");
load($SHUMWAY_ROOT + "src/avm2/compiler/c4/looper.js");
load($SHUMWAY_ROOT + "src/avm2/compiler/c4/transform.js");
load($SHUMWAY_ROOT + "src/avm2/compiler/c4/backend.js");

load($SHUMWAY_ROOT + "src/avm2/trampoline.js");
load($SHUMWAY_ROOT + "src/avm2/bindings.js");
load($SHUMWAY_ROOT + "src/avm2/scope.js");

var playerglobalLoadedPromise;
var playerglobal;

load($SHUMWAY_ROOT + "src/avm2/domain.js");

var ApplicationDomain = Shumway.AVM2.Runtime.ApplicationDomain;
var AVM2 = Shumway.AVM2.Runtime.AVM2;
var EXECUTION_MODE = Shumway.AVM2.Runtime.EXECUTION_MODE;

var Binding = Shumway.AVM2.Runtime.Binding;
var Bindings = Shumway.AVM2.Runtime.Bindings;
var ActivationBindings = Shumway.AVM2.Runtime.ActivationBindings;
var CatchBindings = Shumway.AVM2.Runtime.CatchBindings;
var ScriptBindings = Shumway.AVM2.Runtime.ScriptBindings;
var ClassBindings = Shumway.AVM2.Runtime.ClassBindings;
var InstanceBindings = Shumway.AVM2.Runtime.InstanceBindings;
var Interface = Shumway.AVM2.Runtime.Interface;
var Class = Shumway.AVM2.Runtime.Class;

load($SHUMWAY_ROOT + "src/avm2/xregexp.js");
load($SHUMWAY_ROOT + "src/avm2/runtime.js");
load($SHUMWAY_ROOT + "src/avm2/runtime-exports.js");
load($SHUMWAY_ROOT + "src/avm2/hacks.js");
load($SHUMWAY_ROOT + "src/avm2/vectors-numeric.js");
load($SHUMWAY_ROOT + "src/avm2/vectors-generic.js");
load($SHUMWAY_ROOT + "src/avm2/array.js");
load($SHUMWAY_ROOT + "src/avm2/xml.js");
load($SHUMWAY_ROOT + "src/avm2/amf.js");
load($SHUMWAY_ROOT + "src/avm2/proxy.js");
load($SHUMWAY_ROOT + "src/avm2/dictionary.js");
load($SHUMWAY_ROOT + "src/avm2/native.js");
load($SHUMWAY_ROOT + "src/avm2/disassembler.js");
load($SHUMWAY_ROOT + "src/avm2/interpreter.js");

load($SHUMWAY_ROOT + "utils/builder/templates/avm2utils.js");

load($SHUMWAY_ROOT + "src/avm1/stream.js");
load($SHUMWAY_ROOT + "src/avm1/parser.js");
load($SHUMWAY_ROOT + "src/avm1/analyze.js");
load($SHUMWAY_ROOT + "src/avm1/interpreter.js");

// Manually add directories here, this doesn't get automatically updated by
// make update-flash-refs.

load($SHUMWAY_ROOT + "src/flash/display");
load($SHUMWAY_ROOT + "src/flash/events");
load($SHUMWAY_ROOT + "src/flash/external");
load($SHUMWAY_ROOT + "src/flash/filters");
load($SHUMWAY_ROOT + "src/flash/geom");
load($SHUMWAY_ROOT + "src/flash/media");
load($SHUMWAY_ROOT + "src/flash/net");
load($SHUMWAY_ROOT + "src/flash/system");
load($SHUMWAY_ROOT + "src/flash/text");
load($SHUMWAY_ROOT + "src/flash/ui");
load($SHUMWAY_ROOT + "src/flash/utils");
load($SHUMWAY_ROOT + "src/flash/accessibility");
load($SHUMWAY_ROOT + "src/avm1lib");
