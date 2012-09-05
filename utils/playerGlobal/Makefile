UNAME = $(shell uname)

PLAYERGLOBAL_URL = http://download.macromedia.com/get/flashplayer/updaters/11/playerglobal11_4.swc
BUILD_DIR = ./bin

UTILS_HOME = ..
APPARAT_HOME = $(UTILS_HOME)/apparat
SCALA_BIN = $(APPARAT_HOME)/scala-2.8.0.final/bin
APPARAT_BIN = $(APPARAT_HOME)/apparat-1.0-RC9
JSSHELL_HOME = $(UTILS_HOME)/jsshell

ifeq ("$(shell which base64)", "")
BASE64DEC = python -c "import base64, sys; f = open(sys.argv[1], 'wb'); base64.decode(sys.stdin, f); f.close()"
else
BASE64DEC = base64 --decode > 
endif

default:
	@echo "run: make [build|clean]"

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

clean:
	-rm -rf $(BUILD_DIR)

.PHONY: build default clean

