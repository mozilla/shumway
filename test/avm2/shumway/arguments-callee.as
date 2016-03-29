/*
 * Copyright 2015 Mozilla Foundation
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

package  {
public class CalleeTest {

  static public var init = false;
  public function CalleeTest() {
    trace('constructor:');
    trace(this + '');
    //trace(arguments.callee == Quick);
    if (CalleeTest.init) {
      return;
    }
    CalleeTest.init = true;
    // Currently not supported: closures for constructors.
    //arguments.callee();

    trace('\ninner function:');
    function fn() {
      trace(arguments.callee + '');
      trace(arguments.callee == fn);
    }
    fn();

    trace('\ntrait function:');
    var foo2 = foo();

    trace(foo2 == foo);

    trace('\nextracted trait function:');
    foo2(foo2);
  }

  public function foo(extractedCallee: Function = null) {
    trace(this + '');
    trace(arguments.callee.constructor + '');
    if (extractedCallee !== null) {
      trace('callee is memoized: ' + (extractedCallee === arguments.callee));
    }
    return arguments.callee;
  }
}

new CalleeTest();
}
