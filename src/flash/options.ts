module Shumway.AVM2.AS {
  import Option = Shumway.Options.Option;
  import OptionSet = Shumway.Options.OptionSet;

  import shumwayOptions = Shumway.Settings.shumwayOptions;

  export var flashOptions = shumwayOptions.register(new OptionSet("Flash Options"));

  export var traceLoaderOption = flashOptions.register (
    new Shumway.Options.Option("tp", "Trace Loader", "boolean", false, "Trace loader execution.")
  );
}