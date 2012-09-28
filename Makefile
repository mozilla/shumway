default:
	@echo "run: make [check-system|install-utils|install-libs|build-tamarin-tests|"
	@echo "           build-playerglobal|build-extension|test|push-test|build-bot|start-build-bot]"

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
	make -C src/avm2/bin/ test-regress

hello-world:
	make -C src/avm2/bin/ hello-world

IRC_ROOM = shumway-build-bot

lint:
	make -C utils/ -f lint.mk lint

lint-all:
	make -C utils/ -f lint.mk lint-all

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

.PHONY: check-system install-libs install-utils build-tamarin-tests build-playerglobal build-extension test
