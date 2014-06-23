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
      build_gfx_ts: {
        cmd: 'node utils/typescript/tsc --target ES5 --sourcemap --outDir build/ts src/gfx/references.ts'
      },
      build_avm2_ts: {
        cmd: 'node utils/typescript/tsc --target ES5 --sourcemap --outDir build/ts src/avm2/references.ts'
      },
      build_swf_ts: {
        cmd: 'node utils/typescript/tsc --target ES5 --sourcemap --outDir build/ts src/swf/references.ts'
      },
      build_flash_ts: {
        cmd: 'node utils/typescript/tsc --target ES5 --sourcemap --outDir build/ts src/flash/references.ts'
      },
      build_player_ts: {
        cmd: 'node utils/typescript/tsc --target ES5 --sourcemap --outDir build/ts src/player/references.ts'
      },
      build_tools_ts: {
        cmd: 'node utils/typescript/tsc --target ES5 --sourcemap --outDir build/ts src/tools/references.ts'
      },
      build_avm1_ts: {
        cmd: 'node utils/typescript/tsc --target ES5 --sourcemap --outDir build/ts src/avm1/references.ts'
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
        cmd: 'node utils/typescript/tsc --target ES5 --sourcemap --outDir build/ts src/avm1lib/references.ts'
      },
      shell_test: {
        cmd: 'utils/jsshell/js test/harness/run-unit-test.js ' + (grunt.option('tests') || 'test/unit/shell-tests.js test/perf/shell-tests.js'),
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
                'src/flash/**/*.ts',
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
      swf_ts: {
        files: ['src/swf/**/*.ts'],
        tasks: ['exec:build_swf_ts']
      },
      flash_ts: {
        files: ['src/avm2/**/*.ts',
                'src/flash/**/*.ts'],
        tasks: ['exec:build_flash_ts']
      },
      gfx_ts: {
        files: ['src/gfx/**/*.ts'],
        tasks: ['exec:build_gfx_ts']
      },
      avm2_ts: {
        files: ['src/avm2/**/*.ts'],
        tasks: ['exec:build_avm2_ts']
      },
      avm1_ts: {
        files: ['src/avm1/*.ts'],
        tasks: ['exec:build_avm1_ts']
      },
      player_ts: {
        files: ['src/flash/**/*.ts',
        		'src/player/**/*.ts'],
        tasks: ['exec:build_player_ts']
      },
      tools_ts: {
        files: ['src/tools/**/*.ts'],
        tasks: ['exec:build_tools_ts']
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('lint', ['jshint:all', 'exec:lint_success']);

  grunt.registerTask('update-refs', function  () {
    var updateRefs = require('./utils/update-flash-refs.js').updateRefs;
    updateRefs('examples/inspector/inspector.html', {gfx: true, parser: true, player: true});
    updateRefs('test/harness/slave.html', {gfx: true, parser: true, player: true});
    updateRefs('examples/xlsimport/index.html', {gfx: true, parser: true, player: true});
    updateRefs('examples/inspector/inspector.player.html', {parser: true, player: true});
    updateRefs('examples/shell/run.js', {parser: true, player: true});
    updateRefs('src/swf/worker.js', {parser: true});
  });
  grunt.registerTask('update-flash-refs', ['update-refs']); // TODO deprecated

  grunt.registerTask('bundles', function () {
    var outputDir = 'build/bundles/';
    grunt.file.mkdir(outputDir);
    var packageRefs = require('./utils/update-flash-refs.js').packageRefs;
    packageRefs(['gfx'], outputDir + 'shumway.gfx.js');
    packageRefs(['player'], outputDir + 'shumway.player.js');
    packageRefs(['parser'], outputDir + 'shumway.parser.js');
    packageRefs(['gfx', 'parser', 'player'], outputDir + 'shumway.combined.js');
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
  grunt.registerTask('watch-swf', ['exec:build_swf_ts', 'watch:swf_ts']);
  grunt.registerTask('watch-flash', ['exec:build_flash_ts', 'watch:flash_ts']);
  grunt.registerTask('watch-player', ['exec:build_player_ts', 'watch:player_ts']);
  grunt.registerTask('watch-gfx', ['exec:build_gfx_ts', 'watch:gfx_ts']);
  grunt.registerTask('watch-tools', ['exec:build_tools_ts', 'watch:tools_ts']);

  // temporary make/python calls based on grunt-exec
  grunt.registerTask('build-playerglobal', ['exec:build_playerglobal']);

  grunt.registerTask('playerglobal', ['exec:build_playerglobal']);
  grunt.registerTask('avm1lib', ['exec:build_avm1lib']);
  grunt.registerTask('swf', ['exec:build_swf_ts', 'exec:shell_test']);
  grunt.registerTask('flash', ['exec:build_flash_ts', 'exec:shell_test']);
  grunt.registerTask('player', ['exec:build_player_ts', 'exec:shell_test']);
  grunt.registerTask('tools', ['exec:build_tools_ts']);
  grunt.registerTask('avm2', ['exec:build_avm2_ts', 'exec:shell_test']);
  grunt.registerTask('gfx', ['exec:build_gfx_ts']);
  grunt.registerTask('avm1', ['exec:build_avm1_ts', 'exec:shell_test']);
  grunt.registerTask('shell-test', ['exec:shell_test']);
  grunt.registerTask('shu', [
    'exec:build_playerglobal',
    'exec:build_avm2_ts',
    'exec:build_flash_ts',
    'exec:build_avm1_ts',
    'exec:build_swf_ts',
    'exec:build_gfx_ts',
    'exec:build_player_ts',
    'bundles',
    'exec:shell_test'
  ]);
  grunt.registerTask('firefox', ['shu', 'exec:build_extension']);
};
