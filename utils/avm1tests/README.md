# AVM1 Tests Builder

To build the additional AVM1 tests, you will need:

  * Motion-Twin ActionScript2 Compiler http://www.mtasc.org/. Place the binaries
    in the $(SHUMWAY)/utils/mtasc/ folder. (You may need to build it yourself
    from https://github.com/bomberstudios/mtasc);
     
  * Tamarin acceptance tests http://hg.mozilla.org/tamarin-central
    (which shall be placed in $(SHUMWAY)/src/avm2/tests/acceptance).

To build the test run the `make` command.

