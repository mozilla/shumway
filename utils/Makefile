UNAME = $(shell uname)
THREADS = 8

JSSHELL_HOME = ./jsshell
JSSHELL_URL_BASE = http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/2012/08/2012-08-24-03-05-30-mozilla-central
ifneq ("$(findstring MINGW32, $(UNAME))", "")
JSSHELL_URL = $(JSSHELL_URL_BASE)/jsshell-win32.zip
else
ifeq ($(UNAME), Darwin)
JSSHELL_URL = $(JSSHELL_URL_BASE)/jsshell-mac.zip
else
JSSHELL_URL = $(JSSHELL_URL_BASE)/jsshell-linux-i686.zip
endif
endif

TAMARIN_HOME = ./tamarin-redux
TAMARIN_URL = http://hg.mozilla.org/tamarin-redux

ASC_JAR = ./asc.jar
ASC_URL = ftp://ftp.mozilla.org/pub/js/tamarin/builds/asc/latest/asc.jar

ifeq ($(UNAME), Darwin)
DARWING_VER = $(shell uname -a)
ifneq ("$(filter 12.%, $(DARWING_VER))", "")
TAMARIN_CONFIG_PARAMS = --mac-sdk=108 --target=x86_64-darwin
else
ifneq ("$(filter 11.%, $(DARWING_VER))", "")
TAMARIN_CONFIG_PARAMS = --mac-sdk=107 --target=x86_64-darwin
else
TAMARIN_CONFIG_PARAMS = --mac-sdk=106 --target=x86_64-darwin
endif
endif
else
ifeq ($(UNAME), Linux)
TAMARIN_CONFIG_PARAMS = --target=i686-linux
endif
endif

APPARAT_URL = http://apparat.googlecode.com/files/apparat-1.0-RC9-bin.tar.gz
APPARAT_HOME = ./apparat
SCALA_URL = http://www.scala-lang.org/sites/default/files/linuxsoft_archives/downloads/distrib/files/scala-2.8.0.final.tgz
SCALA_BIN = $(APPARAT_HOME)/scala-2.8.0.final/bin
APPARAT_BIN = $(APPARAT_HOME)/apparat-1.0-RC9


default:
	@echo "run: make [install-asc|install-tamarin|install-js|install-apparat|"
	@echo "           install-node-modules|build-tamarin-tests|build-playerglobal|clean]"

install-asc: $(ASC_JAR)

$(ASC_JAR):
	wget $(ASC_URL) -O $(ASC_JAR)
	-rm asc.uris.txt

install-tamarin: $(ASC_JAR) $(TAMARIN_HOME)/configure.py
	-rm -rf $(TAMARIN_HOME)/bin
	mkdir $(TAMARIN_HOME)/bin
	cd $(TAMARIN_HOME)/bin; python ../configure.py $(TAMARIN_CONFIG_PARAMS) --enable-debugger
	ASC=../../$(ASC_JAR) make -C $(TAMARIN_HOME)/bin

$(TAMARIN_HOME)/configure.py:
	hg clone $(TAMARIN_URL) $(TAMARIN_HOME)
	cd $(TAMARIN_HOME); patch -p 1 < ../patches/tamarin-108-fix.patch
	cd $(TAMARIN_HOME); patch -p 1 < ../patches/tamarin-npexp-fix.patch

build-tamarin-tests:
	cd $(TAMARIN_HOME)/test/acceptance; ASC=../../../$(ASC_JAR) BUILTINABC=../../generated/builtin.abc SHELLABC=../../generated/shell_toplevel.abc AVM=../../bin/shell/avmshell python runtests.py --threads=$(THREADS) --rebuildtests
	cp -R $(TAMARIN_HOME)/test/acceptance ../src/avm2/tests/tamarin

install-js:
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

install-apparat: $(APPARAT_HOME)/apparat.tar.gz
	tar -xkf $(APPARAT_HOME)/apparat.tar.gz -C $(APPARAT_HOME)/
	tar -xkf $(APPARAT_HOME)/scala.tgz -C $(APPARAT_HOME)/

$(APPARAT_HOME)/apparat.tar.gz:
	mkdir -p $(APPARAT_HOME)
	wget $(SCALA_URL) -O $(APPARAT_HOME)/scala.tgz
	wget $(APPARAT_URL) -O $(APPARAT_HOME)/apparat.tar.gz

install-node-modules:
	npm install mocha expect.js temp jshint

build-playerglobal:
	make -C playerGlobal/ build
	cp playerGlobal/bin/playerGlobal.min.abc ../src/flash

clean:
	-rm -rf $(ASC_JAR)
	-rm -rf $(TAMARIN_HOME)
	-rm -rf $(JSSHELL_HOME)
	-rm -rf $(APPARAT_HOME)
	make -C playerGlobal/ clean

.PHONY: install-tamarin install-js install-apparat install-node-modules build-tamarin-tests build-playerglobal clean default
