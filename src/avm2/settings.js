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

var $DEBUG;
var release = true;
/**
 * Check arguments and throw the appropriate errors.
 */
var checkArguments = true;

/**
 * Allow overwriting of the native toString / valueOf with AS3 versions.
 */
var useSurrogates = true;

/**
 * Match AS3 add semantics related to toString/valueOf when adding values.
 */
var useAsAdd = true;

/**
 * Seals const traits. Technically we need to throw an exception if they are ever modified after
 * the static or instance constructor executes, but we can safely ignore this incompatibility.
 */
var sealConstTraits = false;

/**
 * Coerce non-primitive parameters. We can "safely" ignore non-primitive coercions because AS3
 * programs with invalid coercions would throw runtime exceptions.
 */
var c4CoerceNonPrimitiveParameters = false;

/**
 * Coerce non-primitive values. Same logic as above.
 */
var c4CoerceNonPrimitive = false;

var c4AsTypeLate = true;
