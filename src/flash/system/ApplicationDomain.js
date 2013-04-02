var ApplicationDomainDefinition = (function () {
  return {
    // (parentDomain:ApplicationDomain = null)
    __class__: "flash.system.ApplicationDomain",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          currentDomain: {
            get: function currentDomain() { // (void) -> ApplicationDomain
              notImplemented("ApplicationDomain.currentDomain");
            }
          },
          MIN_DOMAIN_MEMORY_LENGTH: {
            get: function MIN_DOMAIN_MEMORY_LENGTH() { // (void) -> uint
              notImplemented("ApplicationDomain.MIN_DOMAIN_MEMORY_LENGTH");
            }
          }
        },
        instance: {
          ctor: function ctor(parentDomain) { // (parentDomain:ApplicationDomain) -> void
            notImplemented("ApplicationDomain.ctor");
          },
          getDefinition: function getDefinition(name) { // (name:String) -> Object
            notImplemented("ApplicationDomain.getDefinition");
          },
          hasDefinition: function hasDefinition(name) { // (name:String) -> Boolean
            notImplemented("ApplicationDomain.hasDefinition");
          },
          getQualifiedDefinitionNames: function getQualifiedDefinitionNames() { // (void) -> Vector
            notImplemented("ApplicationDomain.getQualifiedDefinitionNames");
          },
          parentDomain: {
            get: function parentDomain() { // (void) -> ApplicationDomain
              notImplemented("ApplicationDomain.parentDomain");
              return this._parentDomain;
            }
          },
          domainMemory: {
            get: function domainMemory() { // (void) -> ByteArray
              notImplemented("ApplicationDomain.domainMemory");
              return this._domainMemory;
            },
            set: function domainMemory(mem) { // (mem:ByteArray) -> any
              notImplemented("ApplicationDomain.domainMemory");
              this._domainMemory = mem;
            }
          }
        }
      },
    }
  };
}).call(this);
