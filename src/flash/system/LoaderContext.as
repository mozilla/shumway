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

package flash.system {
import flash.display.DisplayObjectContainer;

[native(cls='LoaderContextClass')]
public class LoaderContext {
  public native function LoaderContext(checkPolicyFile:Boolean = false,
                                applicationDomain:ApplicationDomain = null,
                                securityDomain:SecurityDomain = null);
  public var checkPolicyFile:Boolean;
  public var applicationDomain:ApplicationDomain;
  public var securityDomain:SecurityDomain;
  public var allowCodeImport:Boolean;
  public var requestedContentParent:DisplayObjectContainer;
  public var parameters:Object;
  public var imageDecodingPolicy:String;
}
}
