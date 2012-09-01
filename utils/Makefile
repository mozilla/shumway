UNAME = $(shell uname)
THREADS = 8

JSSHELL_HOME = ./jsshell
ifneq ("$(findstring MINGW32, $(UNAME))", "")
JSSHELL_URL = http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-central/jsshell-win32.zip
else
ifeq ($(UNAME), Darwin)
JSSHELL_URL = http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-central/jsshell-mac.zip
else
JSSHELL_URL = http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-central/jsshell-linux-x86_64.zip
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
endif

APPARAT_URL = http://apparat.googlecode.com/files/apparat-1.0-RC9-bin.tar.gz
APPARAT_HOME = ./apparat
SCALA_URL = http://www.scala-lang.org/sites/default/files/linuxsoft_archives/downloads/distrib/files/scala-2.8.0.final.tgz
SCALA_BIN = $(APPARAT_HOME)/scala-2.8.0.final/bin
APPARAT_BIN = $(APPARAT_HOME)/apparat-1.0-RC9


default:
	echo "run: make install-asc install-tamarin install-js install-apparat install-node-modules build-tamarin-tests"

install-asc: $(ASC_JAR)

$(ASC_JAR):
	wget $(ASC_URL) -O $(ASC_JAR)

install-tamarin: $(ASC_JAR)
	hg clone $(TAMARIN_URL) $(TAMARIN_HOME)
	cd $(TAMARIN_HOME); patch -p 1 < ../patches/tamarin-108-fix.patch
	cd $(TAMARIN_HOME); patch -p 1 < ../patches/tamarin-npexp-fix.patch
	mkdir $(TAMARIN_HOME)/bin
	cd $(TAMARIN_HOME)/bin; python ../configure.py $(TAMARIN_CONFIG_PARAMS) --enable-debugger
	ASC=../../$(ASC_JAR) make -C $(TAMARIN_HOME)/bin

build-tamarin-tests:
	cd $(TAMARIN_HOME)/test/acceptance; ASC=../../../$(ASC_JAR) BUILTINABC=../../generated/builtin.abc SHELLABC=../../generated/shell_toplevel.abc AVM=../../bin/shell/avmshell python runtests.py --threads=$(THREADS) --rebuildtests
	cp -R $(TAMARIN_HOME)/test/acceptance ../src/avm2/tests/tamarin

install-js:
	mkdir -p $(JSSHELL_HOME)
	wget $(JSSHELL_URL) -O $(JSSHELL_HOME)/jsshell.zip
	unzip $(JSSHELL_HOME)/jsshell.zip -d $(JSSHELL_HOME)

install-apparat:
	mkdir -p $(APPARAT_HOME)
	wget $(APPARAT_URL) -O $(APPARAT_HOME)/apparat.tar.gz
	wget $(SCALA_URL) -O $(APPARAT_HOME)/scala.tgz
	tar -xkf $(APPARAT_HOME)/apparat.tar.gz -C $(APPARAT_HOME)/
	tar -xkf $(APPARAT_HOME)/scala.tgz -C $(APPARAT_HOME)/

install-node-modules:
	npm install mocha expect.js temp

.PHONY: install-tamarin install-js install-apparat install-node-modules build-tamarin-tests default
