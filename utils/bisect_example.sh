#!/bin/bash

# Example of the bisect script
# To run:
#   git bisect start <bad_sha> <good_sha>
#   git bisect run ./utils/bisect_example [test_script]

build_cmd="${SHUMWAY_BUILD:-grunt build}"
echo "Build command is used: $build_cmd"
test_cmd="${@:-grunt gate}"
echo "Test command is used: $test_cmd"

# build stuff
$build_cmd
if [[ $? != 0 ]]; then exit 125; fi

# testing
$test_cmd
if [[ $? != 0 ]]; then exit 2; fi

# all good
exit 0
