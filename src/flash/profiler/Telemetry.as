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

package flash.profiler {

[native(cls='TelemetryClass')]
public final class Telemetry {
  public static native function get spanMarker(): Number;
  public static native function get connected(): Boolean;
  public static native function sendMetric(metric: String, value): void;
  public static native function sendSpanMetric(metric: String, startSpanMarker: Number,
                                               value = null): void;
  public static native function registerCommandHandler(commandName: String,
                                                       handler: Function): Boolean;
  public static native function unregisterCommandHandler(commandName: String): Boolean;
  public function Telemetry() {}
}
}
