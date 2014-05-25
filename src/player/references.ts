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

///<reference path='../flash/references.ts' />
///<reference path='frameScheduler.ts' />
///<reference path='remoting.ts' />
///<reference path='remotingPlayer.ts' />
///<reference path='remotingGfx.ts' />
///<reference path='player.ts' />
///<reference path='easel.ts' />
///<reference path='embed.ts' />

// declare var timeline: any;
// declare var shumwayOptions: any;

module Shumway {
  import Option = Shumway.Options.Option;
  import OptionSet = Shumway.Options.OptionSet;

  export var playerOptions = shumwayOptions.register(new OptionSet("Player Options"));

  export var frameEnabledOption = playerOptions.register (
    new Shumway.Options.Option("", "Enable Frame Execution", "boolean", true, "Enable frame execution.")
  );

  export var timerEnabledOption = playerOptions.register (
    new Shumway.Options.Option("", "Enable Timers", "boolean", true, "Enable timer events.")
  );

  export var pumpEnabledOption = playerOptions.register (
    new Shumway.Options.Option("", "Enable Pump", "boolean", true, "Enable display tree serialization.")
  );

  export var pumpRateOption = playerOptions.register (
    new Shumway.Options.Option("", "Pump Rate", "number", 80, "Number of times / second that the display list is synchronized.", {range: { min: 1, max: 120, step: 1 }})
  );

  export var frameRateOption = playerOptions.register (
    new Shumway.Options.Option("", "Frame Rate", "number", 60, "Override a movie's frame rate, set to -1 to use the movies default frame rate.", {range: { min: 1, max: 120, step: 1 }})
  );

  export var frameRateMultiplierOption = playerOptions.register (
    new Shumway.Options.Option("", "Frame Rate Multiplier", "number", 1, "Play frames at a faster rate.", {range: { min: 1, max: 16, step: 1 }})
  );
}
