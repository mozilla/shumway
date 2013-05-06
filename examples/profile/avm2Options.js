/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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

var Counter = new metrics.Counter(true);
var Timer = metrics.Timer;
var Option = options.Option;
var OptionSet = options.OptionSet;
var systemOptions = new OptionSet("System Options");
var disassemble = systemOptions.register(new Option("d", "disassemble", "boolean", false, "disassemble"));
var traceLevel = systemOptions.register(new Option("t", "traceLevel", "number", 0, "trace level"));
