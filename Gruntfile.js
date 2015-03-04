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

  var VERSION_BASELINE = '8c92f57b7811f5ce54';
  var VERSION_BASE = '0.10.';

  // work around a grunt bug where color output is written to non-tty output
  if (!process.stdout.isTTY) {
      grunt.option("color", false);
  }

  // Don't use `--removeComments` here beause it strips out closure annotations that are
  // needed by the build system.
  var commonArguments = 'node utils/typescript/tsc --target ES5 --removeComments --sourcemap -d --out build/ts/';

  var defaultBrowserManifestFile = './resources/browser_manifests/browser_manifest.json';
  var defaultTestsManifestFile = 'test_manifest.json';

  var parallelArgs = ['bundle', 'threads', 'sha1', 'rebuild', 'tests', 'bundle',
                      'noPrompts'].filter(function (s) {
    return grunt.option(s) !== undefined;
  }).map(function (s) {
    return '--' + s + '=' + grunt.option(s);
  });

  function expandFilePattern(pattern) {
    return '"' + grunt.file.expand(pattern).join('" "') + '"'
  }

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
      build_mozcentral: {
        cmd: 'make -C extension/mozcentral/ build'
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
      build_avm2_tests: {
        cmd: 'make -C test/avm2/'
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
      build_playerglobal: {
        cmd: 'node build.js -t ' + (+grunt.option('threads') || 9) +
                                   (grunt.option('sha1') ? ' -s' : '') +
                                   (grunt.option('rebuild') ? ' -r' : ''),
        cwd: 'utils/playerglobal-builder'
      },
      build_playerglobal_single: {
        cmd: 'node single.js',
        cwd: 'utils/playerglobal-builder'
      },
      debug_server: {
        cmd: 'node examples/inspector/debug/server.js'
      },
      gate: {
        cmd: '"utils/jsshell/js" build/ts/shell.js -x -g ' +
                (grunt.option('verbose') ? '-v ' : '') +
                (grunt.option('tests') || expandFilePattern('test/unit/pass/*.js'))
      },
      perf: {
        cmd: '"utils/jsshell/js" build/ts/shell.js -x -g ' +
               (grunt.option('verbose') ? '-v ' : '') +
          (grunt.option('tests') || expandFilePattern('test/perf/pass/*.js'))
      },
      "gfx-test": {
        cmd: '"utils/jsshell/js" build/ts/shell.js -x -g ' +
               (grunt.option('verbose') ? '-v ' : '') +
          (grunt.option('tests') || expandFilePattern('test/gfx/pass/*.js'))
      },
      smoke_parse_database: {
        maxBuffer: Infinity,
        cmd: 'find -L test/swf -name "*.swf" | parallel --no-notice -X -N50 --timeout 200% utils/jsshell/js build/ts/shell.js -p -r -po {} >> data.json.txt'
      },
      smoke_play: {
        maxBuffer: Infinity,
        cmd: 'find -L test/swf -name "*.swf" | parallel --no-notice -X -N50 --timeout 200% utils/jsshell/js build/ts/shell.js -x -md 1000 -v -tp 60 -v {}'
      },
      smoke_parse: {
        maxBuffer: Infinity,
        cmd: 'find -L test/swf -name "*.swf" | parallel --no-notice -X -N50 --timeout 200% utils/jsshell/js build/ts/shell.js -p -r ' +
             (grunt.option('verbose') ? '-v ' : '') + ' {}'
      },
      smoke_parse_images: {
        maxBuffer: Infinity,
        cmd: 'find -L test/swf -name "*.swf" | parallel --no-notice -X -N50 --timeout 200% utils/jsshell/js build/ts/shell.js -p -r -f "CODE_DEFINE_BITS,CODE_DEFINE_BITS_JPEG2,CODE_DEFINE_BITS_JPEG3,CODE_DEFINE_BITS_JPEG4,CODE_JPEG_TABLES,CODE_DEFINE_BITS_LOSSLESS,CODE_DEFINE_BITS_LOSSLESS2" {}'
      },
      smoke_compile_baseline: {
        maxBuffer: Infinity,
        cmd: 'find -L test/swf -name "*.swf" | parallel --no-notice -X -N50 utils/jsshell/js build/ts/shell.js -c src/avm2/generated/playerGlobal/playerGlobal.min.abc {}'
      },
      spell: {
        // TODO: Add more files.
        cmd: 'node utils/spell/spell.js build/ts/player.js'
      },
      lint_success: {
        cmd: 'echo "SUCCESS: no lint errors"'
      },
      test_avm2_quick: {
        cmd: 'node src/shell/numbers.js -i test/avm2/pass/ -c i -j ' + (+grunt.option('threads') || 9)
      },
      test_avm2: {
        cmd: 'node src/shell/numbers.js -c icb -i ' + (grunt.option('include') || 'test/avm2/pass/') +
                                      ' -j ' + (+grunt.option('threads') || 9)
      },
      test_avm2_baseline: {
        cmd: 'node src/shell/numbers.js -c b -i ' + (grunt.option('include') || 'test/avm2/pass/') +
                                      ' -j ' + (+grunt.option('threads') || 9)
      },
      tracetest: {
        cmd: 'node test/trace_test_run.js -j ' + (+grunt.option('threads') || 6)
      },
      tracetest_swfdec: {
        cmd: 'node test/trace_test_run.js -j ' + (+grunt.option('threads') || 6) +
                                        ' -m test/swfdec_test_manifest.json'
      },
      tracetest_fuzz: {
        cmd: 'node test/trace_test_run.js -j ' + (+grunt.option('threads') || 6) +
                                        ' -m test/test_manifest_fuzz.json'
      },
      instrument: {
        cmd: function(path) {
          var targetPath = path.replace(".swf", ".instrumented.swf");
          console.info("Instrumenting " + path + " (" + targetPath + "), this may take a while if the file is large.");
          return 'swfmill swf2xml ' + path + ' | xsltproc utils/instrument-swf.xslt - | swfmill xml2swf stdin ' + targetPath;
        }
      }
    },
    parallel: {
      base: {
        tasks: [
          { args: ['generate-version'], grunt: true },
          { args: ['buildlibs'], grunt: true },
          { args: ['exec:build_base_ts'].concat(parallelArgs), grunt: true },
        ]
      },
      playerglobal: {
        tasks: [
          { args: ['exec:build_playerglobal'].concat(parallelArgs), grunt: true },
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
        tasks: [
          { args: ['exec:build_avm1_ts'].concat(parallelArgs), grunt: true }
        ]
      },
      flash: {
        tasks: [
          { args: ['exec:build_playerglobal'].concat(parallelArgs), grunt: true },
          { args: ['exec:build_flash_ts'].concat(parallelArgs), grunt: true }
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

  grunt.registerTask('lint', ['tslint:all', 'exec:lint_success']);

  grunt.registerTask('update-refs', function  () {
    var updateRefs = require('./utils/update-flash-refs.js').updateRefs;
    updateRefs('examples/inspector/inspector.html', {gfx: true, player: true});
    updateRefs('test/harness/slave.html', {gfx: true, player: true});
    updateRefs('examples/xlsimport/index.html', {gfx: true, player: true});
    updateRefs('examples/inspector/inspector.player.html', {player: true});
    updateRefs('src/shell/shell.ts', {player: true, onlyIncludes: true});
  });
  grunt.registerTask('update-flash-refs', ['update-refs']); // TODO deprecated

  grunt.registerTask('buildlibs', function() {
    var outputDir = 'build/libs/';
    grunt.file.mkdir(outputDir);
    var done = this.async();
    var buildLibs = require('./src/libs/buildlibs.js').buildLibs;
    buildLibs(outputDir, false, null, function () {
      done();
    });
  });
  grunt.registerTask('copy_relooper', function() {
    grunt.file.copy('src/avm2/compiler/relooper/relooper.js', 'build/libs/relooper.js');
  });
  grunt.registerTask('bundles', function () {
    var outputDir = 'build/bundles/';
    grunt.file.mkdir(outputDir);
    var packageRefs = require('./utils/update-flash-refs.js').packageRefs;
    var license = grunt.file.read('./src/license.js');
    packageRefs(['gfx'], outputDir + 'shumway.gfx.js', license);
    packageRefs(['player'], outputDir + 'shumway.player.js', license);
  });

  function runClosure(jsFiles, output, warnings, done) {
    // This needs a special build of closure that has SHUMWAY_OPTIMIZATIONS.
    var closureCmd = 'java';
    var closureArgs = ['-jar', 'utils/closure.jar',
      '--formatting', 'PRETTY_PRINT',
      '--compilation_level', 'SHUMWAY_OPTIMIZATIONS',
      '--language_in', 'ECMASCRIPT5'];
    if (!warnings) {
      closureArgs.push('--warning_level', 'QUIET');
    }
    closureArgs = closureArgs.concat(jsFiles).concat(['--js_output_file', output]);
    console.log('Running closure for ' + jsFiles.join(', ') + ' ...');
    grunt.util.spawn({
      cmd: closureCmd,
      args: closureArgs,
      opts: { stdio: 'inherit' }
    }, function (error, result) {
      if (error || result.code) {
        done(false);
        return;
      }
      console.log('Closure output is created at ' + output);
      done(true);
    });
  }

  function runClosureTasks(tasks, warnings, done) {
    var i = 0;
    (function runNextTask() {
      if (i < tasks.length) {
        var task = tasks[i++];
        runClosure([task[0]], task[1], warnings, function (success) {
          if (!success) {
            done(false);
            return;
          }
          runNextTask();
        });
      } else {
        done(true);
      }
    })();
  }

  grunt.registerTask('closure-bundles', function () {
    var inputDir = 'build/bundles/';
    var outputDir = 'build/bundles-cc/';
    grunt.file.mkdir(outputDir);

    runClosureTasks([
      [inputDir + 'shumway.gfx.js', outputDir + 'shumway.gfx.js'],
      [inputDir + 'shumway.player.js', outputDir + 'shumway.player.js']
    ], !!grunt.option('verbose'), this.async());
  });

  grunt.registerTask('closure', function () {
    runClosure([
      "build/ts/base.js",
      "build/ts/tools.js",
      "build/ts/avm2.js",
      "build/ts/flash.js",
      "build/ts/avm1.js",
      "build/ts/gfx-base.js",
      "build/ts/gfx.js",
      "build/ts/player.js"
    ], "build/shumway.cc.js", true, this.async());
  });

  grunt.registerTask('closure-all', function () {
    var outputDir = 'build/ts-cc/';
    grunt.file.mkdir(outputDir);
    runClosureTasks([
      ["build/ts/base.js", outputDir + "base.js"],
      ["build/ts/tools.js", outputDir + "tools.js"],
      ["build/ts/avm2.js", outputDir + "avm2.js"],
      ["build/ts/flash.js", outputDir + "flash.js"],
      ["build/ts/avm1.js", outputDir + "avm1.js"],
      ["build/ts/gfx-base.js", outputDir + "gfx-base.js"],
      ["build/ts/gfx.js", outputDir + "gfx.js"],
      ["build/ts/player.js", outputDir + "player.js"]
    ], true, this.async());
  });

  grunt.registerTask('server', function () {
    var WebServer = require('./test/webserver.js').WebServer;
    var done = this.async();
    var server = new WebServer();
    server.start();
  });

  grunt.registerTask('reftest', function () {
    if (grunt.file.exists('test/tmp')) {
      throw new Error('The test/tmp/ folder exists from the previous makeref attempt. ' +
        'You may want to copy those images to test/refs/. Remove test/tmp/ to proceed with reftest.')
    }
    if (!grunt.option('browserManifestFile') && !grunt.file.exists('test', defaultBrowserManifestFile)) {
      throw new Error('Browser manifest file is not found at test/' + defaultBrowserManifestFile + '. Create one using the examples at test/resources/browser_manifests/.');
    }
    var browserManifestFile = grunt.option('browserManifestFile') || defaultBrowserManifestFile;
    var testManifestFile = grunt.option('manifestFile') || defaultTestsManifestFile;
    var done = this.async();
    var params = [];
    if (grunt.option('bundle')) {
      params.push('--bundle');
    }
    if (grunt.option('noPrompts')) {
      params.push('--noPrompts');
    }
    grunt.util.spawn({
      cmd: 'node',
      args: ['test.js', '--reftest', '--browserManifestFile=' + browserManifestFile,
             '--manifestFile=' + testManifestFile].concat(params),
      opts: { cwd: 'test', stdio: 'inherit' }
    }, function () {
      done();
    });
  });

  grunt.registerTask('reftest-swfdec', function () {
    if (grunt.file.exists('test/tmp')) {
      throw new Error('The test/tmp/ folder exists from the previous makeref attempt. ' +
        'You may want to copy those images to test/refs/. Remove test/tmp/ to proceed with reftest.')
    }
    if (!grunt.option('browserManifestFile') && !grunt.file.exists('test', defaultBrowserManifestFile)) {
      throw new Error('Browser manifest file is not found at test/' + defaultBrowserManifestFile + '. Create one using the examples at test/resources/browser_manifests/.');
    }
    var browserManifestFile = grunt.option('browserManifestFile') || defaultBrowserManifestFile;
    var testManifestFile = 'swfdec_reftest_manifest.json';
    var done = this.async();
    var params = [];
    if (grunt.option('bundle')) {
      params.push('--bundle');
    }
    if (grunt.option('noPrompts')) {
      params.push('--noPrompts');
    }
    grunt.util.spawn({
      cmd: 'node',
      args: ['test.js', '--browserManifestFile=' + browserManifestFile,
          '--manifestFile=' + testManifestFile].concat(params),
      opts: { cwd: 'test', stdio: 'inherit' }
    }, function () {
      done();
    });
  });

  grunt.registerTask('makeref', function () {
    if (!grunt.option('browserManifestFile') && !grunt.file.exists('test', defaultBrowserManifestFile)) {
      throw new Error('Browser manifest file is not found at test/' + defaultBrowserManifestFile + '. Create one using the examples at test/resources/browser_manifests/.');
    }
    var browserManifestFile = grunt.option('browserManifestFile') || defaultBrowserManifestFile;
    var done = this.async();
    var params = [];
    if (grunt.option('bundle')) {
      params.push('--bundle');
    }
    if (grunt.option('noPrompts')) {
      params.push('--noPrompts');
    }
    grunt.util.spawn({
      cmd: 'node',
      args: ['test.js', '-m', '--browserManifestFile=' + browserManifestFile].concat(params),
      opts: { cwd: 'test', stdio: 'inherit'}}, function () {
      done();
    });
  });

  grunt.registerTask('shell-package', function () {
    var outputDir = 'build/shell';
    grunt.file.mkdir(outputDir);
    var path = require('path');

    grunt.file.copy('build/libs/builtin.abc', outputDir + '/build/libs/builtin.abc');
    grunt.file.copy('build/libs/shell.abc', outputDir + '/build/libs/shell.abc');
    grunt.file.copy('build/playerglobal/playerglobal.abcs', outputDir + '/build/playerglobal/playerglobal.abcs');
    grunt.file.copy('build/playerglobal/playerglobal.json', outputDir + '/build/playerglobal/playerglobal.json');
    grunt.file.copy('build/libs/relooper.js', outputDir + '/build/libs/relooper.js');
    grunt.file.expand('build/ts/*.js').forEach(function (file) {
      grunt.file.copy(file, outputDir + '/build/ts/' + path.basename(file));
    });
    grunt.file.expand('build/bundles/*.js').forEach(function (file) {
      grunt.file.copy(file, outputDir + '/build/bundles/' + path.basename(file));
    });
    grunt.file.expand('build/bundles-cc/*.js').forEach(function (file) {
      grunt.file.copy(file, outputDir + '/build/bundles-cc/' + path.basename(file));
    });
    grunt.file.copy('src/shell/shell-node.js', outputDir + '/src/shell/shell-node.js');
    grunt.file.copy('build/version/version.txt', outputDir + '/version.txt');
    grunt.file.copy('LICENSE', outputDir + '/LICENSE');

    var waitFor = 0, done = this.async();
    grunt.file.expand('src/shell/runners/run-*').forEach(function (file) {
      var dest = outputDir + '/bin/' + path.basename(file);
      grunt.file.copy(file, dest);
      waitFor++;
      grunt.util.spawn({cmd: 'chmod', args: ['+x', dest]}, function () {
        waitFor--;
        if (waitFor === 0) {
          done();
        }
      });
    });
    if (waitFor === 0) {
      done();
    }
  });

  grunt.registerTask('tracetest', ['exec:tracetest']);
  grunt.registerTask('tracetest-swfdec', ['exec:tracetest_swfdec']);

  grunt.registerTask('watch-playerglobal', ['exec:build_playerglobal', 'watch:playerglobal']);
  grunt.registerTask('watch-base', ['exec:build_base_ts', 'watch:base']);
  grunt.registerTask('watch-avm2', ['exec:build_avm2_ts', 'watch:avm2_ts']);
  grunt.registerTask('watch-swf', ['exec:build_swf_ts', 'watch:swf_ts']);
  grunt.registerTask('watch-flash', ['exec:build_flash_ts', 'watch:flash_ts']);
  grunt.registerTask('watch-player', ['exec:build_player_ts', 'watch:player_ts']);
  grunt.registerTask('watch-gfx', ['exec:build_gfx_base_ts', 'exec:build_gfx_ts', 'watch:gfx_ts']);
  grunt.registerTask('watch-tools', ['exec:build_tools_ts', 'watch:tools_ts']);

  // temporary make/python calls based on grunt-exec
  grunt.registerTask('build-playerglobal', ['exec:build_playerglobal']);
  grunt.registerTask('playerglobal', ['exec:build_playerglobal']);
  grunt.registerTask('playerglobal-single', ['exec:build_playerglobal_single']);

  grunt.registerTask('base', ['exec:build_base_ts', 'exec:gate']);
  grunt.registerTask('swf', ['exec:build_swf_ts', 'exec:gate']);
  grunt.registerTask('flash', ['parallel:flash', 'exec:gate']);
  grunt.registerTask('avm1', ['parallel:avm1', 'exec:gate']);
  grunt.registerTask('player', ['exec:build_player_ts', 'exec:gate']);
  grunt.registerTask('shell', ['exec:build_shell_ts', 'exec:gate']);
  grunt.registerTask('tools', ['exec:build_tools_ts', 'exec:gate']);
  grunt.registerTask('avm2', ['exec:build_avm2_ts', 'copy_relooper', 'exec:gate']);
  grunt.registerTask('gfx', ['exec:build_gfx_base_ts', 'exec:build_gfx_ts']);
  grunt.registerTask('gfx-base', ['exec:build_gfx_base_ts', 'exec:gate']);
  grunt.registerTask('gate', ['exec:gate']);
  grunt.registerTask('perf', ['exec:perf']);
  grunt.registerTask('gfx-test', ['exec:gfx-test']);
  grunt.registerTask('build', [
    'parallel:base',
    'parallel:playerglobal',
    'exec:build_tools_ts',
    'exec:build_gfx_base_ts',
    'parallel:tier2',
    'copy_relooper',
    'parallel:natives',
    'exec:build_player_ts',
    'exec:build_shell_ts',
    'bundles'
  ]);
  grunt.registerTask('shu', [
    'build',
    'exec:gate'
  ]);
  grunt.registerTask('travis', [
    // Duplicates almost all of "build" because we don't want to do the costly "playerglobal" task.
    'parallel:base',
    'exec:build_tools_ts',
    'exec:build_gfx_base_ts',
    'parallel:tier2',
    'copy_relooper',
    'parallel:natives',
    'exec:build_player_ts',
    'exec:build_shell_ts',
    'tslint:all',
    'exec:spell',
    'closure'
  ]);
  grunt.registerTask('smoke', [
    'exec:smoke_parse'
  ]);
  grunt.registerTask('test', [
    'exec:gate',
    'exec:test_avm2_quick',
    'exec:tracetest',
    // 'exec:tracetest_swfdec'
  ]);
  grunt.registerTask('mozcentralshu', [
    'mozcentralbaseline',
    'mozcentral',
    'mozcentraldiff'
  ]);
  grunt.registerTask('mozcentralbaseline', function () {
    if (!grunt.option('baseline')) {
      throw new Error('--baseline parameter is not specified.');
    }
    var baseline = grunt.option('baseline');
    var BASELINE_DIR = 'build/mozcentralbaseline';
    grunt.file.delete(BASELINE_DIR, {force: true});
    grunt.file.mkdir(BASELINE_DIR);
    var done = this.async();
    var gitClone = function () {
      grunt.util.spawn({
        cmd: 'git',
        args: ['clone', '../..', '.'],
        opts: { cwd: BASELINE_DIR, stdio: 'inherit'}}, function (error) {
          if (error) {
            done(error);
            return;
          }
          gitCheckout();
        });
    };
    var gitCheckout = function () {
      grunt.util.spawn({
        cmd: 'git',
        args: ['checkout', baseline],
        opts: { cwd: BASELINE_DIR, stdio: 'inherit'}}, function (error) {
        if (error) {
          done(error);
          return;
        }
        bootstrap();
      });
    };
    var bootstrap = function () {
      grunt.util.spawn({
        cmd: 'make',
        args: ['link-utils', 'BASE=../..'],
        opts: { cwd: BASELINE_DIR, stdio: 'inherit'}}, function (error) {
        if (error) {
          done(error);
          return;
        }
        build();
      });
    };
    var build = function () {
      grunt.util.spawn({
        grunt: true,
        args: ['mozcentral'],
        opts: { cwd: BASELINE_DIR, stdio: 'inherit'}}, function (error) {
        if (error) {
          done(error);
          return;
        }
        done();
      });
    };

    gitClone();
  });
  grunt.registerTask('mozcentraldiff', function () {
    var BASELINE_BUILD_DIR = 'build/mozcentralbaseline/build/mozcentral';
    if (!grunt.file.exists(BASELINE_BUILD_DIR)) {
      throw new Error('mozcentralbaseline was not run.');
    }
    var NON_DELTA_BINARIES = [
      'browser/extensions/shumway/content/libs/builtin.abc',
      'browser/extensions/shumway/content/playerglobal/playerglobal.abcs'
    ];
    var MOZCENTRAL_DIR = 'build/mozcentral';
    var DIFF_DIR = 'build/mozcentraldiff';
    grunt.file.delete(DIFF_DIR, {force: true});
    grunt.file.mkdir(DIFF_DIR);
    var done = this.async();
    var rsync = function () {
      grunt.util.spawn({
        cmd: 'rsync',
        args: ['-r'].concat(grunt.file.expand(BASELINE_BUILD_DIR + '/*'), [DIFF_DIR]),
        opts: { stdio: 'inherit' }}, function (error) {
        if (error) {
          done(error);
          return;
        }
        fixNonDelta(0);
      });
    };
    // HACK to avoid 'delta' for 'GIT binary patch'
    var fixNonDelta = function (index) {
      if (index >= NON_DELTA_BINARIES.length) {
        gitCommit();
        return;
      }
      var nonDelta = NON_DELTA_BINARIES[index];
      grunt.util.spawn({
        cmd: 'diff',
        args: [DIFF_DIR + '/' + nonDelta, MOZCENTRAL_DIR + '/' + nonDelta]
      }, function (error, result, code) {
        if (code === 2) {
          // ... we need to truncate the file
          grunt.file.write(DIFF_DIR + '/' + nonDelta, '');
        } else if (error) {
          console.log(code);
          done(error);
          return;
        }
        fixNonDelta(index + 1);
      });
    };
    var gitCommit = function () {
      grunt.util.spawn({
        cmd: 'git',
        args: ['init'],
        opts: { cwd: DIFF_DIR, stdio: 'inherit'}}, function (error) {
        if (error) {
          done(error);
          return;
        }
        grunt.util.spawn({
          cmd: 'git',
          args: ['add', '*'],
          opts: { cwd: DIFF_DIR, stdio: 'inherit'}}, function (error) {
          if (error) {
            done(error);
            return;
          }
          grunt.util.spawn({
            cmd: 'git',
            args: ['commit', '--message=baseline'],
            opts: { cwd: DIFF_DIR, stdio: 'inherit'}}, function (error) {
            if (error) {
              done(error);
              return;
            }
            refresh();
          });
        });
      });
    };
    var refresh = function () {
      grunt.util.spawn({
        cmd: 'rsync',
        args: ['-rc', '--delete'].concat(grunt.file.expand(MOZCENTRAL_DIR + '/*'), [DIFF_DIR]),
        opts: { stdio: 'inherit'}}, function (error) {
        if (error) {
          done(error);
          return;
        }
        gitDiff();
      });
    };
    var gitDiff = function () {
      grunt.util.spawn({
        cmd: 'git',
        args: ['add', '--all'],
        opts: { cwd: DIFF_DIR, stdio: 'inherit'}}, function (error) {
        if (error) {
          done(error);
          return;
        }
        var diffOutput = require('fs').openSync('build/mozcentral.diff', 'w');
        grunt.util.spawn({
          cmd: 'git',
          args: ['diff', '--binary', '--cached', '--unified=8'],
          opts: { cwd: DIFF_DIR, stdio: [null, diffOutput, null]}}, function (error, result, code) {
          if (error) {
            done(error);
            return;
          }
          done();
        });
      });
    };

    rsync();
  });
  grunt.registerTask('generate-version', function () {
    function generateFiles() {
      console.log('Generating version files for ' + version + ' (' + sha + ')');
      grunt.file.write(outputDir + '/version.json',
        JSON.stringify({version: version, sha: sha}));
      grunt.file.write(outputDir + '/version.txt', version + '\n' + sha + '\n');
      grunt.file.write(outputDir + '/version.ts',
        'module Shumway {\n  export var version = \'' + version + '\';\n' +
        '  export var build = \'' + sha + '\';\n}\n');
      grunt.file.write(outputDir + '/version.js',
          'var Shumway;\n(function (Shumway) {\n' +
          '  Shumway.version = \'' + version + '\';\n' +
          '  Shumway.build = \'' + sha + '\';\n' +
          '})(Shumway || (Shumway = {}));\n');
    }

    function getDefaultVersion() {
      var d = new Date();
      return d.getFullYear() * 100000000 + (d.getMonth() + 1) * 1000000 +
             d.getDate() * 10000 + d.getHours() * 100 + d.getMinutes()
    }

    var version = getDefaultVersion(), sha = 'unknown';

    var outputDir = 'build/version';
    grunt.file.mkdir(outputDir);

    var done = this.async();
    grunt.util.spawn({
      cmd: 'git',
      args: ['log', '--format=oneline', VERSION_BASELINE + '..']
    }, function (error, result, code) {
      if (code) {
        generateFiles();
        done('Error code ' + code + ': ' + error);
        return;
      }
      version = VERSION_BASE + (String(result).split(/\n/g).length);
      grunt.util.spawn({
        cmd: 'git',
        args: ['log', '--format=%h', '-n', '1']
      }, function (error, result, code) {
        if (code) {
          generateFiles();
          done('Error code ' + code + ': ' + error);
          return;
        }
        sha = String(result);
        generateFiles();
        done();
      });
    });
  });
  grunt.registerTask('shuobject-package', function () {
    var outputDir = 'build/shuobject';
    grunt.file.mkdir(outputDir);
    var path = require('path');

    grunt.file.copy('build/libs/builtin.abc', outputDir + '/build/libs/builtin.abc');
    grunt.file.copy('build/playerglobal/playerglobal.abcs', outputDir + '/build/playerglobal/playerglobal.abcs');
    grunt.file.copy('build/playerglobal/playerglobal.json', outputDir + '/build/playerglobal/playerglobal.json');
    grunt.file.copy('build/libs/relooper.js', outputDir + '/build/libs/relooper.js');
    grunt.file.expand('build/bundles-cc/*.js').forEach(function (file) {  // TODO closure bundles
      grunt.file.copy(file, outputDir + '/build/bundles/' + path.basename(file));
    });
    grunt.file.expand('web/iframe/*').forEach(function (file) {
      grunt.file.copy(file, outputDir + '/iframe/' + path.basename(file));
    });
    grunt.file.copy('extension/shuobject/shuobject.js', outputDir + '/shuobject.js');
    grunt.file.expand('extension/shuobject/examples/*').forEach(function (file) {
      grunt.file.copy(file, outputDir + '/examples/' + path.basename(file));
    });
    grunt.file.copy('web/demo.swf', outputDir + '/examples/demo.swf');
    grunt.file.copy('examples/external/externalinterface/avm2.swf', outputDir + '/examples/external_interface.swf');

    grunt.file.copy('build/version/version.txt', outputDir + '/version.txt');
    grunt.file.copy('LICENSE', outputDir + '/LICENSE');
  });

  function copyFilesUsingPattern(src, dest, callback) {
    var path = require('path');
    grunt.file.expand(src).forEach(function (file) {
      var p = path.join(dest, path.basename(file));
      grunt.file.copy(file, p);
      if (callback) {
        callback(p);
      }
    });
  }

  grunt.registerTask('dist-package', function() {
    var done = this.async();
    var outputDir = 'build/dist';
    var repoURL = 'https://github.com/mozilla/shumway-dist';

    var path = require('path');
    var fs = require('fs');
    var versionJSON = JSON.parse(fs.readFileSync('build/version/version.json'));

    function prepareFiles(done) {
      grunt.file.copy('build/libs/builtin.abc', outputDir + '/build/libs/builtin.abc');
      grunt.file.copy('build/playerglobal/playerglobal.abcs', outputDir + '/build/playerglobal/playerglobal.abcs');
      grunt.file.copy('build/playerglobal/playerglobal.json', outputDir + '/build/playerglobal/playerglobal.json');
      grunt.file.copy('build/libs/relooper.js', outputDir + '/build/libs/relooper.js');
      copyFilesUsingPattern('build/bundles-cc/*.js', outputDir + '/build/bundles');

      // shuobject packaging
      copyFilesUsingPattern('web/iframe/*', outputDir + '/iframe');
      grunt.file.copy('extension/shuobject/shuobject.js', outputDir + '/shuobject.js');

      // shell packaging
      grunt.file.copy('build/ts/shell.js', outputDir + '/build/ts/shell.js');
      fs.writeFileSync(outputDir + '/build/ts/shell.conf', 'dist');
      grunt.file.copy('src/shell/shell-node.js', outputDir + '/src/shell/shell-node.js');

      var waitFor = 1;
      copyFilesUsingPattern('src/shell/runners/run-*', outputDir + '/bin', function (dest) {
        waitFor++;
        grunt.util.spawn({cmd: 'chmod', args: ['+x', dest]}, function () {
          waitFor--;
          if (waitFor === 0) {
            done();
          }
        });
      });

      // manifests
      var packageJSON = {
        "name": "shumway-dist",
        "version": versionJSON.version,
        "description": "Generic build of Mozilla's Shumway library.",
        "keywords": [
          "Mozilla",
          "Shumway"
        ],
        "homepage": "http://mozilla.github.io/shumway/",
        "bugs": "https://github.com/mozilla/shumway/issues",
        "license": "Apache-2.0",
        "repository": {
          "type": "git",
          "url": "https://github.com/mozilla/shumway-dist"
        }
      };
      fs.writeFileSync(outputDir + '/package.json', JSON.stringify(packageJSON, null, 2));
      var bowerJSON = {
        "name": "shumway-dist",
        "version": versionJSON.version,
        "main": [
          "shuobject.js"
        ],
        "ignore": [],
        "keywords": [
          "Mozilla",
          "Shumway"
        ]
      };
      fs.writeFileSync(outputDir + '/bower.json', JSON.stringify(bowerJSON, null, 2));

      grunt.file.copy('build/version/version.txt', outputDir + '/version.txt');
      grunt.file.copy('LICENSE', outputDir + '/LICENSE');
      grunt.file.copy('utils/dist/README.md', outputDir + '/README.md');

      if (--waitFor === 0) {
        done();
      }
    }

    function addCommitMessages(done) {
      var message = 'Shumway version ' + versionJSON.version;
      var tag = 'v' + versionJSON.version;
      grunt.util.spawn({cmd: 'git', args: ['add', '--all'], opts: {cwd: outputDir}}, function (error) {
        grunt.util.spawn({cmd: 'git', args: ['commit', '-am', message], opts: {cwd: outputDir}}, function () {
          grunt.util.spawn({cmd: 'git', args: ['tag', '-a', tag, '-m', message], opts: {cwd: outputDir}}, function () {
            done();
          });
        });
      });
    }

    grunt.file.delete(outputDir);
    grunt.file.mkdir(outputDir);

    grunt.util.spawn({cmd: 'git', args: ['clone', '--depth', '1', repoURL, outputDir]}, function () {
      prepareFiles(function () {
        addCommitMessages(function () {
          console.info();
          console.info('Done. Push with');
          console.info('  cd ' + outputDir + '; git push --tags ' + repoURL + ' master');
          console.info();

          done();
        });
      });
    });
  });

  grunt.registerTask('firefox', ['build', 'closure-bundles', 'exec:build_extension']);
  grunt.registerTask('mozcentral', ['build', 'closure-bundles', 'exec:build_mozcentral']);
  grunt.registerTask('web', ['build', 'closure-bundles', 'exec:build_extension', 'shell-package', 'shuobject-package', 'exec:build_web']);
  grunt.registerTask('dist', ['build', 'closure-bundles', 'dist-package']);
};
