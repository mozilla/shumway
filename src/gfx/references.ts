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

/// <reference path='../../build/ts/base.d.ts' />
/// <reference path='../../build/ts/tools.d.ts' />
/// <reference path='../../build/ts/gfx-base.d.ts' />

/// <reference path='2d/debug.ts'/>
/// <reference path='2d/surface.ts'/>
/// <reference path='2d/2d.ts'/>
/// <reference path='easel.ts'/>
/// <reference path='debug/tree.ts'/>

/// <reference path='remotingGfx.ts' />
/// <reference path='easelHost.ts' />
/// <reference path='window/windowEaselHost.ts' />
/// <reference path='test/recorder.ts' />
/// <reference path='test/playbackEaselHost.ts' />
/// <reference path='test/recordingEaselHost.ts' />

interface WebGLActiveInfo {
  location: any;
}

interface WebGLProgram extends WebGLObject {
  uniforms: any;
  attributes: any;
}
