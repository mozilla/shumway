#!/bin/bash
if [ ! -f ~/.emscripten ]; then
  echo "Error: emscripten is not found"; exit 1;
fi
mkdir -p node_modules
npm install esprima@1.0.4 escodegen@1.2.0

