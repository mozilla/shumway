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

default:

BROWSER_MANIFEST ?= resources/browser_manifests/browser_manifest.json
TEST_CMD = python -u test.py

check-browser-manifest:
	@ls $(BROWSER_MANIFEST) || { echo "ERROR: Browser manifest file is not found at test/$(BROWSER_MANIFEST). Create one using the examples at test/resources/browser_manifests/."; exit 1; }

reftest: check-browser-manifest
	$(TEST_CMD) --reftest --browserManifestFile=$(BROWSER_MANIFEST) $(TEST_FLAGS)

makeref: check-browser-manifest
	$(TEST_CMD) --masterMode --browserManifestFile=$(BROWSER_MANIFEST) $(TEST_FLAGS)

reftest-swfdec: check-browser-manifest
	$(TEST_CMD) --reftest --browserManifestFile=$(BROWSER_MANIFEST) --manifestFile=swfdec_test_manifest.json

JSHINT = ../utils/node_modules/.bin/jshint
JSHINT_CONFIG = ./jshint_config.json

SRC_ROOT = ../src
AVM1_PATH = $(SRC_ROOT)/avm1
AVM2_PATH = $(SRC_ROOT)/avm2
SWF_PATH = $(SRC_ROOT)/swf
FLASH_PATH = $(SRC_ROOT)/flash

SOURCES = \
	$(AVM1_PATH)/*.js \
	$(FLASH_PATH) \
	$(SWF_PATH)/*.js \
	$(NULL)

lint:
	$(JSHINT) --config $(JSHINT_CONFIG) $(SOURCES)
	echo "SUCCESS: no lint errors"

.PHONY: default reftest reftest-swfdec makeref check-browser-manifest \
        lint

