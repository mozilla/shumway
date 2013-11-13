emcc -O2 src/alpha.c src/blur.c -o filters.raw.js --closure 0 -s EXPORTED_FUNCTIONS="['_preMultiplyAlpha','_preMultiplyAlphaUndo','_blur']"
cat filters.pre.js > filters.js
cat filters.raw.js >> filters.js
cat filters.post.js >> filters.js
rm filters.raw.js
rm filters.raw.js.map
