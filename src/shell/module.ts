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

/**
 * Fake out just enough document to get things loaded.
 */
document = <any>({
  createElementNS: function (namespaceURI: string, qualifiedName: string) {
    return null;
  },
  createElement: function (tagName: string) {
    switch (tagName) {
      case "canvas":
        return {
          getContext: function (x) {
            return null;
          }
        }
    }
  }
});

function addLogPrefix(prefix, args) {
  return [].concat.apply([prefix], args);
}

module Shumway.Shell {

}
