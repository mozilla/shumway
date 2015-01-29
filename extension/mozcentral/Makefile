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

UTILS_HOME = ../../utils
CLOSURE ?= $(UTILS_HOME)/closure.jar
BUILD_DIR = ../../build/mozcentral
BUILD_EXTENSION_DIR = $(BUILD_DIR)/browser/extensions/shumway
BUNDLES_DIR = ../../build/bundles-cc
EXTENSION_SRC = ../firefox

# Just builds a ff extension

VERSION_BASELINE=9c77cb929464c1bca343f4
VERSION=0.9.`git log --format=oneline $(VERSION_BASELINE)..|wc -l|tr -d ' '`
VERSION_SHA=`git log --format="%h" -n 1`

build: ensureoutputdir
	# Coping extension files
	echo "Creating mozcentral package verions: $(VERSION)"
	mkdir -p $(BUILD_EXTENSION_DIR)
	cp -R ../../LICENSE $(EXTENSION_SRC)/chrome $(EXTENSION_SRC)/content $(BUILD_EXTENSION_DIR)/
	cp -R browser $(BUILD_DIR)/
	mkdir -p $(BUILD_EXTENSION_DIR)/content/gfx/gl/shaders
	cp ../../src/gfx/gl/shaders/combined.frag $(BUILD_EXTENSION_DIR)/content/gfx/gl/shaders/
	cp ../../src/gfx/gl/shaders/combined.vert $(BUILD_EXTENSION_DIR)/content/gfx/gl/shaders/
	# Coping JavaScript content files
	mkdir -p $(BUILD_EXTENSION_DIR)/content/playerglobal
	cp ../../build/playerglobal/playerglobal.json $(BUILD_EXTENSION_DIR)/content/playerglobal/
	cp ../../build/playerglobal/playerglobal.abcs $(BUILD_EXTENSION_DIR)/content/playerglobal/
	mkdir -p $(BUILD_EXTENSION_DIR)/content/avm2/generated/builtin
	cp ../../src/avm2/generated/builtin/builtin.abc $(BUILD_EXTENSION_DIR)/content/avm2/generated/builtin/
	# Coping closure optimized shumway.js files
	cp $(BUNDLES_DIR)/shumway*.js $(BUILD_EXTENSION_DIR)/content/
	echo $(VERSION) > $(BUILD_EXTENSION_DIR)/content/version.txt
	echo $(VERSION_SHA) >> $(BUILD_EXTENSION_DIR)/content/version.txt

ensureoutputdir: clean
	-mkdir -p $(BUILD_DIR)

clean:
	-rm -rf $(BUILD_DIR)

PHONY: build clean ensureoutputdir
