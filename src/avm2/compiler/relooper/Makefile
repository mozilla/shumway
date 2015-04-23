.PHONY: all

all: Relooper.cpp Relooper.h
	# Make sure emcc in your path.
	emcc -Oz Relooper.cpp -DNDEBUG -o relooper.raw.js --memory-init-file 0 -s TOTAL_STACK=131072 -s TOTAL_MEMORY=4194304 -s NO_FILESYSTEM=1 -s NO_BROWSER=1 -O3 \
	-s 'EXPORTED_FUNCTIONS=["_rl_set_output_buffer","_rl_make_output_buffer","_rl_new_block","_rl_set_block_code","_rl_delete_block","_rl_block_add_branch_to","_rl_new_relooper","_rl_delete_relooper","_rl_relooper_add_block","_rl_relooper_calculate","_rl_relooper_render", "_rl_set_asm_js_mode"]' \
	-s 'DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=["memcpy", "memset", "malloc", "free", "puts"]' --post-js glue.js
	echo "var RELOOPER_BUFFER_SIZE = 1024 * 1024;" > relooper.js
	echo "// Relooper, (C) 2012 Alon Zakai, MIT license, https://github.com/kripken/Relooper" >> relooper.js
	echo "var Relooper = (function(Module) {" >> relooper.js
	cat relooper.raw.js >> relooper.js
	echo "" >> relooper.js
	echo "  return Module.Relooper;" >> relooper.js
	echo "})(Relooper);" >> relooper.js