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

UNAME = $(shell uname)
THREADS ?= 9

JSSHELL_HOME = ./jsshell
JSSHELL_URL_BASE = http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/2015/02/2015-02-07-03-02-04-mozilla-central/
ifneq ("$(findstring MINGW32, $(UNAME))", "")
JSSHELL_URL = $(JSSHELL_URL_BASE)/jsshell-win32.zip
JSSHELL_CACHED = ./jsshell-cached/jsshell-win32.zip
else
ifeq ($(UNAME), Darwin)
JSSHELL_URL = $(JSSHELL_URL_BASE)/jsshell-mac.zip
JSSHELL_CACHED = ./jsshell-cached/jsshell-mac.zip
else
JSSHELL_URL = $(JSSHELL_URL_BASE)/jsshell-linux-i686.zip
JSSHELL_CACHED = ./jsshell-cached/jsshell-linux.zip
endif
endif

TAMARIN_HOME = ./tamarin-redux
TAMARIN_URL = http://hg.mozilla.org/tamarin-redux

ASC_JAR = ./asc.jar

FLEX_HOME = ./flex_sdk
FLEX_URL = http://download.macromedia.com/pub/flex/sdk/flex_sdk_4.6.zip

ifeq ($(UNAME), Darwin)
DARWING_VER = $(shell uname -a)
ifneq ("$(filter 13.%, $(DARWING_VER))", "")
TAMARIN_CONFIG_PARAMS = --mac-sdk=109 --target=x86_64-darwin
else
ifneq ("$(filter 12.%, $(DARWING_VER))", "")
TAMARIN_CONFIG_PARAMS = --mac-sdk=108 --target=x86_64-darwin
else
ifneq ("$(filter 11.%, $(DARWING_VER))", "")
TAMARIN_CONFIG_PARAMS = --mac-sdk=107 --target=x86_64-darwin
else
TAMARIN_CONFIG_PARAMS = --mac-sdk=106 --target=x86_64-darwin
endif
endif
endif
else
ifeq ($(UNAME), Linux)
TAMARIN_CONFIG_PARAMS = --target=i686-linux
endif
endif

ifeq ($(UNAME), Darwin)
AVMSHELL_PREBUILD=./avmshell/mac/avmshell
else
ifeq ($(UNAME), Linux)
AVMSHELL_PREBUILD=./avmshell/linux/avmshell
else
AVMSHELL_PREBUILD=./avmshell/windows/avmshell.exe
endif
endif

APPARAT_URL = http://apparat.googlecode.com/files/apparat-1.0-RC9-bin.tar.gz
APPARAT_HOME = ./apparat
SCALA_URL = http://www.scala-lang.org/files/archive/scala-2.8.0.final.tgz
SCALA_BIN = $(APPARAT_HOME)/scala-2.8.0.final/bin
APPARAT_BIN = $(APPARAT_HOME)/apparat-1.0-RC9

SHUMWAY_HOME = $(realpath ..)
AVM2_HOME = ../src/avm2
AVMSHELL = avmshell

default:
	@echo "run: make [install-avmshell|install-js|"
	@echo "           install-swfdec|install-node-modules|install-tamarin-src|"
	@echo "           build-tamarin-tests|run-tamarin-tests|build-playerglobal|clean]"

install-avmshell:
	mkdir -p $(TAMARIN_HOME)/bin/shell
	cp $(AVMSHELL_PREBUILD) $(TAMARIN_HOME)/bin
	cp $(AVMSHELL_PREBUILD) $(TAMARIN_HOME)/bin/shell

install-tamarin-src: $(TAMARIN_HOME)/configure.py
	rm -rf $(TAMARIN_HOME)/bin
	mkdir $(TAMARIN_HOME)/bin
	cd $(TAMARIN_HOME)/bin; python ../configure.py $(TAMARIN_CONFIG_PARAMS) --enable-debugger
	ASC=../../$(ASC_JAR) make -C $(TAMARIN_HOME)/bin

install-tamarin-tests: $(TAMARIN_HOME)/configure.py

