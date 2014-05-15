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

///<reference path='../options.ts' />
///<reference path='frameScheduler.ts' />
///<reference path='player.ts' />
///<reference path='timeline.ts' />
///<reference path='remoting.ts' />
///<reference path='remotingClient.ts' />
///<reference path='remotingServer.ts' />
///<reference path='../avm2/references.ts' />
///<reference path='../gfx/references.ts' />
///<reference path='../flash.ts/references.ts' />

declare var timeline: any;
declare var shumwayOptions: any;

module Shumway {
  export var playerOptions = shumwayOptions.register(new Shumway.Options.OptionSet("Player Options"));

  /**
   * This provides a way to disable display tree synchronization.
   */
  export var enablePumpUpdates = playerOptions.register (
    new Option("", "enablePumpUpdates", "boolean", true, "Serialize display tree.")
  );
}