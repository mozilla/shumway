/**
 * Package file that includes all Shumway files. This packaging system is a bit magical.
 * We use esprima to parse the sources and then estransform to apply a series of AST
 * level transformations. First we fold identifiers prefixed by "$". These are usually
 * environment variables. Next, we fold simple binary expression like "+" which then let
 * us evaluate the argument to the load call expressions below. For these we include the
 * source file and recurse.
 *
 */

load($SHUMWAY_ROOT + "lib/DataView.js/DataView.js");
load($SHUMWAY_ROOT + "lib/Kanvas/kanvas.js");

load($SHUMWAY_ROOT + "src/swf/util.js");
load($SHUMWAY_ROOT + "src/swf/swf.js");
load($SHUMWAY_ROOT + "src/swf/types.js");
load($SHUMWAY_ROOT + "src/swf/structs.js");
load($SHUMWAY_ROOT + "src/swf/tags.js");
load($SHUMWAY_ROOT + "src/swf/inflate.js");
load($SHUMWAY_ROOT + "src/swf/stream.js");
load($SHUMWAY_ROOT + "src/swf/templates.js");
load($SHUMWAY_ROOT + "src/swf/generator.js");

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
// Load the non-generated parser, we load the generated parser
// in the worker scripts instead.
load($SHUMWAY_ROOT + "src/swf/handlers.js");
// load("build/content/swf/handlers.js");
load($SHUMWAY_ROOT + "src/swf/parser.js");
load($SHUMWAY_ROOT + "src/avm1/classes.js");
load($SHUMWAY_ROOT + "src/avm1/globals.js");
load($SHUMWAY_ROOT + "src/avm1/stream.js");
load($SHUMWAY_ROOT + "src/avm1/interpreter.js");

load($SHUMWAY_ROOT + "src/avm2/util.js");
load($SHUMWAY_ROOT + "src/avm2/options.js");
load($SHUMWAY_ROOT + "src/avm2/metrics.js");

var Counter = new metrics.Counter(true);
var Timer = metrics.Timer;
var Option = options.Option;
var OptionSet = options.OptionSet;
var systemOptions = new OptionSet("System Options");
var disassemble = systemOptions.register(new Option("d", "disassemble", "boolean", false, "disassemble"));
var traceLevel = systemOptions.register(new Option("t", "traceLevel", "number", 0, "trace level"));

window.print = function(s) {
  console.log(s);
};

load($SHUMWAY_ROOT + "src/avm2/constants.js");
load($SHUMWAY_ROOT + "src/avm2/errors.js");
load($SHUMWAY_ROOT + "src/avm2/opcodes.js");
load($SHUMWAY_ROOT + "src/avm2/parser.js");
load($SHUMWAY_ROOT + "src/avm2/analyze.js");
load($SHUMWAY_ROOT + "src/avm2/compiler/lljs/src/estransform.js");
load($SHUMWAY_ROOT + "src/avm2/compiler/lljs/src/escodegen.js");
load($SHUMWAY_ROOT + "src/avm2/compiler/inferrer.js");
load($SHUMWAY_ROOT + "src/avm2/compiler/c4/ir.js");
load($SHUMWAY_ROOT + "src/avm2/compiler/builder.js");
load($SHUMWAY_ROOT + "src/avm2/compiler/c4/looper.js");
load($SHUMWAY_ROOT + "src/avm2/compiler/c4/backend.js");
load($SHUMWAY_ROOT + "src/avm2/domain.js");
load($SHUMWAY_ROOT + "src/avm2/runtime.js");
load($SHUMWAY_ROOT + "src/avm2/xml.js");
load($SHUMWAY_ROOT + "src/avm2/native.js");
load($SHUMWAY_ROOT + "src/avm2/disassembler.js");
load($SHUMWAY_ROOT + "src/avm2/interpreter.js");
load($SHUMWAY_ROOT + "src/avm2/vm.js");

load($SHUMWAY_ROOT + "src/flash/playerglobal.js");  // this needs to come before avm2utils.js
load($SHUMWAY_ROOT + "extension/firefox/content/web/avm2utils.js");
load($SHUMWAY_ROOT + "src/flash/util.js");

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

load($SHUMWAY_ROOT + "src/flash/stubs.js");
