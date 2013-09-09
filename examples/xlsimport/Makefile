# Copyright 2013 Mozilla Foundation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

BASE = ../..
SOURCES = ./as3xls-read-only/src
COMPC = $(BASE)/utils/flex_sdk/bin/compc

build: as3xls-read-only
	$(COMPC) -compiler.source-path="$(SOURCES)" -output as3xls-lib.swc -include-classes="com.as3xls.xls.ExcelFile"

as3xls-read-only:
	svn checkout http://as3xls.googlecode.com/svn/trunk/ as3xls-read-only

