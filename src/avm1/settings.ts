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


module Shumway.AVM1 {
  import Option = Shumway.Options.Option;
  import OptionSet = Shumway.Options.OptionSet;

  import shumwayOptions = Shumway.Settings.shumwayOptions;

  var avm1Options = shumwayOptions.register(new OptionSet("AVM1"));
  export var avm1TraceEnabled = avm1Options.register(new Option("t1", "traceAvm1", "boolean", false, "trace AVM1 execution"));
  export var avm1ErrorsEnabled = avm1Options.register(new Option("e1", "errorsAvm1", "boolean", false, "fail on AVM1 warnings and errors"));
  export var avm1TimeoutDisabled = avm1Options.register(new Option("ha1", "nohangAvm1", "boolean", false, "disable fail on AVM1 hang"));
  export var avm1CompilerEnabled = avm1Options.register(new Option("ca1", "compileAvm1", "boolean", true, "compiles AVM1 code"));
  export var avm1DebuggerEnabled = avm1Options.register(new Option("da1", "debugAvm1", "boolean", false, "allows AVM1 code debugging"));
  export var avm1WellknownActionsCompilationsEnabled = avm1Options.register(new Option("cw1", "wellknownAvm1", "boolean", true, "Replaces well-known actions patterns instead of compilation"));
}