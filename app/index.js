var yeoman = require('yeoman-generator');
var path = require('path');
var q = require('q');
module.exports = yeoman.generators.Base.extend({
	init : function(){

	},
	askForPkgInfo: function(){
		var done = this.async();
		var prompts = [{
			name :'name',
			message:'模块名称:',
			default: path.basename(process.cwd())
		},{
			name :'description',
			message:'描述:',
			default:"PP前端"
		}, {
			name :'authorName',
			message:'作者:'
		}];

		this.prompt(prompts, function(props){
			this.slugname = this._.slugify(props.name);
			this.props = props;
			done();
		}.bind(this));
	}, 
	askForBuildType : function(){

		var done = this.async();
		var prompts = [{
			name: 'buildType',
			type :'list',
			message: '构建工具',
			choices: ['gulp', 'grunt']
		}];
		this.prompt(prompts, function(props){
			this.buildType = props.buildType;

			if(props.buildType === "gulp"){
				this._askForGulpPlugins(done);
			} else if (props.buildType === "grunt"){
				this._askForGruntPlugins(done);
			}
		}.bind(this));
	},
	_askForGruntPlugins : function(done){
		var prompts = [{
			name : 'plugins',
			type :'checkbox',
			message:'插件',
			choices: ['grunt-contrib-copy','grunt-contrib-uglify','grunt-contrib-concat','grunt-contrib-sass','grunt-contrib-cssmin','grunt-usemin','grunt-contrib-watch']
		}];

		this.prompt(prompts, function(props){
			this.plugins = props.plugins;
			done();
		}.bind(this));
	},

	_askForGulpPlugins : function(done){
		var prompts = [{
			name : 'plugins',
			type :'checkbox',
			message:'插件',
			choices: ['gulp-copy','gulp-uglify','gulp-concat','gulp-sass','gulp-cssmin','gulp-usemin','gulp-watch']
		}];
		this.prompt(prompts, function(props){
			this.plugins = props.plugins;
			done();
		}.bind(this))
	},
	createFolder : function(){
		var done = this.async();
		this.config.save();

		this.mkdir('dist');
		this.mkdir('dist/css');
		this.mkdir('dist/images');
		this.mkdir('dist/js');

		this.mkdir('src');
		this.mkdir('src/css');
		this.mkdir('src/sass');
		this.mkdir('src/js');
		this.mkdir('src/images');
		this.mkdir('src/tmpl');


        this.copy('.gitignore','src/.gitignore');
        this.template('_index.html', 'src/index.html');
        done();
	},

	installBuilder : function(){
		var done = this.async();
        this.destinationRoot("src");
		this.npmInstall(this.buildType, {"saveDev":true}, function(){
			done();
		});
	},

	installPlugins : function(){
		var done = this.async(),
			that = this,
			def = q.defer();

		var promise;
		def.resolve();
		promise = def.promise;
		this.log(this.plugins);
		this.plugins.forEach(function(pluginName){
			promise = promise.then(function(){
				var def = q.defer();
				that.npmInstall(pluginName,{"saveDev":true}, function(){
					def.resolve();
				});
				return def.promise;
			});
		});

		promise.then(done);
	}


});