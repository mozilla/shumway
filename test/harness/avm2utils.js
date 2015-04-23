/*
 * Copyright 2013 Mozilla Foundation
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

var shumwayOptions = Shumway.Settings.shumwayOptions;
var avm2Options = shumwayOptions.register(new OptionSet("AVM2"));
var sysCompiler = avm2Options.register(new Option("sysCompiler", "sysCompiler", "boolean", true, "system compiler/interpreter (requires restart)"));
var appCompiler = avm2Options.register(new Option("appCompiler", "appCompiler", "boolean", true, "application compiler/interpreter (requires restart)"));

//Shumway.AVM2.Runtime.enableVerifier.value = true;
release = true;

var builtinPath = WEB_ROOT + "../build/libs/builtin.abc";

var playerglobalInfo = {
  abcs: WEB_ROOT + "../build/playerglobal/playerglobal.abcs",
  catalog: WEB_ROOT + "../build/playerglobal/playerglobal.json"
};

