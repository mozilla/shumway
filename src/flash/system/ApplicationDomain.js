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

var ApplicationDomainDefinition = (function () {
  return {
    // (parentDomain:ApplicationDomain = null)
    __class__: "flash.system.ApplicationDomain",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          currentDomain: {
            get: function currentDomain() { // (void) -> ApplicationDomain
              notImplemented("ApplicationDomain.currentDomain");
            }
          },
          MIN_DOMAIN_MEMORY_LENGTH: {
            get: function MIN_DOMAIN_MEMORY_LENGTH() { // (void) -> uint
              notImplemented("ApplicationDomain.MIN_DOMAIN_MEMORY_LENGTH");
            }
          }
        },
        instance: {
          ctor: function ctor(parentDomain) { // (parentDomain:ApplicationDomain) -> void
            notImplemented("ApplicationDomain.ctor");
          },
          getDefinition: function getDefinition(name) { // (name:String) -> Object
            notImplemented("ApplicationDomain.getDefinition");
          },
          hasDefinition: function hasDefinition(name) { // (name:String) -> Boolean
            notImplemented("ApplicationDomain.hasDefinition");
          },
          getQualifiedDefinitionNames: function getQualifiedDefinitionNames() { // (void) -> Vector
            notImplemented("ApplicationDomain.getQualifiedDefinitionNames");
          },
          parentDomain: {
            get: function parentDomain() { // (void) -> ApplicationDomain
              notImplemented("ApplicationDomain.parentDomain");
              return this._parentDomain;
            }
          },
          domainMemory: {
            get: function domainMemory() { // (void) -> ByteArray
              notImplemented("ApplicationDomain.domainMemory");
              return this._domainMemory;
            },
            set: function domainMemory(mem) { // (mem:ByteArray) -> any
              notImplemented("ApplicationDomain.domainMemory");
              this._domainMemory = mem;
            }
          }
        }
      },
    }
  };
}).call(this);
