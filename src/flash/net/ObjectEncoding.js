var ObjectEncodingDefinition = (function () {
  return {
    // ()
    __class__: "flash.net.ObjectEncoding",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          dynamicPropertyWriter: {
            get: function dynamicPropertyWriter() { // (void) -> IDynamicPropertyWriter
              notImplemented("ObjectEncoding.dynamicPropertyWriter");
            },
            set: function dynamicPropertyWriter(object) { // (object:IDynamicPropertyWriter) -> void
              notImplemented("ObjectEncoding.dynamicPropertyWriter");
            }
          }
        },
        instance: {
        }
      }
    }
  };
}).call(this);
