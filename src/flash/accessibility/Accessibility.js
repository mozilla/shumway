var AccessibilityDefinition = (function () {
  return {
    // ()
    __class__: "flash.accessibility.Accessibility",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          sendEvent: function sendEvent(source, childID, eventType, nonHTML) { // (source:DisplayObject, childID:uint, eventType:uint, nonHTML:Boolean = false) -> void
            notImplemented("Accessibility.sendEvent");
          },
          updateProperties: function updateProperties() { // (void) -> void
            notImplemented("Accessibility.updateProperties");
          },
          active: {
            get: function active() { // (void) -> Boolean
              somewhatImplemented("Accessibility.active");
              return false;
            }
          }
        },
        instance: {
        }
      }
    }
  };
}).call(this);
