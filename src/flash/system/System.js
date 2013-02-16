var SystemDefinition = (function () {
  return {
    __class__: "flash.system.System",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          setClipboard: function setClipboard(string) { // (string:String) -> void
            notImplemented("System.setClipboard");
          },
          pause: function pause() { // (void) -> void
            notImplemented("System.pause");
          },
          resume: function resume() { // (void) -> void
            notImplemented("System.resume");
          },
          exit: function exit(code) { // (code:uint) -> void
            notImplemented("System.exit");
          },
          gc: function gc() { // (void) -> void
            notImplemented("System.gc");
          },
          pauseForGCIfCollectionImminent: function pauseForGCIfCollectionImminent(imminence) { // (imminence:Number = 0.75) -> void
            notImplemented("System.pauseForGCIfCollectionImminent");
          },
          disposeXML: function disposeXML(node) { // (node:XML) -> void
            notImplemented("System.disposeXML");
          },
          ime: {
            get: function ime() { // (void) -> IME
              notImplemented("System.ime");
            }
          },
          totalMemoryNumber: {
            get: function totalMemoryNumber() { // (void) -> Number
              if (performance.memory) {
                return performance.memory.usedJSHeapSize;
              }
              return 0;
            }
          },
          freeMemory: {
            get: function freeMemory() { // (void) -> Number
              notImplemented("System.freeMemory");
            }
          },
          privateMemory: {
            get: function privateMemory() { // (void) -> Number
              return 0;
            }
          },
          processCPUUsage: {
            get: function processCPUUsage() { // (void) -> Number
              notImplemented("System.processCPUUsage");
            }
          },
          useCodePage: {
            get: function useCodePage() { // (void) -> Boolean
              notImplemented("System.useCodePage");
            },
            set: function useCodePage(value) { // (value:Boolean) -> void
              notImplemented("System.useCodePage");
            }
          },
          vmVersion: {
            get: function vmVersion() { // (void) -> String
              notImplemented("System.vmVersion");
            }
          }
        },
        instance: {
        }
      }
    }
  };
}).call(this);