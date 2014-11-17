/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Shumway.AVM2.Runtime {
  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import Hashes = Shumway.AVM2.ABC.Hashes;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import Namespace = Shumway.AVM2.ABC.Namespace;
  import MethodInfo = Shumway.AVM2.ABC.MethodInfo;
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  import InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
  import ScriptInfo = Shumway.AVM2.ABC.ScriptInfo;
  import Callback = Shumway.Callback;
  import Timer = Shumway.Metrics.Timer;

  var counter = Shumway.Metrics.Counter.instance;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
  import assert = Shumway.Debug.assert;
  import IndentingWriter = Shumway.IndentingWriter;

  declare var homePath;
  declare var snarf;
  declare var newGlobal;

  function createNewCompartment() {
    return newGlobal('new-compartment');
  }

  export function executeScript(script) {
    enterTimeline("executeScript", { name: script.name });
    var abc = script.abc;
    release || assert(!script.executing && !script.executed);
    var global = new Global(script);
    if (abc.applicationDomain.allowNatives) {
      global[Multiname.getPublicQualifiedName("unsafeJSNative")] = Shumway.AVM2.AS.getNative;
    }
    script.executing = true;
    var scope = new Scope(null, script.global);
    // XXX interpreted methods populate stack with every call, compiled don't
    // pushing current runtime to the stack, so Runtime.currentDomain is successful
    createFunction(script.init, scope, false, false).call(script.global, false);
    script.executed = true;
    leaveTimeline();
  }

  export function ensureScriptIsExecuted(script, reason: string = "") {
    if (!script.executed && !script.executing) {
      if (Shumway.AVM2.Runtime.traceExecution.value >= 2) {
        log("Executing Script For: " + reason);
      }
      executeScript(script);
    }
  }

  export enum Glue {
    PUBLIC_PROPERTIES = 0x1,
    PUBLIC_METHODS    = 0x2,
    ALL               = Glue.PUBLIC_PROPERTIES | Glue.PUBLIC_METHODS
  }

  // TODO we don't need them here?
  export var playerglobalLoadedPromise;
  export var playerglobal;

  function grabAbc(abcName: string): AbcFile {
    var entry = playerglobal.scripts[abcName];
    if (!entry) {
      return null;
    }
    var offset = entry.offset;
    var length = entry.length;
    return new AbcFile(new Uint8Array(playerglobal.abcs, offset, length), abcName);
  }

  function findDefiningAbc(mn: Multiname): AbcFile {
    if (!playerglobal) {
      return null;
    }
    for (var i = 0; i < mn.namespaces.length; i++) {
      var name = mn.namespaces[i].uri + ":" + mn.name;
      var abcName = playerglobal.map[name];
      if (abcName) {
        break;
      }
    }
    if (abcName) {
      return grabAbc(abcName);
    }
    return null;
  }

  function promiseFile(path, responseType) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', path);
      xhr.responseType = responseType;
      xhr.onload = function () {
        var response = xhr.response;
        if (response) {
          if (responseType === 'json' && xhr.responseType !== 'json') {
            // some browsers (e.g. Safari) have no idea what json is
            response = JSON.parse(response);
          }
          resolve(response);
        } else {
          reject('Unable to load ' + path + ': ' + xhr.statusText);
        }
      };
      xhr.send();
    });
  }

  export class AVM2 {
    public systemDomain: ApplicationDomain;
    public applicationDomain: ApplicationDomain;
    public findDefiningAbc: (mn: Multiname) => AbcFile;
    public exception: any;
    public exceptions: any [];
    public globals: Map<any>;
    public builtinsLoaded: boolean;
    public avm1Loaded: boolean;

    private _loadAVM1: (next) => void;
    private _loadAVM1Promise: Promise<void>;

    public static instance: AVM2;
    public static initialize(sysMode: ExecutionMode, appMode: ExecutionMode, loadAVM1: (next) => void = null) {
      release || assert (!AVM2.instance);
      AVM2.instance = new AVM2(sysMode, appMode, loadAVM1);
    }

    constructor(sysMode: ExecutionMode, appMode: ExecutionMode, loadAVM1: (next) => void) {
      // TODO: this will change when we implement security domains.
      this.systemDomain = new ApplicationDomain(this, null, sysMode, true);
      this.applicationDomain = new ApplicationDomain(this, this.systemDomain, appMode, false);
      this.findDefiningAbc = findDefiningAbc;

      this._loadAVM1 = loadAVM1;
      this._loadAVM1Promise = null;
      this.avm1Loaded = false;

      /**
       * All runtime exceptions are boxed in this object to tag them as having
       * originated from within the VM.
       */
      this.exception = { value: undefined };
      this.exceptions = [];

      this.globals = createEmptyObject();
    }

    // We sometimes need to know where we came from, such as in
    // |ApplicationDomain.currentDomain|.

    public static currentAbc() {
      var caller: any = arguments.callee;
      var maxDepth = 20;
      var abc = null;
      for (var i = 0; i < maxDepth && caller; i++) {
        var mi = caller.methodInfo;
        if (mi) {
          abc = mi.abc;
          break;
        }
        caller = caller.caller;
      }
      return abc;
    }

    public static currentDomain() {
      var abc = AVM2.currentAbc();
      // If we can't find an abc just default to the current system domain.
      if (abc === null) {
        return AVM2.instance.systemDomain;
      }
      release || assert (abc && abc.applicationDomain,
          "No domain environment was found on the stack, increase STACK_DEPTH or " +
          "make sure that a compiled / interpreted function is on the call stack.");
      return abc.applicationDomain;
    }

    public static isPlayerglobalLoaded() {
      return !!playerglobal;
    }

    public loadAVM1(): Promise<void> {
      var loadAVM1Callback = this._loadAVM1;
      release || assert(loadAVM1Callback);

      var self = this;
      if (!this._loadAVM1Promise) {
        this._loadAVM1Promise = new Promise<void>(function (resolve) {
          loadAVM1Callback(resolve);
        });
        this._loadAVM1Promise.then(function () {
          self.avm1Loaded = true;
        })
      }
      return this._loadAVM1Promise;
    }

    public static loadPlayerglobal(abcsPath, catalogPath) {
      if (playerglobalLoadedPromise) {
        return Promise.reject('Playerglobal is already loaded');
      }
      playerglobalLoadedPromise = Promise.all([
        promiseFile(abcsPath, 'arraybuffer'), promiseFile(catalogPath, 'json')]).
        then(function (result) {
          playerglobal = {
            abcs: result[0],
            map: Object.create(null),
            scripts: Object.create(null)
          };
          // TODO: Clean this up, type it.
          var catalog = <any>result[1];
          for (var i = 0; i < catalog.length; i++) {
            var abc = catalog[i];
            playerglobal.scripts[abc.name] = abc;
            if (typeof abc.defs === 'string') {
              playerglobal.map[abc.defs] = abc.name;
            } else {
              for (var j = 0; j < abc.defs.length; j++) {
                var def = abc.defs[j];
                playerglobal.map[def] = abc.name;
              }
            }
          }
        }, function (e) {
          console.error(e);
        });
      return playerglobalLoadedPromise;
    }

    public notifyConstruct(instanceConstructor, args) {
      // REMOVEME
    }

    public static getStackTrace(): string {
      Shumway.Debug.somewhatImplemented("getStackTrace");
      return Shumway.Debug.backtrace();
    }
  }

  export class ApplicationDomain {
    vm: AVM2;
    abcs: AbcFile [];
    loadedAbcs: any;
    loadedClasses: any;
    classCache: any;
    scriptCache: any;
    classInfoCache: any;
    base: ApplicationDomain;
    allowNatives: boolean;
    mode: ExecutionMode;
    onMessage: Callback;
    system: any;
    constructor(vm: AVM2, base: ApplicationDomain, mode: ExecutionMode, allowNatives: boolean) {
      release || assert (vm instanceof AVM2);
      release || assert (isNullOrUndefined(base) || base instanceof ApplicationDomain);

      this.vm = vm;

      // ABCs that belong to this domain.
      this.abcs = [];

      // ABCs that have been loaded
      this.loadedAbcs = {};

      // Classes that have been loaded.
      this.loadedClasses = [];

      // Classes cache.
      this.classCache = createEmptyObject();

      // Script cache.
      this.scriptCache = createEmptyObject();

      // Class Info cache.
      this.classInfoCache = createEmptyObject();

      // Our parent.
      this.base = base;

      // Do we allow natives?
      this.allowNatives = allowNatives;

      // Do we compile or interpret?
      this.mode = mode;

      this.onMessage = new Callback();

      // If we are the system domain (the root), we should initialize the Class
      // and MethodClosure classes.
      if (base) {
        this.system = base.system;
      } else {
        this.system = this;
      }
    }

    static passthroughCallable(f) {
      return {
        call: function ($this) {
          Array.prototype.shift.call(arguments);
          return f.asApply($this, arguments);
        },
        apply: function ($this, args) {
          return f.asApply($this, args);
        }
      };
    }

    static coerceCallable(type) {
      return {
        call: function ($this, value) {
          return asCoerce(type, value);
        },
        apply: function ($this, args) {
          return asCoerce(type, args[0]);
        }
      };
    }

    public getType(multiname: Multiname) {
      return this.getProperty(multiname, true, true);
    }

    public getProperty(multiname: Multiname, strict: boolean, execute: boolean) {
      var resolved = this.findDefiningScript(multiname, execute);
      if (resolved) {
        if (!resolved.script.executing) {
          // console.info("Getting " + multiname + " but script is not executed");
          return undefined;
        }
        return resolved.script.global[Multiname.getQualifiedName(resolved.trait.name)];
      }
      if (strict) {
        return Shumway.Debug.unexpected("Cannot find property " + multiname);
      }
      return undefined;
    }

    public getClass(simpleName: string, strict: boolean = true): Shumway.AVM2.AS.ASClass {
      var cache = this.classCache;
      var cls = cache[simpleName];
      if (!cls) {
        cls = cache[simpleName] = this.getProperty(Multiname.fromSimpleName(simpleName), strict, true);
      }
      release || (cls && assert(cls instanceof Shumway.AVM2.AS.ASClass));
      return cls;
    }

    public findDomainProperty(multiname: Multiname, strict: boolean, execute: boolean) {
      if (Shumway.AVM2.Runtime.traceDomain.value) {
        log("ApplicationDomain.findDomainProperty: " + multiname);
      }
      var resolved = this.findDefiningScript(multiname, execute);
      if (resolved) {
        return resolved.script.global;
      }
      if (strict) {
        return Shumway.Debug.unexpected("Cannot find property " + multiname);
      } else {
        return undefined;
      }
      return undefined;
    }

    public findClassInfo(mn) {
      var originalQn; // Remember for later in this function
      if (Multiname.isQName(mn)) {
        // This deals with the case where mn is already a qn.
        originalQn = Multiname.getQualifiedName(mn);
        var ci = this.classInfoCache[originalQn];
        if (ci) {
          return ci;
        }
      } else {
        var ci = this.classInfoCache[mn.runtimeId];
        if (ci) {
          return ci;
        }
      }
      if (this.base) {
        // Recurse with the mn as is.
        ci = this.base.findClassInfo(mn);
        if (ci) {
          return ci;
        }
      }
      // The class info may be among the loaded ABCs, go looking for it.
      var abcs = this.abcs;
      for (var i = 0; i < abcs.length; i++) {
        var abc = abcs[i];
        var scripts = abc.scripts;
        for (var j = 0; j < scripts.length; j++) {
          var script = scripts[j];
          var traits = script.traits;
          for (var k = 0; k < traits.length; k++) {
            var trait = traits[k];
            if (trait.isClass()) {
              var traitName = Multiname.getQualifiedName(trait.name);
              // So here mn is either a Multiname or a QName.
              if (originalQn) {
                if (traitName === originalQn) {
                  return (this.classInfoCache[originalQn] = trait.classInfo);
                }
              } else {
                for (var m = 0, n = mn.namespaces.length; m < n; m++) {
                  var qn = mn.getQName(m);
                  if (traitName === Multiname.getQualifiedName(qn)) {
                    return (this.classInfoCache[qn] = trait.classInfo);
                  }
                }
              }
            }
          }
        }
      }
      // Still no luck, so let's ask host to load the defining ABC and try again.
      if (!this.base && this.vm.findDefiningAbc) {
        var abc = this.vm.findDefiningAbc(mn);
        if (abc !== null && !this.loadedAbcs[abc.name]) {
          this.loadedAbcs[abc.name] = true;
          this.loadAbc(abc);
          return this.findClassInfo(mn);
        }
      }
      return undefined;
    }

    /**
     * Find the first script that defines a multiname.
     *
     * ABCs are added to the list in load order, so a later loaded ABC with a
     * definition of conflicting name will never be resolved.
     */
    public findDefiningScript(mn, execute) {
      var resolved = this.scriptCache[mn.runtimeId];
      if (resolved && (resolved.script.executed || !execute)) {
        return resolved;
      }

      if (this.base) {
        resolved = this.base.findDefiningScript(mn, execute);
        if (resolved) {
          return resolved;
        }
      }

      countTimeline("ApplicationDomain: findDefiningScript");

      var abcs = this.abcs;
      for (var i = 0; i < abcs.length; i++) {
        var abc = abcs[i];
        var scripts = abc.scripts;
        for (var j = 0; j < scripts.length; j++) {
          var script = scripts[j];
          var traits = script.traits;
          if (mn instanceof Multiname) {
            for (var k = 0; k < traits.length; k++) {
              var trait = traits[k];
              if (mn.hasQName(trait.name)) {
                if (execute) {
                  ensureScriptIsExecuted(script, String(trait.name));
                }
                return (this.scriptCache[mn.runtimeId] = { script: script, trait: trait });
              }
            }
          } else {
            Shumway.Debug.unexpected();
          }
        }
      }

      // Ask host to execute the defining ABC
      if (!this.base && this.vm.findDefiningAbc) {
        var abc = this.vm.findDefiningAbc(mn);
        if (abc !== null && !this.loadedAbcs[abc.name]) {
          this.loadedAbcs[abc.name] = true;
          this.loadAbc(abc);
          return this.findDefiningScript(mn, execute);
        }
      }

      return undefined;
    }

    public compileAbc(abc, writer) {
      Shumway.AVM2.Compiler.compileAbc(abc, writer);
    }

    public executeAbc(abc: AbcFile) {
      // console.time("Execute ABC: " + abc.name);
      this.loadAbc(abc);
      executeScript(abc.lastScript);
      // console.timeEnd("Execute ABC: " + abc.name);
    }

    public loadAbc(abc: AbcFile) {
      if (Shumway.AVM2.Runtime.traceExecution.value) {
        log("Loading: " + abc.name);
      }
      abc.applicationDomain = this;
      GlobalMultinameResolver.loadAbc(abc);
      this.abcs.push(abc);

      if (!this.base) {
        AS.initialize(this);
        Shumway.AVM2.Verifier.Type.initializeTypes(this);
      }
    }

    public broadcastMessage(type, message, origin) {
      try {
        this.onMessage.notify1(type, {
          data: message,
          origin: origin,
          source: this
        });
      } catch (e) {
        var avm2 = AVM2.instance;
        avm2.exceptions.push({source: type, message: e.message,
          stack: e.stack});
        throw e;
      }
    }

    public traceLoadedClasses(lastOnly) {
      var writer = new IndentingWriter();
      lastOnly || writer.enter("Loaded Classes And Interfaces");
      var classes = lastOnly ? [Shumway.ArrayUtilities.last(this.loadedClasses)] : this.loadedClasses;
      classes.forEach(function (cls) {
        if (cls !== Shumway.AVM2.AS.ASClass) {
          cls.trace(writer);
        }
      });
      lastOnly || writer.leave("");
    }
  }

  export class SecurityDomain {
    compartment: any;
    systemDomain: ApplicationDomain;
    applicationDomain: ApplicationDomain;
    constructor (compartmentPath: string) {
      this.compartment = createNewCompartment();
      this.compartment.homePath = homePath;
      this.compartment.release = release;
      this.compartment.eval(snarf(compartmentPath));
    }

    public initializeShell(sysMode, appMode) {
      var compartment = this.compartment;
      compartment.AVM2.initialize(sysMode, appMode);
      compartment.AVM2.instance.systemDomain.executeAbc(compartment.grabAbc(homePath + "src/avm2/generated/builtin/builtin.abc"));
      compartment.AVM2.instance.systemDomain.executeAbc(compartment.grabAbc(homePath + "src/avm2/generated/shell/shell.abc"));
      // compartment.avm2.systemDomain.executeAbc(compartment.grabAbc(homePath + "src/avm2/generated/avmplus/avmplus.abc"));
      this.systemDomain = compartment.AVM2.instance.systemDomain;
      this.applicationDomain = compartment.AVM2.instance.applicationDomain;
    }
  }

}

var Glue = Shumway.AVM2.Runtime.Glue;
import ApplicationDomain = Shumway.AVM2.Runtime.ApplicationDomain;
import AVM2 = Shumway.AVM2.Runtime.AVM2;
import EXECUTION_MODE = Shumway.AVM2.Runtime.ExecutionMode;
