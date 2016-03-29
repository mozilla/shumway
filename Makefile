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
	@echo "run: make [check-system|bootstrap|install-utils|install-libs|"
	@echo "           build-playerglobal|build-extension|build-web|build-libs|"
	@echo "           run-tamarin-tests|run-tamarin-sanity-tests|test-avm2|"
	@echo "           reftest|makeref|update-flash-refs|build-tamarin-tests|"
	@echo "           install-avmshell|install-tamarin-src|link-utils]"

check-system:
	echo "Checking the presence of grunt-cli..."
	grunt --version
	echo "Checking the presence of java..."
	java -version
	echo "Checking the presence of node..."
	node -v
	if node -v | grep -e "v0\\.[0-7]\\." ; then \
	  echo "node 0.8+"; exit 1; \
	fi
	echo "The environment is good"

bootstrap: check-system install-libs install-utils show-welcome

install-libs:
	git submodule init
	git submodule update

install-utils: check-system
	npm install
	make -C utils/ install-avmshell install-js

install-avmshell:
	make -C utils/ install-avmshell

install-tamarin-src: check-system
	echo "Checking the presence of mercurial..."
	hg --version
	make -C utils/ install-tamarin-src install-tamarin-tests

BASE ?= $(error ERROR: Specify BASE that points to the Shumway folder with installed utils)

link-utils:
	cp -R $(BASE)/node_modules .
	ln -s $(BASE)/utils/tamarin-redux $(BASE)/utils/jsshell $(BASE)/utils/swfdec utils/
	ln -s $(BASE)/test/ats/swfs test/ats/swfs

clone-build:
	cp -R $(BASE)/build .

run-tamarin-sanity-tests:
	make -C utils/ run-tamarin-sanity-tests

run-tamarin-tests:
	make -C utils/ run-tamarin-tests

show-welcome:
	echo "Everything's in order, now run \`grunt build\` to compile."

build-libs:
	grunt shu

build-playerglobal:
	make -C utils/ build-playerglobal

build-extension:
	grunt firefox

build-web:
	grunt web

MXMLC_FLAGS ?= -static-link-runtime-shared-libraries
MXMLC = ./utils/flex_sdk/bin/mxmlc $(MXMLC_FLAGS)
%.swf: %.as
	$(MXMLC) $<

update-flash-refs:
	grunt update-flash-refs

test-avm2:
	grunt exec:test_avm2_quick

reftest:
	grunt reftest

makeref:
	grunt makeref

reftest-swfdec:
	grunt reftest-swfdec

lint:
	grunt tslint:all

server:
	grunt server

.PHONY: check-system install-libs install-utils build-tamarin-tests \
        build-playerglobal build-extension build-web default \
        reftest makeref check-browser-manifest test-avm2 \
        link-utils clone-build bootstrap show-welcome

