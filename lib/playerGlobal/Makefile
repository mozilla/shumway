UNAME = $(shell uname)

PLAYERGLOBAL_URL = http://download.macromedia.com/get/flashplayer/updaters/11/playerglobal11_4.swc
BUILD_DIR = ./bin

APPARAT_URL = http://apparat.googlecode.com/files/apparat-1.0-RC9-bin.tar.gz
APPARAT_HOME = ./apparat
SCALA_URL = http://www.scala-lang.org/sites/default/files/linuxsoft_archives/downloads/distrib/files/scala-2.8.0.final.tgz
SCALA_BIN = $(APPARAT_HOME)/scala-2.8.0.final/bin
APPARAT_BIN = $(APPARAT_HOME)/apparat-1.0-RC9

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

ifeq ("$(shell which base64)", "")
BASE64DEC = python -c "import base64, sys; f = open(sys.argv[1], 'wb'); base64.decode(sys.stdin, f); f.close()"
else
BASE64DEC = base64 -D -o
endif

default:
	echo run: make install-apparat install-js build

build: $(BUILD_DIR)/library.min.swf
	$(JSSHELL_HOME)/js playerglobal-dumpabc.js | $(BASE64DEC) $(BUILD_DIR)/playerGlobal.min.abc

$(BUILD_DIR)/library.min.swf: $(BUILD_DIR)/library.swf
ifeq ($(findstring MINGW32, $(UNAME)),)
	PATH=$(SCALA_BIN):$(PATH) $(APPARAT_BIN)/reducer -i $(BUILD_DIR)/library.swf -o $(BUILD_DIR)/library.min.swf -m
else
	cmd //c runreducer.bat -i $(BUILD_DIR)/library.swf -o $(BUILD_DIR)/library.min.swf -m
endif

$(BUILD_DIR)/library.swf: $(BUILD_DIR)/playerglobal.swc
	unzip -n $(BUILD_DIR)/playerglobal.swc library.swf -d $(BUILD_DIR)

$(BUILD_DIR)/playerglobal.swc:
	mkdir -p $(BUILD_DIR)
	wget $(PLAYERGLOBAL_URL) -O $(BUILD_DIR)/playerglobal.swc

clear:
	-rm -rf $(BUILD_DIR)

install-apparat:
	mkdir -p $(APPARAT_HOME)
	wget $(APPARAT_URL) -O $(APPARAT_HOME)/apparat.tar.gz
	wget $(SCALA_URL) -O $(APPARAT_HOME)/scala.tgz
	tar -xkf $(APPARAT_HOME)/apparat.tar.gz -C $(APPARAT_HOME)/
	tar -xkf $(APPARAT_HOME)/scala.tgz -C $(APPARAT_HOME)/

install-js:
	mkdir -p $(JSSHELL_HOME)
	wget $(JSSHELL_URL) -O $(JSSHELL_HOME)/jsshell.zip
	unzip $(JSSHELL_HOME)/jsshell.zip -d $(JSSHELL_HOME)

.PHONY: install-apparat install-js build default clear

