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

build: ensureoutputdir
	# Copying extension files
	echo "Creating mozcentral package"
	mkdir -p $(BUILD_EXTENSION_DIR)
	cp -R ../../LICENSE $(EXTENSION_SRC)/chrome $(EXTENSION_SRC)/content $(BUILD_EXTENSION_DIR)/
	cp ../../examples/inspector/debug/pingpong.js $(BUILD_EXTENSION_DIR)/chrome/
	cp -R browser $(BUILD_DIR)/
	# Copying JavaScript content files
	mkdir -p $(BUILD_EXTENSION_DIR)/content/playerglobal
	cp ../../build/playerglobal/playerglobal.json $(BUILD_EXTENSION_DIR)/content/playerglobal/
	cp ../../build/playerglobal/playerglobal.abcs $(BUILD_EXTENSION_DIR)/content/playerglobal/
	mkdir -p $(BUILD_EXTENSION_DIR)/content/libs
	cp ../../build/libs/builtin.abc $(BUILD_EXTENSION_DIR)/content/libs/
	# Copying closure optimized shumway.js files
	cp $(BUNDLES_DIR)/shumway*.js $(BUILD_EXTENSION_DIR)/content/
	cp ../../build/version/version.txt $(BUILD_EXTENSION_DIR)/content/version.txt

ensureoutputdir: clean
	-mkdir -p $(BUILD_DIR)

clean:
	-rm -rf $(BUILD_DIR)

PHONY: build clean ensureoutputdir
