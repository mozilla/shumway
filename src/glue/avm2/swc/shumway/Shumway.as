/**
 * This is an escape hatch from AS3, you can use it for debugging. Compile this with compc to generate Shumway.swc
 * and add it to the library path in the Flash IDE.
 *
 * ./compc -source-path src/glue/avm2/swc -include-classes shumway.Shumway -output src/glue/avm2/swc/Shumway.swc
 *
 * To use the library from the flash IDE, do the following:
 *
 * File -> ActionScript Settings:
 *
 *  1. Add the Shumway/src/glue/avm2 directory to the Source path tab.
 *  2. Add the Shumway/src/glue/avm2/swc/Shumway.swc to the Library path tab.
 *  3. Select the Shumway.swc library and click the little (i) button above and make sure you select
 *     merged into code link type.
 *
 *  In your flash code, simply use:
 *
 *  import shumway.Shumway;
 *
 *  Shumway.info({x: 1});
 *  Shumway.info(Shumway.eval('new Point()'));
 *  Shumway.json({x: 1});
 *  Shumway.debugger({x: 1});
 *
 */
package shumway {
  public final class Shumway {
    /**
     * Writes the specified |value| to the console.
     */
    public static function info(value):void { }

    /**
     * Stringifies the specified |value|.
     */
    public static function json(value):void { }

    /**
     * Evals the specified |source| in the Shumway context.
     */
    public static function eval(source:String):Object {
      return undefined;
    }

    /**
     * Break into the JS debugger.
     */
    public static function debugger(value) { }
  }
}