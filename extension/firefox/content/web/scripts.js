/**
 * Package file that includes all Shumway files.
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


load($SHUMWAY_ROOT + "extension/firefox/content/web/avm2utils.js");

load($SHUMWAY_ROOT + "src/flash/util.js");


load($SHUMWAY_ROOT + "src/flash/display/Bitmap.js");
load($SHUMWAY_ROOT + "src/flash/display/BitmapData.js");
load($SHUMWAY_ROOT + "src/flash/display/DisplayObject.js");
load($SHUMWAY_ROOT + "src/flash/display/DisplayObjectContainer.js");
load($SHUMWAY_ROOT + "src/flash/display/Graphics.js");
load($SHUMWAY_ROOT + "src/flash/display/InteractiveObject.js");
load($SHUMWAY_ROOT + "src/flash/display/Loader.js");
load($SHUMWAY_ROOT + "src/flash/display/LoaderInfo.js");
load($SHUMWAY_ROOT + "src/flash/display/MorphShape.js");
load($SHUMWAY_ROOT + "src/flash/display/MovieClip.js");
load($SHUMWAY_ROOT + "src/flash/display/Shape.js");
load($SHUMWAY_ROOT + "src/flash/display/SimpleButton.js");
load($SHUMWAY_ROOT + "src/flash/display/Sprite.js");
load($SHUMWAY_ROOT + "src/flash/display/Stage.js");
load($SHUMWAY_ROOT + "src/flash/events/Event.js");
load($SHUMWAY_ROOT + "src/flash/events/EventDispatcher.js");
load($SHUMWAY_ROOT + "src/flash/events/KeyboardEvent.js");
load($SHUMWAY_ROOT + "src/flash/events/MouseEvent.js");
load($SHUMWAY_ROOT + "src/flash/events/TextEvent.js");
load($SHUMWAY_ROOT + "src/flash/events/TimerEvent.js");
load($SHUMWAY_ROOT + "src/flash/external/ExternalInterface.js");
load($SHUMWAY_ROOT + "src/flash/filters/BevelFilter.js");
load($SHUMWAY_ROOT + "src/flash/filters/BitmapFilter.js");
load($SHUMWAY_ROOT + "src/flash/filters/BlurFilter.js");
load($SHUMWAY_ROOT + "src/flash/filters/ColorMatrixFilter.js");
load($SHUMWAY_ROOT + "src/flash/filters/ConvolutionFilter.js");
load($SHUMWAY_ROOT + "src/flash/filters/DisplacementMapFilter.js");
load($SHUMWAY_ROOT + "src/flash/filters/DropShadowFilter.js");
load($SHUMWAY_ROOT + "src/flash/filters/GlowFilter.js");
load($SHUMWAY_ROOT + "src/flash/filters/GradientBevelFilter.js");
load($SHUMWAY_ROOT + "src/flash/filters/GradientGlowFilter.js");
load($SHUMWAY_ROOT + "src/flash/filters/ShaderFilter.js");
load($SHUMWAY_ROOT + "src/flash/geom/ColorTransform.js");
load($SHUMWAY_ROOT + "src/flash/geom/Matrix.js");
load($SHUMWAY_ROOT + "src/flash/geom/Point.js");
load($SHUMWAY_ROOT + "src/flash/geom/Rectangle.js");
load($SHUMWAY_ROOT + "src/flash/geom/Transform.js");
load($SHUMWAY_ROOT + "src/flash/media/ID3Info.js");
load($SHUMWAY_ROOT + "src/flash/media/Sound.js");
load($SHUMWAY_ROOT + "src/flash/media/SoundChannel.js");
load($SHUMWAY_ROOT + "src/flash/media/SoundMixer.js");
load($SHUMWAY_ROOT + "src/flash/media/SoundTransform.js");
load($SHUMWAY_ROOT + "src/flash/media/Video.js");
load($SHUMWAY_ROOT + "src/flash/net/NetConnection.js");
load($SHUMWAY_ROOT + "src/flash/net/NetStream.js");
load($SHUMWAY_ROOT + "src/flash/net/Responder.js");
load($SHUMWAY_ROOT + "src/flash/net/URLLoader.js");
load($SHUMWAY_ROOT + "src/flash/net/URLRequest.js");
load($SHUMWAY_ROOT + "src/flash/net/URLStream.js");
load($SHUMWAY_ROOT + "src/flash/system/Capabilities.js");
load($SHUMWAY_ROOT + "src/flash/system/FSCommand.js");
load($SHUMWAY_ROOT + "src/flash/system/System.js");
load($SHUMWAY_ROOT + "src/flash/text/Font.js");
load($SHUMWAY_ROOT + "src/flash/text/StaticText.js");
load($SHUMWAY_ROOT + "src/flash/text/TextField.js");
load($SHUMWAY_ROOT + "src/flash/ui/Keyboard.js");
load($SHUMWAY_ROOT + "src/flash/ui/Mouse.js");
load($SHUMWAY_ROOT + "src/flash/utils/Timer.js");

load($SHUMWAY_ROOT + "src/flash/stubs.js");
