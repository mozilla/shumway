default:
	@echo "run: make [check-system|install-utils|install-libs|build-tamarin-tests|"
	@echo "           build-playerglobal|build-extension|test]"

check-system:
	echo "Checking the presence of mercurial..."
	hg --version 
	echo "Checking the presence of wget..."
	wget --version
	echo "Checking the presence of java..."
	java -version
	echo "Checking the presence of node..."
	node -v
	if node -v | grep -e "v0.[0-7]." ; then \
	  echo "node 0.8+"; exit 1; \
	fi 
	echo "The environment is good"

install-libs:
	git submodule init
	git submodule update

install-utils: check-system
	make -C utils/ install-asc install-tamarin install-js install-apparat install-node-modules

build-tamarin-tests:
	make -C utils/ build-tamarin-tests

build-playerglobal:
	make -C utils/ build-playerglobal

build-extension:
	make -C extension/firefox/ build

test:
	make -C src/avm1/tests/ test
	make -C src/avm2/bin/ hello-world

.PHONY: check-system install-libs install-utils build-tamarin-tests build-playerglobal build-extension test

