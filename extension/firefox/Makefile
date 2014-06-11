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
CLOSURE ?= $(UTILS_HOME)/cc.jar
BUILD_DIR = ../../build/firefox
GENERIC_DIR = ../../build/bundles

# Just builds a ff extension

VERSION_BASELINE=9c77cb929464c1bca343f4
VERSION=0.9.`git log --format=oneline $(VERSION_BASELINE)..|wc -l|tr -d ' '`
VERSION_SHA=`git log --format="%h" -n 1`

build: ensureoutputdir
	# Coping extension files
	echo "Creating extension verions: $(VERSION)"
	cp -R ../../LICENSE content bootstrap.js $(BUILD_DIR)/
	sed s/\(SHUMWAY_VERSION\)/$(VERSION)/ install.rdf > $(BUILD_DIR)/install.rdf
	sed s/\(SHUMWAY_VERSION\)/$(VERSION)/ update.rdf > $(BUILD_DIR)/update.rdf
	# Coping JavaScript content files
	mkdir -p $(BUILD_DIR)/content/playerglobal
	cp ../../build/playerglobal/playerglobal.json $(BUILD_DIR)/content/playerglobal/
	cp ../../build/playerglobal/playerglobal.abcs $(BUILD_DIR)/content/playerglobal/
	mkdir -p $(BUILD_DIR)/content/avm2/generated/builtin
	cp ../../src/avm2/generated/builtin/builtin.abc $(BUILD_DIR)/content/avm2/generated/builtin/
	mkdir -p $(BUILD_DIR)/content/avm2/generated/avm1lib
	cp ../../src/avm2/generated/avm1lib/avm1lib.abc $(BUILD_DIR)/content/avm2/generated/avm1lib/
	# Coping shumway.js files
	cp $(GENERIC_DIR)/shumway*.js $(BUILD_DIR)/content/
	cp ../../src/player/fakechannel.js $(BUILD_DIR)/content/
	cp ../../build/ts/player/test/*.js $(BUILD_DIR)/content/
	echo $(VERSION) > $(BUILD_DIR)/content/version.txt
	echo $(VERSION_SHA) >> $(BUILD_DIR)/content/version.txt
	echo "extension" >> $(BUILD_DIR)/content/version.txt
	# Packaging XPI file
	cd $(BUILD_DIR); zip -r shumway.xpi *

../../build/playerglobal/playerglobal.abcs:
	make -C $(UTILS_HOME) build-playerglobal

ensureoutputdir: clean
	-mkdir -p $(BUILD_DIR)

clean:
	-rm -rf build
	-rm -rf $(BUILD_DIR)

PHONY: build clean ensureoutputdir
