/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: 'test/jshint_config.json'
      },
      all: ['src/flash/**/*.js', 'src/swf/*.js']
    },
    exec: {
      build_web: {
        cmd: 'make -C web/ build'
      },
      build_extension: {
        cmd: 'make -C extension/firefox/ build'
      },
      build_bundle: {
        cmd: 'make -C utils/builder build'
      },
      build_stage_ts: {
        cmd: 'node node_modules/typescript/bin/tsc --target ES5 src/stage/all.ts'
      },
      build_avm2_ts: {
        cmd: 'node node_modules/typescript/bin/tsc --target ES5 src/avm2/references.ts'
      },
      build_flash_ts: {
        cmd: 'node node_modules/typescript/bin/tsc --target ES5 src/flash.ts/references.ts'
      },
      build_avm1_ts: {
        cmd: 'node node_modules/typescript/bin/tsc --target ES5 src/avm1/references.ts'
      },
      generate_abcs: {
        cmd: 'python generate.py',
        cwd: 'src/avm2/generated'
      },
      build_playerglobal: {
        cmd: 'node build -t 9',
        cwd: 'utils/playerglobal-builder'
      },
      build_avm1lib: {
        cmd: 'node compileabc -m ../src/avm1lib/avm1lib.manifest',
        cwd: 'utils/'
      },
      build_avm1lib_ts: {
        cmd: 'node node_modules/typescript/bin/tsc --target ES5 src/avm1lib/references.ts'
      },
      lint_success: {
        cmd: 'echo "SUCCESS: no lint errors"'
      }
    },
    watch: {
      web: {
        files: 'extension/firefox/**/*',
        tasks: ['build-web']
      },
      extension: {
        files: 'extension/firefox/**/*',
        tasks: ['build-extension']
      },
      avm1lib_ts: {
        files: ['src/avm2/**/*.ts',
                'src/flash.ts/**/*.ts',
                'src/avm1lib/*.ts'],
        tasks: ['exec:build_avm1lib_ts']
      },
      avm1lib: {
        files: ['src/avm1lib/*.as',
                'src/avm1lib/avm1lib.manifest'],
        tasks: ['exec:build_avm1lib']
      },
      playerglobal: {
        files: ['src/flash/**/*.as',
                'utils/playerglobal-builder/manifest.json'],
        tasks: ['exec:build_playerglobal']
      },
      flash_ts: {
        files: ['src/avm2/**/*.ts',
                'src/flash.ts/**/*.ts'],
        tasks: ['exec:build_flash_ts']
      },
      stage_ts: {
        files: ['src/stage/**/*.ts'],
        tasks: ['exec:build_stage_ts']
      },
      avm2_ts: {
        files: ['src/avm2/**/*.ts'],
        tasks: ['exec:build_avm2_ts']
      },
      avm1_ts: {
        files: ['src/avm1/*.ts'],
        tasks: ['exec:build_avm1_ts']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('lint', ['jshint:all', 'exec:lint_success']);

  grunt.registerTask('update-flash-refs', function  () {
    var updateFlashRefs = require('./utils/update-flash-refs.js');
    updateFlashRefs('examples/inspector/inspector.html', 'src');
    updateFlashRefs('test/harness/slave.html', 'src');
    updateFlashRefs('examples/xlsimport/index.html', 'src');
  });

  grunt.registerTask('server', function () {
    var WebServer = require('./utils/webserver.js').WebServer;
    var done = this.async();
    var server = new WebServer();
    server.start();
  });

  grunt.registerTask('reftest', function () {
    var done = this.async();
    grunt.util.spawn({cmd: 'make', args: ['reftest'], opts: { cwd: 'test', stdio: 'inherit'}}, function () {
      done();
    });
  });

  grunt.registerTask('makeref', function () {
    var done = this.async();
    grunt.util.spawn({cmd: 'make', args: ['makeref'], opts: { cwd: 'test', stdio: 'inherit'}}, function () {
      done();
    });
  });

  grunt.registerTask('watch-playerglobal', ['exec:build_playerglobal', 'watch:playerglobal']);
  grunt.registerTask('watch-avm1lib', ['exec:build_avm1lib', 'watch:avm1lib']);
  grunt.registerTask('watch-avm2', ['exec:build_avm2_ts', 'watch:avm2_ts']);
  grunt.registerTask('watch-flash', ['exec:build_flash_ts', 'watch:flash_ts']);
  grunt.registerTask('watch-stage', ['exec:build_stage_ts', 'watch:stage_ts']);

  // temporary make/python calls based on grunt-exec
  grunt.registerTask('build-web', ['exec:build_avm2_ts', 'exec:build_bundle', 'exec:build_extension', 'exec:build_web']);
  grunt.registerTask('build-extension', ['exec:build_avm2_ts', 'exec:build_bundle', 'exec:build_extension']);
  grunt.registerTask('build-playerglobal', ['exec:build_playerglobal']);
  grunt.registerTask('build-bundle', ['exec:build_avm2_ts', 'exec:build_avm1_ts', 'exec:build_bundle']);

  grunt.registerTask('playerglobal', ['exec:build_playerglobal']);
  grunt.registerTask('avm1lib', ['exec:build_avm1lib']);
  grunt.registerTask('flash', ['exec:build_flash_ts']);
  grunt.registerTask('avm2', ['exec:build_avm2_ts']);
  grunt.registerTask('stage', ['exec:build_stage_ts']);
  grunt.registerTask('avm1', ['exec:build_avm1_ts']);
};
