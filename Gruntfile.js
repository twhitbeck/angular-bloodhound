var files = [
	'src/version.js',
	'src/tokenizers.js',
	'src/lru_cache.js',
	'src/persistent_storage.js',
	'src/transport.js',
	'src/search_index.js',
	'src/options_parser.js',
	'src/bloodhound.js'
];

module.exports = function(grunt) {
	grunt.initConfig({
		version: grunt.file.readJSON('package.json').version,

		buildDir: 'dist',

		uglify: {
			options: {
				enclose: {
					'window.angular': 'angular',
					'window._': '_'
				}
			},
			ngBloodhound: {
				options: {
					mangle: false,
					beautify: true,
					compress: false
				},
				src: files,
				dest: '<%= buildDir %>/ngBloodhound.js'
			}
		},
		sed: {
			version: {
				pattern: '%VERSION%',
				replacement: '<%= version %>',
				recursive: true,
				path: '<%= buildDir %>'
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			src: 'src/**/*.js',
			test: ['test/*_spec.js'],
			gruntfile: ['Gruntfile.js']
		},
		watch: {
			options: {
				livereload: true
			},
			src: {
				files: 'src/**/*',
				tasks: 'build'
			},
			test: {
				files: [
					'test/**/*.html',
					'test/**/*.js'
				]
			}
		},
		clean: {
			dist: 'dist'
		},
		connect: {
			server: {
				options: {
					port: 8888,
					livereload: true
				}
			}
		}
	});

	grunt.registerTask('build', ['uglify', 'sed:version']);
	grunt.registerTask('default', 'build');
	grunt.registerTask('serve', 'connect:server');
	grunt.registerTask('dev', ['build', 'serve', 'watch']);

	grunt.loadNpmTasks('grunt-sed');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-connect');
};
