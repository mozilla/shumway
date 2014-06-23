package {
	import flash.display.MovieClip;
  import flash.events.*;
  import flash.filters.*;

public class Events extends MovieClip {
		public function Events() {
      // trace(Fuzzer.createInstance(MovieClip, []));


      var types = [
        BevelFilter,
        BlurFilter,
        ColorMatrixFilter,
        ConvolutionFilter,
        // DisplacementMapFilter,
        DropShadowFilter,
        GlowFilter,
        GradientBevelFilter,
        GradientGlowFilter,
        ShaderFilter
      ];

      types.forEach(function (type) {
        var parameterTypes = Fuzzer.getConstructorParameterTypes(type, false);
        var parameterValues = Fuzzer.getRandomParameterValues(parameterTypes);
        trace ("var o = " + Fuzzer.getClassName(type) + "(" + parameterValues.map(function (item: *, index:int, array:Array) {
          return Fuzzer.getLiteral(item);
        }).join(", ") + ")");
        var o = Fuzzer.createInstance(type, parameterValues);
        trace("eqString(o, '" + o.toString() + "');");
      });

      // trace(Fuzzer.getRandomParameterValues(parameterTypes).map(Fuzzer.getLiteral).join(', '));
		}
	}

}



