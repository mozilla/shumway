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
BUILD_DIR = ../../build/firefox
BUNDLES_DIR = ../../build/bundles-cc

# Just builds a ff extension

VERSION = `head -n 1 ../../build/version/version.txt`

build: ensureoutputdir
	# Copying extension files
	echo "Creating extension version: $(VERSION)"
	cp -R ../../LICENSE content chrome bootstrap.js chrome.manifest icon.png icon64.png $(BUILD_DIR)/
	sed s/\(SHUMWAY_VERSION\)/$(VERSION)/ install.rdf > $(BUILD_DIR)/install.rdf
	sed s/\(SHUMWAY_VERSION\)/$(VERSION)/ update.rdf > $(BUILD_DIR)/update.rdf
	cp ../../examples/inspector/debug/pingpong.js $(BUILD_DIR)/chrome/
	# Copying WebGL shaders
	mkdir -p $(BUILD_DIR)/content/gfx/gl/shaders
	cp ../../src/gfx/gl/shaders/combined.frag $(BUILD_DIR)/content/gfx/gl/shaders/
	cp ../../src/gfx/gl/shaders/combined.vert $(BUILD_DIR)/content/gfx/gl/shaders/
	# Copying JavaScript content files
	mkdir -p $(BUILD_DIR)/content/playerglobal
	cp ../../build/playerglobal/playerglobal.json $(BUILD_DIR)/content/playerglobal/
	cp ../../build/playerglobal/playerglobal.abcs $(BUILD_DIR)/content/playerglobal/
	# Coping ABC and Relooper files
	mkdir -p $(BUILD_DIR)/content/libs
	cp ../../build/libs/builtin.abc $(BUILD_DIR)/content/libs/
	cp ../../build/libs/relooper.js $(BUILD_DIR)/content/libs/
	# Copying closure optimized shumway.js files
	cp $(BUNDLES_DIR)/shumway*.js $(BUILD_DIR)/content/
	cp ../../build/version/version.txt $(BUILD_DIR)/content/version.txt
	echo "extension" >> $(BUILD_DIR)/content/version.txt
	# Packaging XPI file
	cd $(BUILD_DIR); zip -r shumway.xpi *

ensureoutputdir: clean
	-mkdir -p $(BUILD_DIR)

clean:
	-rm -rf build
	-rm -rf $(BUILD_DIR)

PHONY: build clean ensureoutputdir
