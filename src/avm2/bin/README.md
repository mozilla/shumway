Shumway AVM2 Tools
==================

`avm.js` is the command line interface to the Shumway avm2 runtime, here are some usage examples:

* `avm.js -d file.abc` - disassembles an .abc file
* `avm.js -x file.abc` - executes an .abc file using the compiler and the interpreter
* `avm.js -x -i file.abc` - executes an .abc file using only the interpreter

`shu.py` is a python script to help with running test and other frequently executed commands:

* `shu.py reg [-f]` - compiles all test cases in the regression directory that have changed, or forces the recompilation of all test cases when the the -f argument is specified.

* `shu.py test [file or directory]` - runs a specific test, or all test cases in a director by comparing the output of the test case against the tamarin avmshell.

* `shyu.py test -i tamarin.passed -i other.passed` - runs a list of test cases specified in a set of files, run this to make sure there are no regressions.

By default, `shu.py test` runs avm under all configurations. You can use the `-m` argument to specify which configurations you want to run. For instance `-m=aco` only runs the `a`vmshell, `c`compiler, `o`ptimized configurations and skips the `i`nterpreter.

* `shu.py asc file.as` - compiles an actionscript file using the asc compiler, if it complains that it can't find the base class Object, specify the `-builtin` argument to import the `builtin.abc` file during compilation.