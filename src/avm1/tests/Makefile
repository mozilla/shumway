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

TESTS = \
	test.stream.js \
#	test.interpreter.js \
	$(NULL)

NODE_MODULES = ../../../utils/node_modules
MOCHA_HOME = $(NODE_MODULES)/.bin

default:
	echo "run: make test"

test:
	NODE_PATH=$(NODE_MODULES) $(MOCHA_HOME)/mocha --reporter dot $(TESTS)

.PHONY: default test
