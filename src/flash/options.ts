module Shumway.AVM2.AS {
  import Option = Shumway.Options.Option;
  import OptionSet = Shumway.Options.OptionSet;

  import shumwayOptions = Shumway.Settings.shumwayOptions;

  export var flashOptions = shumwayOptions.register(new OptionSet("Flash Options"));

  export var traceEventsOption = flashOptions.register (
    new Shumway.Options.Option("te", "Trace Events", "boolean", false, "Trace dispatching of events.")
  );

  export var traceLoaderOption = flashOptions.register (
    new Shumway.Options.Option("tp", "Trace Loader", "boolean", false, "Trace loader execution.")
  );

  export var disableAudioOption = flashOptions.register (
    new Shumway.Options.Option("da", "Disable Audio", "boolean", false, "Disables audio.")
  );

  export var webAudioOption = flashOptions.register (
    new Shumway.Options.Option(null, "Use WebAudio for Sound", "boolean", false, "Enables WebAudio API for MovieClip sound stream. (MP3 format is an exception)")
  );

  export var webAudioMP3Option = flashOptions.register (
    new Shumway.Options.Option(null, "Use MP3 decoding to WebAudio", "boolean", false, "Enables WebAudio API and software MP3 decoding and disables any AUDIO tag usage for MP3 format")
  );

  export var mediaSourceOption = flashOptions.register (
    new Shumway.Options.Option(null, "Use Media Source for Video", "boolean", false, "Enables Media Source Extension API for NetStream.")
  );

  export var mediaSourceMP3Option = flashOptions.register (
    new Shumway.Options.Option(null, "Use Media Source for MP3", "boolean", true, "Enables Media Source Extension API for MP3 streams.")
  );
}
