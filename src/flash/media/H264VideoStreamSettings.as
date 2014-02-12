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

package flash.media {
public class H264VideoStreamSettings extends VideoStreamSettings {
  private var _profile: String;
  private var _level: String;
  public function H264VideoStreamSettings() {
    _profile = H264Profile.BASELINE;
    _level = H264Level.LEVEL_2_1;
  }
  public override function get codec(): String {
    return VideoCodec.H264AVC;
  }
  public function get profile(): String {
    return _profile;
  }
  public function get level(): String {
    return _level;
  }
  public function setProfileLevel(profile: String, level: String): void
  {
    if (profile.toLowerCase() != H264Profile.BASELINE &&
        profile.toLowerCase() != H264Profile.MAIN)
    {
      Error.throwError(ArgumentError, 2008, "profile");
    }

    if (level !== H264Level.LEVEL_1 && level.toLowerCase() !== H264Level.LEVEL_1B &&
        level !== H264Level.LEVEL_1_1 && level !== H264Level.LEVEL_1_2 &&
        level !== H264Level.LEVEL_1_3 && level !== H264Level.LEVEL_2 &&
        level !== H264Level.LEVEL_2_1 && level !== H264Level.LEVEL_2_2 &&
        level !== H264Level.LEVEL_3 && level !== H264Level.LEVEL_3_1 &&
        level !== H264Level.LEVEL_3_2 && level !== H264Level.LEVEL_4 &&
        level !== H264Level.LEVEL_4_1 && level !== H264Level.LEVEL_4_2 &&
        level !== H264Level.LEVEL_5 && level !== H264Level.LEVEL_5_1)
    {
      Error.throwError(ArgumentError, 2008, "level");
    }
    _profile = profile;
    _level = level;
}
}
}
