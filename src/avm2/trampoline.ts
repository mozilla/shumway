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
  import Map = Shumway.Map;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import Namespace = Shumway.AVM2.ABC.Namespace;
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  import InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
  import Trait = Shumway.AVM2.ABC.Trait;
  import IndentingWriter = Shumway.IndentingWriter;
  import createMap = Shumway.ObjectUtilities.createMap;
  import assert = Shumway.Debug.assert;

  import defineNonEnumerableGetterOrSetter = Shumway.ObjectUtilities.defineNonEnumerableGetterOrSetter;
  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
  import defineReadOnlyProperty = Shumway.ObjectUtilities.defineReadOnlyProperty;

  import bindSafely = Shumway.FunctionUtilities.bindSafely;

  declare var callWriter: IndentingWriter;

  var counter = Shumway.Metrics.Counter.instance;

  var vmNextTrampolineId = 1;
  var vmNextMemoizerId = 1;

  export function getMethodOverrideKey(methodInfo) {
    var key;
    if (methodInfo.holder instanceof ClassInfo) {
      key = "static " + methodInfo.holder.instanceInfo.name.getOriginalName() + "::" + methodInfo.name.getOriginalName();
    } else if (methodInfo.holder instanceof InstanceInfo) {
      key = methodInfo.holder.name.getOriginalName() + "::" + methodInfo.name.getOriginalName();
    } else {
      key = methodInfo.name.getOriginalName();
    }
    return key;
  }

  export function checkMethodOverrides(methodInfo) {
    if (methodInfo.name) {
      var key = getMethodOverrideKey(methodInfo);
      if (key in VM_METHOD_OVERRIDES) {
        Shumway.Debug.warning("Overriding Method: " + key);
        return VM_METHOD_OVERRIDES[key];
      }
    }
  }

  /*
   * Memoizers and Trampolines:
   * ==========================
   *
   * In ActionScript 3 the following code creates a method closure for function |m|:
   *
   * class A {
   *   function m() { }
   * }
   *
   * var a = new A();
   * var x = a.m;
   *
   * Here |x| is a method closure for |m| whose |this| pointer is bound to |a|. We want method closures to be
   * created transparently whenever the |m| property is read from |a|. To do this, we install a memoizing
   * getter in the instance prototype that sets the |m| property of the instance object to a bound method closure:
   *
   * Ma = A.instance.prototype.m = function memoizer() {
   *   this.m = m.bind(this);
   * }
   *
   * var a = new A();
   * var x = a.m; // |a.m| calls the memoizer which in turn patches |a.m| to |m.bind(this)|
   * x = a.m; // |a.m| is already a method closure
   *
   * However, this design causes problems for method calls. For instance, we don't want the call expression |a.m()|
   * to be interpreted as |(a.m)()| which creates method closures every time a method is called on a new object.
   * Luckily, method call expressions such as |a.m()| are usually compiled as |callProperty(a, m)| by ASC and
   * lets us determine at compile time whenever a method closure needs to be created. In order to prevent the
   * method closure from being created by the memoizer we install the original |m| in the instance prototype
   * as well, but under a different name |m'|. Whenever we want to avoid creating a method closure, we just
   * access the |m'| property on the object. The expression |a.m()| is compiled by Shumway to |a.m'()|.
   *
   * Memoizers are installed whenever traits are applied which happens when a class is created. At this point
   * we don't actually have the function |m| available, it hasn't been compiled yet. We only want to compile the
   * code that is executed and thus we defer compilation until |m| is actually called. To do this, we create a
   * trampoline that compiles |m| before executing it.
   *
   * Tm = function trampoline() {
   *   return compile(m).apply(this, arguments);
   * }
   *
   * Of course we don't want to recompile |m| every time it is called. We can optimize the trampoline a bit
   * so that it keeps track of repeated executions:
   *
   * Tm = function trampolineContext() {
   *   var c;
   *   return function () {
   *     if (!c) {
   *       c = compile(m);
   *     }
   *     return c.apply(this, arguments);
   *   }
   * }();
   *
   * This is not good enough, we want to prevent repeated executions as much as possible. The way to fix this is
   * to patch the instance prototype to point to the compiled version instead, so that the trampoline doesn't get
   * called again.
   *
   * Tm = function trampolineContext() {
   *   var c;
   *   return function () {
   *     if (!c) {
   *       A.instance.prototype.m = c = compile(m);
   *     }
   *     return c.apply(this, arguments);
   *   }
   * }();
   *
   * This doesn't guarantee that the trampoline won't be called again, an unpatched reference to the trampoline
   * could have leaked somewhere.
   *
   * In fact, the memoizer first has to memoize the trampoline. When the trampoline is executed it needs to patch
   * the memoizer so that the next time around it memoizes |Fm| instead of the trampoline. The trampoline also has
   * to patch |m'| with |Fm|, as well as |m| on the instance with a bound |Fm|.
   *
   * Class inheritance further complicates this picture. Suppose we extend class |A| and call the |m| method on an
   * instance of |B|.
   *
   * class B extends A { }
   *
   * var b = new B();
   * b.m();
   *
   * At first class |A| has a memoizer for |m| and a trampoline for |m'|. If we never call |m| on an instance of |A|
   * then the trampoline is not resolved to a function. When we create class |B| we copy over all the traits in the
   * |A.instance.prototype| to |B.instance.prototype| including the memoizers and trampolines. If we call |m| on an
   * instance of |B| then we're going through a memoizer which will be patched to |Fm| by the trampoline and will
   * be reflected in the entire inheritance hierarchy. The problem is when calling |b.m'()| which currently holds
   * the copied trampoline |Ta| which will patch |A.instance.prototype.m'| and not |m'| in |B|s instance prototype.
   *
   * To solve this we keep track of where trampolines are copied and then patching these locations. We store copy
   * locations in the trampoline function object themselves.
   *
   */

  export interface ITrampoline extends Function {
    trigger: () => void;
    isTrampoline: boolean;
    debugName: string;
    patchTargets: Shumway.AVM2.Runtime.IPatchTarget [];
  }

  export interface IMemoizer extends Function {
    isMemoizer: boolean;
    debugName: string;
  }

  /**
   * Creates a trampoline function stub which calls the result of a |forward| callback. The forward
   * callback is only executed the first time the trampoline is executed and its result is cached in
   * the trampoline closure.
   */
  export function makeTrampoline(forward: Function, parameterLength: number, description?: string): ITrampoline {
    release || assert (forward && typeof forward === "function");
    return (function trampolineContext() {
      var target = null;
      /**
       * Triggers the trampoline and executes it.
       */
      var trampoline: ITrampoline = <ITrampoline><any>function execute() {
        if (Shumway.AVM2.Runtime.traceExecution.value >= 3) {
          log("Trampolining");
        }
        countTimeline("Executing Trampoline");
        Shumway.AVM2.Runtime.traceCallExecution.value > 1 && callWriter.writeLn("Trampoline: " + description);
        if (!target) {
          target = forward(trampoline);
          release || assert (target);
        }
        return target.asApply(this, arguments);
      };
      /**
       * Just triggers the trampoline without executing it.
       */
      trampoline.trigger = function trigger() {
        countTimeline("Triggering Trampoline");
        if (!target) {
          target = forward(trampoline);
          release || assert (target);
        }
      };
      trampoline.isTrampoline = true;
      trampoline.debugName = "Trampoline #" + vmNextTrampolineId++;
      // Make sure that the length property of the trampoline matches the trait's number of
      // parameters. However, since we can't redefine the |length| property of a function,
      // we define a new hidden |VM_LENGTH| property to store this value.
      defineReadOnlyProperty(trampoline, VM_LENGTH, parameterLength);
      return trampoline;
    })();
  }

  export function makeMemoizer(qn, target): IMemoizer {
    function memoizer() {
      countTimeline("Runtime: Memoizing");
      // release || assert (!Object.prototype.hasOwnProperty.call(this, "class"), this);
      if (Shumway.AVM2.Runtime.traceExecution.value >= 3) {
        log("Memoizing: " + qn);
      }
      Shumway.AVM2.Runtime.traceCallExecution.value > 1 && callWriter.writeLn("Memoizing: " + qn);
      if (isNativePrototype(this)) {
        countTimeline("Runtime: Method Closures");
        return bindSafely(target.value, this);
      }
      if (isTrampoline(target.value)) {
        // If the memoizer target is a trampoline then we need to trigger it before we bind the memoizer
        // target to |this|. Triggering the trampoline will patch the memoizer target but not actually
        // call it.
        target.value.trigger();
      }
      release || assert (!isTrampoline(target.value), "We should avoid binding trampolines.");
      var mc = null;
      if (this instanceof Shumway.AVM2.AS.ASClass) {
        countTimeline("Runtime: Static Method Closures");
        mc = bindSafely(target.value, this);
        defineReadOnlyProperty(this, qn, mc);
        return mc;
      }
      if (Object.prototype.hasOwnProperty.call(this, qn)) {
        var pd = Object.getOwnPropertyDescriptor(this, qn);
        if (pd.get) {
          countTimeline("Runtime: Method Closures");
          return bindSafely(target.value, this);
        }
        countTimeline("Runtime: Unpatched Memoizer");
        return this[qn];
      }
      mc = bindSafely(target.value, this);
      mc.methodInfo = target.value.methodInfo;
      defineReadOnlyProperty(mc, Multiname.getPublicQualifiedName("prototype"), null);
      defineReadOnlyProperty(this, qn, mc);
      return mc;
    }
    var m: IMemoizer = <IMemoizer><any>memoizer;
    countTimeline("Runtime: Memoizers");
    m.isMemoizer = true;
    m.debugName = "Memoizer #" + vmNextMemoizerId++;
    return m;
  }

  function isTrampoline(fn) {
    release || assert (fn && typeof fn === "function");
    return fn.isTrampoline;
  }

  export function isMemoizer(fn) {
    release || assert (fn && typeof fn === "function");
    return fn.isMemoizer;
  }
}
