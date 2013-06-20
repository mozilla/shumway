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
	@echo "run: make [check-system|install-utils|install-libs|build-tamarin-tests|"
	@echo "           build-playerglobal|build-extension|build-web|"
	@echo "           run-tamarin-tests|run-tamarin-sanity-tests|check-extension|"
	@echo "           test|push-test|build-bot|start-build-bot|update-flash-refs]"

check-system:
	echo "Checking the presence of mercurial..."
	hg --version
	echo "Checking the presence of wget..."
	wget --version
	echo "Checking the presence of java..."
	java -version
	echo "Checking the presence of node..."
	node -v
	if node -v | grep -e "v0\\.[0-7]\\." ; then \
	  echo "node 0.8+"; exit 1; \
	fi
	echo "The environment is good"

install-libs:
	git submodule init
	git submodule update

install-utils: check-system
	make -C utils/ install-asc install-closure install-tamarin install-js install-node-modules install-flex-sdk

BASE ?= $(error ERROR: Specify BASE that points to the Shumway folder with installed utils)

link-utils:
	ln -s $(BASE)/utils/asc.jar $(BASE)/utils/cc.jar $(BASE)/utils/tamarin-redux $(BASE)/utils/jsshell $(BASE)/utils/node_modules utils/

run-tamarin-sanity-tests:
	make -C utils/ run-tamarin-sanity-tests

run-tamarin-tests:
	make -C utils/ run-tamarin-tests

build-playerglobal:
	make -C utils/ build-playerglobal

build-extension:
	make -C extension/firefox/ build

FIREFOX_PATH ?= $(error ERROR: Specify FIREFOX_PATH)

check-extension: build-extension
	cd test/extension; python check.py -b "$(FIREFOX_PATH)"

build-web:
	make -C web/ build

MXMLC_FLAGS ?= -static-link-runtime-shared-libraries
MXMLC = ./utils/flex_sdk/bin/mxmlc $(MXMLC_FLAGS)
%.swf: %.as
	$(MXMLC) $<

update-flash-refs:
	node utils/update-flash-refs.js examples/inspector/inspector.html src/flash
	node utils/update-flash-refs.js examples/racing/index.html src/flash
	node utils/update-flash-refs.js test/harness/slave.html src/flash

test: test-avm1 test-avm2

test-avm1:
	make -C src/avm1/tests/ test

test-avm2:
	make -C src/avm2/bin/ test-regress

reftest:
	make -C test/ reftest

makeref:
	make -C test/ makeref

reftest-swfdec:
	make -C test/ reftest-swfdec

lint:
	make -C test/ lint

hello-world:
	make -C src/avm2/bin/ hello-world

IRC_ROOM = shumway-build-bot

server:
	python -m SimpleHTTPServer

push-test:
	git pull origin master

	echo "Started test-interpreter-all" > /tmp/irc.mozilla.org/#$(IRC_ROOM)/in
	make THREADS=8 -C src/avm2/bin/ test-interpreter-all
	rsync -r -avz -e ssh src/avm2/bin/runs/ haxpath@haxpath.com:~/public/haxpath.com/public/Shumway/src/avm2/bin/runs/
	echo "http://haxpath.com/Shumway/src/avm2/bin/plot/plot.html?runs="`cat .build_bot_latest_head`.i.parallel > /tmp/irc.mozilla.org/#$(IRC_ROOM)/in

	echo "Started test-all" > /tmp/irc.mozilla.org/#$(IRC_ROOM)/in
	make THREADS=8 -C src/avm2/bin/ test-all
	rsync -r -avz -e ssh src/avm2/bin/runs/ haxpath@haxpath.com:~/public/haxpath.com/public/Shumway/src/avm2/bin/runs/
	echo "http://haxpath.com/Shumway/src/avm2/bin/plot/plot.html?runs="`cat .build_bot_latest_head`.icov.parallel > /tmp/irc.mozilla.org/#$(IRC_ROOM)/in

build-bot:
	if [ ! -f .build_bot_previous_head ] ; then \
		git rev-parse master > .build_bot_previous_head ; \
	fi
	git pull origin master ;
	git rev-parse master > .build_bot_latest_head ;
	if ! diff .build_bot_latest_head .build_bot_previous_head > /dev/null ; then \
		echo "Building" ; \
		cat .build_bot_latest_head > .build_bot_previous_head ; \
		echo "Started "`cat .build_bot_latest_head` > /tmp/irc.mozilla.org/#$(IRC_ROOM)/in ; \
		make push-test ; \
		echo "Finished All" > /tmp/irc.mozilla.org/#$(IRC_ROOM)/in ; \
	fi

start-build-bot:
	# Login to IRC
	ii -i /tmp -s irc.mozilla.org -n shumway-build-bot &
	echo "/JOIN #$(IRC_ROOM)" > /tmp/irc.mozilla.org/in
	while [ 1 ] ; do \
		make build-bot ; \
		sleep 60 ; \
	done

.PHONY: check-system install-libs install-utils build-tamarin-tests \
        build-playerglobal build-extension build-web test default \
        reftest reftest-swfdec makeref check-browser-manifest \
        test-avm1 test-avm2

