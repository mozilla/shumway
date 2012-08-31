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

default:
	echo "run: make [install-asc|install-tamarin|install-js|build-tamarin-tests]"

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

.PHONY: install-tamarin install-js default