$(TAMARIN_HOME)/configure.py:
	hg clone $(TAMARIN_URL) $(TAMARIN_HOME)
	cd $(TAMARIN_HOME); hg update -C 2b38aa82c803   # get a stable version
	cd $(TAMARIN_HOME); patch -p 1 < ../patches/tamarin-108-fix.patch
	cd $(TAMARIN_HOME); patch -p 1 < ../patches/tamarin-npexp-fix.patch
	cd $(TAMARIN_HOME); patch -p 1 < ../patches/tamarin-gcc47-fix.patch
	cd $(TAMARIN_HOME); patch -p 1 < ../patches/tamarin-test-shumway.patch
	cp patches/tamarin-acceptance/* $(TAMARIN_HOME)/test/acceptance/

run-tamarin-tests: install-tamarin-tests
	cd $(TAMARIN_HOME)/test/acceptance; SHUMWAY_HOME=$(SHUMWAY_HOME) ASC=../../../$(ASC_JAR) BUILTINABC=../../../../build/libs/builtin.abc SHELLABC=../../../../build/libs/shell.abc python runtests.py --shumway --threads $(THREADS) --vmargs "-rel -i" --log as3.log as3
	cd $(TAMARIN_HOME)/test/acceptance; SHUMWAY_HOME=$(SHUMWAY_HOME) ASC=../../../$(ASC_JAR) BUILTINABC=../../../../build/libs/builtin.abc SHELLABC=../../../../build/libs/shell.abc python runtests.py --shumway --threads $(THREADS) --vmargs "-rel -i" --log ecma3.log ecma3

run-tamarin-e4x-tests: install-tamarin-tests
	cd $(TAMARIN_HOME)/test/acceptance; SHUMWAY_HOME=$(SHUMWAY_HOME) ASC=../../../$(ASC_JAR) BUILTINABC=../../../../build/libs/builtin.abc SHELLABC=../../../../build/libs/shell.abc python runtests.py --shumway  --threads $(THREADS) --timeout 360 --vmargs "-rel -i" --log test.log e4x

run-tamarin-sanity-tests: install-tamarin-tests
	cd $(TAMARIN_HOME)/test/acceptance; SHUMWAY_HOME=$(SHUMWAY_HOME) ASC=../../../$(ASC_JAR) BUILTINABC=../../../../build/libs/builtin.abc SHELLABC=../../../../build/libs/shell.abc python runtests.py --shumway  --threads $(THREADS) --timeout 360 --vmargs "-rel -i" --log test.log ecma3/String ecma3/Function ecma3/ExecutionContexts ecma3/Math/e15_8_2_1.as

run-youtube-tests: install-tamarin-tests
	cd $(TAMARIN_HOME)/test/acceptance; SHUMWAY_HOME=$(SHUMWAY_HOME) ASC=../../../$(ASC_JAR) BUILTINABC=../../../../build/libs/builtin.abc SHELLABC=../../../../build/libs/shell.abc python runtests.py --shumway  --threads 1 --timeout 360 --vmargs "-rel -i" --log test.log ecma3/Math ecma3/Date/e15_9_5.as ecma3/GlobalObject/encodeURIComponent.as ecma3/GlobalObject/decodeURIComponent.as ecma3/GlobalObject/e15_1_2_3_1.as ecma3/GlobalObject/e15_1_2_3_2.as ecma3/GlobalObject/e15_1_2_2_1.as ecma3/GlobalObject/e15_1_2_2_2.as

run-tamarin-performance: install-tamarin-tests
	cd $(TAMARIN_HOME)/test/performance;  SHUMWAY_HOME=$(SHUMWAY_HOME) ASC=../../../$(ASC_JAR) BUILTINABC=../../../../build/libs/builtin.abc SHELLABC=../../../../build/libs/shell.abc python runtests.py --shumway --avm2 ../../bin/shell/$(AVMSHELL)

install-js:
	-rm -rf $(JSSHELL_HOME)
	mkdir -p $(JSSHELL_HOME)
	unzip $(JSSHELL_CACHED) -d $(JSSHELL_HOME)

download-js:
	-rm -rf $(JSSHELL_HOME)
	mkdir -p $(JSSHELL_HOME)
	wget $(JSSHELL_URL) -O $(JSSHELL_HOME)/jsshell.zip
	unzip $(JSSHELL_HOME)/jsshell.zip -d $(JSSHELL_HOME)
ifeq ($(UNAME), Linux)
	# we are not installing the js into the bin path so there might be
	# a conflict with other libnspr4.so -- adding the js bash proxy
	mv $(JSSHELL_HOME)/js $(JSSHELL_HOME)/js-bin
	cp patches/js $(JSSHELL_HOME)/js
	chmod +x $(JSSHELL_HOME)/js
endif

install-apparat: $(APPARAT_HOME)/apparat-1.0-RC9

$(APPARAT_HOME)/apparat-1.0-RC9: $(APPARAT_HOME)/apparat.tar.gz
	tar -xkf $(APPARAT_HOME)/apparat.tar.gz -C $(APPARAT_HOME)/
	tar -xkf $(APPARAT_HOME)/scala.tgz -C $(APPARAT_HOME)/

$(APPARAT_HOME)/apparat.tar.gz:
	mkdir -p $(APPARAT_HOME)
	wget $(SCALA_URL) -O $(APPARAT_HOME)/scala.tgz
	wget $(APPARAT_URL) -O $(APPARAT_HOME)/apparat.tar.gz

install-node-modules:
	mkdir -p node_modules
	npm install mocha@1.11.0 expect.js@0.2.0 jshint@2.1.3 time-grunt@1.1.1 bson@0.3.1

install-swfdec:
	git clone git://anongit.freedesktop.org/swfdec/swfdec

install-flex-sdk:
	-rm -rf $(FLEX_HOME)
	mkdir -p $(FLEX_HOME)
	wget $(FLEX_URL) -O $(FLEX_HOME)/flex_sdk.zip
	unzip $(FLEX_HOME)/flex_sdk.zip -d $(FLEX_HOME)
ifeq ($(UNAME), Darwin)
	sed -i .bak 's/check64" != "/check64" = "/g' $(FLEX_HOME)/bin/mxmlc
	sed -i .bak 's/check64" != "/check64" = "/g' $(FLEX_HOME)/bin/swfdump
endif

build-playerglobal:
	cd playerglobal-builder; node build -t $(THREADS) $(PLAYERGLOBAL_FLAGS)

clean:
	-rm -rf $(TAMARIN_HOME)
	-rm -rf $(JSSHELL_HOME)

.PHONY: install-tamarin install-js install-swfdec install-flex-sdk \
        install-node-modules build-tamarin-tests build-playerglobal \
        clean default

