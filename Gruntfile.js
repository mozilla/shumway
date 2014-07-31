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

  // Don't use `--removeComments` here beause it strips out closure annotations that are
  // needed by the build system.
  var commonArguments = 'node utils/typescript/tsc --target ES5 --sourcemap -d --out build/ts/';

  var browserManifestFile = './resources/browser_manifests/browser_manifest.json';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: 'test/jshint_config.json'
      },
      all: ['src/flash/**/*.js', 'src/swf/*.js']
    },
    tslint: {
      options: {
        configuration: grunt.file.readJSON("tslint.json")
      },
      all: ['src/flash/**/*.ts'] // TODO: Add more directories.
    },
    exec: {
      build_web: {
        cmd: 'make -C web/ build'
      },
      build_extension: {
        cmd: 'make -C extension/firefox/ build'
      },
      build_base_ts: {
        cmd: commonArguments + 'base.js src/base/references.ts'
      },
      build_tools_ts: {
        cmd: commonArguments + 'tools.js src/tools/references.ts'
      },
      build_swf_ts: {
        cmd: commonArguments + 'swf.js src/swf/references.ts'
      },
      build_avm2_ts: {
        cmd: commonArguments + 'avm2.js src/avm2/references.ts'
      },
      build_avm1_ts: {
        cmd: commonArguments + 'avm1.js src/avm1/references.ts'
      },
      build_gfx_ts: {
        cmd: commonArguments + 'gfx.js src/gfx/references.ts'
      },
      build_gfx_base_ts: {
        cmd: commonArguments + 'gfx-base.js src/gfx/references-base.ts'
      },
      build_flash_ts: {
        cmd: commonArguments + 'flash.js src/flash/references.ts'
      },
      build_player_ts: {
        cmd: commonArguments + 'player.js src/player/references.ts'
      },
      build_shell_ts: {
        cmd: 'node utils/typescript/tsc --target ES5 --sourcemap --out build/ts/shell.js src/shell/references.ts'
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
      gate: {
        cmd: 'utils/jsshell/js build/ts/shell.js -x -g -v test/unit/pass/*.js'
//        cmd: 'node build/ts/shell.js -x -g -v test/unit/pass/*.js'
      },
      smoke_parse_database: {
        cmd: 'find test/swf -name "*.swf" -exec utils/jsshell/js build/ts/shell.js -p -po -r {} + >> result'
      },
      smoke_parse: {
        cmd: 'find test/swfs -name "*.swf" -exec utils/jsshell/js build/ts/shell.js -p -r {} +'
      },
      closure: {
        // This needs a special build of closure that has SHUMWAY_OPTIMIZATIONS.
        cmd: 'java -jar utils/closure.jar --formatting PRETTY_PRINT --compilation_level SHUMWAY_OPTIMIZATIONS --language_in ECMASCRIPT5 ' + [
          "build/ts/base.js",
          "build/ts/tools.js",
          "build/ts/avm2.js",
          "build/ts/flash.js",
          "build/ts/avm1.js",
          "build/ts/gfx-base.js",
          "build/ts/gfx.js",
          "build/ts/player.js"
        ].join(" ") + " > build/shumway.cc.js"
      },
      spell: {
        // TODO: Add more files.
        cmd: 'node utils/spell/spell.js build/ts/player.js'
      },
      lint_success: {
        cmd: 'echo "SUCCESS: no lint errors"'
      }
    },
    parallel: {
      base: {
        options: {
          grunt: true
        },
        tasks: [
          'exec:build_playerglobal',
          'exec:build_avm1lib',
          'exec:build_base_ts'
        ]
      },
      tier2: {
        options: {
          grunt: true
        },
        tasks: [
          'exec:build_gfx_ts',
          'exec:build_swf_ts',
          'exec:build_avm2_ts'
        ]
      },
      natives: {
        options: {
          grunt: true
        },
        tasks: [
          'exec:build_avm1_ts',
          'exec:build_flash_ts'
        ]
      },
      avm1: {
        options: {
          grunt: true
        },
        tasks: [
          'exec:build_avm1lib',
          'exec:build_avm1_ts'
        ]
      },
      flash: {
        options: {
          grunt: true
        },
        tasks: [
          'exec:build_playerglobal',
          'exec:build_flash_ts'
        ]
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
      base: {
        files: 'src/base/**/*',
        tasks: ['exec:build_base_ts']
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
      gfx_base_ts: {
        files: ['src/gfx/**/*.ts'],
        tasks: ['exec:build_gfx_base_ts']
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

  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-parallel');

  grunt.registerTask('lint', ['jshint:all', 'exec:lint_success']);
  grunt.registerTask('ts-lint', ['tslint:all', 'exec:lint_success']);

  grunt.registerTask('update-refs', function  () {
    var updateRefs = require('./utils/update-flash-refs.js').updateRefs;
    updateRefs('examples/inspector/inspector.html', {gfx: true, parser: true, player: true});
    updateRefs('test/harness/slave.html', {gfx: true, parser: true, player: true});
    updateRefs('examples/xlsimport/index.html', {gfx: true, parser: true, player: true});
    updateRefs('examples/inspector/inspector.player.html', {parser: true, player: true});
    updateRefs('src/shell/shell.ts', {parser: true, player: true, onlyIncludes: true});
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
    grunt.util.spawn({
      cmd: 'python',
      args: ['test.py', '--reftest', '--browserManifestFile=' + browserManifestFile],
      opts: { cwd: 'test', stdio: 'inherit'
    }}, function () {
      done();
    });
  });

  grunt.registerTask('reftest-bundle', function () {
    var done = this.async();
    grunt.util.spawn({
      cmd: 'python',
      args: ['test.py', '--bundle', '--reftest', '--browserManifestFile=' + browserManifestFile],
      opts: { cwd: 'test', stdio: 'inherit'
      }}, function () {
      done();
    });
  });

  grunt.registerTask('makeref', function () {
    var done = this.async();
    grunt.util.spawn({
      cmd: 'python',
      args: ['test.py', '-m', '--browserManifestFile=' + browserManifestFile],
      opts: { cwd: 'test', stdio: 'inherit'}}, function () {
      done();
    });
  });

  grunt.registerTask('watch-playerglobal', ['exec:build_playerglobal', 'watch:playerglobal']);
  grunt.registerTask('watch-base', ['exec:build_base_ts', 'watch:base']);
  grunt.registerTask('watch-avm1lib', ['exec:build_avm1lib', 'watch:avm1lib']);
  grunt.registerTask('watch-avm2', ['exec:build_avm2_ts', 'watch:avm2_ts']);
  grunt.registerTask('watch-swf', ['exec:build_swf_ts', 'watch:swf_ts']);
  grunt.registerTask('watch-flash', ['exec:build_flash_ts', 'watch:flash_ts']);
  grunt.registerTask('watch-player', ['exec:build_player_ts', 'watch:player_ts']);
  grunt.registerTask('watch-gfx', ['exec:build_gfx_base_ts', 'exec:build_gfx_ts', 'watch:gfx_ts']);
  grunt.registerTask('watch-tools', ['exec:build_tools_ts', 'watch:tools_ts']);

  // temporary make/python calls based on grunt-exec
  grunt.registerTask('build-playerglobal', ['exec:build_playerglobal']);

  grunt.registerTask('base', ['exec:build_base_ts', 'exec:gate']);
  grunt.registerTask('swf', ['exec:build_swf_ts', 'exec:gate']);
  grunt.registerTask('flash', ['parallel:flash', 'exec:gate']);
  grunt.registerTask('avm1', ['parallel:avm1', 'exec:gate']);
  grunt.registerTask('player', ['exec:build_player_ts', 'exec:gate']);
  grunt.registerTask('shell', ['exec:build_shell_ts', 'exec:gate']);
  grunt.registerTask('tools', ['exec:build_tools_ts', 'exec:gate']);
  grunt.registerTask('avm2', ['exec:build_avm2_ts', 'exec:gate']);
  grunt.registerTask('gfx', ['exec:build_gfx_base_ts', 'exec:build_gfx_ts']);
  grunt.registerTask('gfx-base', ['exec:build_gfx_base_ts', 'exec:gate']);
  grunt.registerTask('gate', ['exec:gate']);
  grunt.registerTask('shu', [
    'parallel:base',
    'exec:build_tools_ts',
    'exec:build_gfx_base_ts',
    'parallel:tier2',
    'parallel:natives',
    'exec:build_player_ts',
    'exec:build_shell_ts',
    'bundles',
    'exec:gate'
  ]);
  grunt.registerTask('closure', [
    'exec:closure'
  ]);
  grunt.registerTask('travis', [
    // 'parallel:base',
    'exec:build_base_ts',
    'exec:build_tools_ts',
    'exec:build_gfx_base_ts',
    'parallel:tier2',
    'parallel:natives',
    'exec:build_player_ts',
    'exec:build_shell_ts',
    'tslint:all',
    'exec:spell',
    'exec:closure',
    // 'exec:gate'
  ]);
  grunt.registerTask('smoke', [
    'exec:smoke_parse'
  ]);
  grunt.registerTask('firefox', ['shu', 'exec:build_extension']);
  grunt.registerTask('web', ['shu', 'exec:build_extension', 'exec:build_web']);
};
