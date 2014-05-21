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
import flash.utils.ByteArray;

[native(cls='ApplicationDomainClass')]
public final class ApplicationDomain {
  public static native function get currentDomain():ApplicationDomain;
  public static native function get MIN_DOMAIN_MEMORY_LENGTH():uint;
  public native function ApplicationDomain(parentDomain:ApplicationDomain = null);
  public native function get parentDomain():ApplicationDomain;
  public native function get domainMemory():ByteArray;
  public native function set domainMemory(mem:ByteArray);
  public native function getDefinition(name:String):Object;
  public native function hasDefinition(name:String):Boolean;
  public native function getQualifiedDefinitionNames():Vector;
}
}
