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
/*global AVM2, Domain, Multiname */
/**
 * Application domains don't have 1-1 object reference relationship with the real domain objects, not sure
 * why, but for instance ApplicationDomain.currentDomain !== ApplicationDomain.currentDomain. The getter
 * returns a new ApplicationDomain object reference each time. This is easier to implement, we just always
 * keep track of the nativeObject and create new ApplicationDomains views on it each time.
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
              return new flash.system.ApplicationDomain(AVM2.currentDomain());
            }
          },
          MIN_DOMAIN_MEMORY_LENGTH: {
            get: function MIN_DOMAIN_MEMORY_LENGTH() { // (void) -> uint
              notImplemented("ApplicationDomain.MIN_DOMAIN_MEMORY_LENGTH");
            }
          }
        },
        instance: {
          ctor: function ctor(parentDomainOrNativeObject) { // (parentDomain:ApplicationDomain) -> void
            if (parentDomainOrNativeObject instanceof Domain) {
              this.nativeObject = parentDomainOrNativeObject;
              return;
            }
            // If no parent domain is passed in, use the current system domain.
            var parentNativeObject = parentDomainOrNativeObject ?
              parentDomainOrNativeObject.nativeObject : AVM2.currentDomain().system;
            this.nativeObject = new Domain(parentNativeObject.vm, parentNativeObject);
          },
          getDefinition: function getDefinition(name) { // (name:String) -> Object
            var simpleName = name.replace("::", ".");
            return this.nativeObject.getProperty(Multiname.fromSimpleName(simpleName), true, true);
          },
          hasDefinition: function hasDefinition(name) { // (name:String) -> Boolean
            if (name === undefined) {
              return false;
            }
            var simpleName = name.replace("::", ".");
            return !!this.nativeObject.findDomainProperty(Multiname.fromSimpleName(simpleName), false, false);
          },
          getQualifiedDefinitionNames: function getQualifiedDefinitionNames() { // (void) -> Vector
            notImplemented("ApplicationDomain.getQualifiedDefinitionNames");
          },
          parentDomain: {
            get: function parentDomain() { // (void) -> ApplicationDomain
              var base = this.nativeObject.base;
              if (!base) {
                return undefined;
              }
              return new flash.system.ApplicationDomain(base);
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
      script: { static: Glue.ALL, instance: Glue.ALL }
    }
  };
}).call(this);
