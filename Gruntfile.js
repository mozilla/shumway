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
      all: ['src/avm1/*.js', 'src/flash/**/*.js', 'src/swf/*.js']
    },
    exec: {
      reftest: {
        cmd: 'make -C test/ reftest'
      },
      makeref: {
        cmd: 'make -C test/ makeref'
      },
      webserver: {
        cmd: 'python utils/webserver.py'
      },
      build_web: {
        cmd: 'make -C web/ build'
      },
      build_extension: {
        cmd: 'make -C extension/firefox/ build'
      },
      build_bundle: {
        cmd: 'make -C utils/builder build'
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
        cmd: 'node compileabc -m ../src/avm2/generated/avm1lib/avm1lib.manifest',
        cwd: 'utils/'
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
      avm1lib: {
        files: ['src/avm2/generated/avm1lib/*.as',
                'src/avm2/generated/avm1lib/avm1lib.manifest'],
        tasks: ['exec:build_avm1lib']
      },
      playerglobal: {
        files: ['src/flash/**/*.as',
                'utils/playerglobal-builder/manifest.json'],
        tasks: ['exec:build_playerglobal']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('lint', ['jshint:all', 'exec:lint_success']);

  grunt.registerTask('update-flash-refs', function  () {
    var updateFlashRefs = require('./utils/update-flash-refs.js');
    updateFlashRefs('examples/inspector/inspector.html', 'src/flash');
    updateFlashRefs('test/harness/slave.html', 'src/flash');
  });

  grunt.registerTask('server', function () {
    var done = this.async();
    grunt.util.spawn({cmd: 'python', args: ['utils/webserver.py']}, function () {
      done();
    });
  });

  grunt.registerTask('watch-playerglobal', ['exec:build_playerglobal', 'watch:playerglobal']);
  grunt.registerTask('watch-avm1lib', ['exec:build_avm1lib', 'watch:avm1lib']);

  // temporary make/python calls based on grunt-exec
  grunt.registerTask('reftest', ['exec:reftest']);
  grunt.registerTask('makeref', ['exec:makeref']);
  grunt.registerTask('build-web', ['exec:build_bundle', 'exec:build_extension', 'exec:build_web']);
  grunt.registerTask('build-extension', ['exec:build_bundle', 'exec:build_extension']);
  grunt.registerTask('build-playerglobal', ['exec:build_playerglobal']);
};
