var spawn = require('child_process').spawn;
var Script = process.binding('evals').Script;
var http = require('http');
var net = require('net');
var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var utils = require('./core/utils.js');
var c = require('./core/cli.js');

var dAmnJS = require('./core/dAmnJS.js').dAmnJS;

path.existsSync = function( dir, isDir ) {
	try {
		stats = fs.lstatSync( dir );
		if ( isDir == true ) {
			return stats.isDirectory();
		} else {
			return stats.isFile();
		}
	}
	catch (e) {
		return false;
	}
};

var cmd_events = new EventEmitter();

var config = {
	folder: 'config',
	save: function( db, data ) {
		fs.writeFile( this.folder + "/" + db + ".json", JSON.stringify(data), "utf8" );
	},
	load: function( db, def ) {
		def = def || false;
		var exists = path.existsSync( "./"+this.folder+"/"+db+".json" );
		if ( exists ) {
			var data = fs.readFileSync( this.folder+"/" + db + ".json", "utf8" );
			try {
				return JSON.parse( data );
			}
			catch (e) {
				if ( def !== false ) {
					fs.writeFile("./"+this.folder+"/"+db+".json", def, "utf8");
				}
				return def;
			}
		} else {
			if ( def !== false ) {
				fs.writeFile("./"+this.folder+"/"+db+".json", def, "utf8");
			}
			return def;
		}
		return def;
	},
};

var Users = {
	settings: {
		def: 25,
		users: {},
		pcs: {
			'owner': {
				name:  'Owner',
				order: 100,
				users: {},
			},
			'co-owners': {
				name:  'Co-Owners',
				order: 99,
				users: {},
			},
			'admins': {
				name:  'Admins',
				order: 75,
				users: {},
			},
			'members': {
				name:  'Members',
				order: 50,
				users: {},
			},
			'guests': {
				name:  'Guests',
				order: 25,
				users: {},
			},
			'banned': {
				name:  'Banned',
				order: 0,
				users: {},
			},
		},
	},
	load: function ( ) {
		this.settings = config.load('users',false) || this.settings;
	},
	save: function ( ) {
		config.save( 'users', this.settings );
	},
	getPriv: function ( user ) {
		return ( user.toLowerCase() in this.settings.users ) ? this.settings.users[ user.toLowerCase() ].priv : this.settings.def;
	},
	getOverrides: function ( user ) {
		return this.settings.users[ user.toLowerCase() ].overrides;
	},
	getOrderOfPc: function ( pc ) {
		pc = pc || '';
		return ( pc.toLowerCase() in this.settings.pcs ) ? this.settings.pcs[ pc.toLowerCase() ].order : false;
	},
	getPcByOrder: function ( order ) {
		for ( var key in this.settings.pcs ) {
			if ( this.settings.pcs[ key ].order == order ) return key;
		}
	},
	normalize: function ( priv ) {
		return ( /^\d+$/g.test( priv ) ) ? this.getPcByOrder( priv ) : priv.toLowerCase();
	},
	changeOwner: function ( oldOwner, newOwner, confirm ) {
		if ( confirm == true && this.getPriv( newOwner ) == 99 && this.getPriv( oldOwner ) == 100 ) {
			this.settings.users[ newOwner.toLowerCase() ] = { 'priv': 100, 'overrides': {} };
			this.settings.users[ oldOwner.toLowerCase() ] = { 'priv': 99,  'overrides': {} };
			var globalCfg = config.load( 'global' );
			globalCfg.owner = newOwner;
			Bot.owner = newOwner;
			config.save( 'global', globalCfg );
			this.settings.pcs[ this.getPcByOrder( 100 ) ].users = {};
			this.settings.pcs[ this.getPcByOrder( 100 ) ].users[ newOwner ] = newOwner;
			this.save();
			return true;
		} else {
			return false;
		}
	},
	setUserPc: function ( user, pc ) {
		console.log( user );
		console.log( this.normalize(pc) );
		console.log( this.normalize(pc) in this.settings.pcs );
		console.log( this.getPriv( user ) );
		console.log( this.getPriv( user ) < 100 );
		if ( this.normalize(pc) in this.settings.pcs && this.getPriv( user ) < 100 ) {
			this.resetUserPc( user );
			this.settings.users[ user.toLowerCase() ] = { 'priv': this.getOrderOfPc( this.normalize( pc ) ), 'overrides': {} };
			this.settings.pcs[ this.normalize(pc) ].users[ user.toLowerCase() ] = user;
			this.save();
			return true;
		} else {
			return false;
		}
	},
	resetUserPc: function ( user ) {
		if ( this.getPriv( user ) == 100 ) return false;
		if ( !( user.toLowerCase() in this.settings.users ) ) return true;
		delete this.settings.pcs[ this.getPcByOrder( this.getPriv( user ) ) ].users[ user.toLowerCase() ];
		delete this.settings.users[ user.toLowerCase() ];
		return true;
	},
	/* These functions are still unfinished */
	addPc: function( pc, order ) {
		var found = false;
		for ( var key in this.settings.pcs ) {
			if ( this.settings.pcs[ key ].order == order ) found = true;
		}
		if ( !( this.normalize( pc ) in this.settings.pcs ) && !found ) {
			this.settings.pcs[ this.normalize( pc ) ] = {
				name: pc,
				order: order,
				users: {},
			};
			return true;
		} else {
			return false;
		}
	},
	deletePc: function( pc ) {
		if ( this.normalize( pc ) in this.settings.pcs ) {
			for ( var user in this.settings.pcs[ this.normalize( pc ) ] ) {
				this.resetUserPc( user );
			}
			delete this.settings.pcs[ this.normalize( pc ) ];
			return true;
		} else {
			return false;
		}
	},
	renamePc: function( oldName, newName ) {
		if ( this.normalize( oldName ) in this.settings.pcs && !( this.normalize( newName ) in this.settings.pcs ) ) {
			this.settings.pcs[ this.normalize( newName ) ] = this.settings.pcs[ this.normalize( oldName ) ];
			delete this.settings.pcs[ this.normalize( oldName ) ];
			this.settings.pcs[ this.normalize( newName ) ].name = newName;
			return true;
		} else {
			return false;
		}
	},
	changePcOrder: function( pc, order ) {
		var found = false;
		for ( var key in this.settings.pcs ) {
			if ( this.settings.pcs[ key ].order == order ) found = true;
		}
		if ( !found && pc ) {
			this.settings.pcs[ this.normalize( pc ) ].order = order;
			for ( var user in this.settings.pcs[ this.normalize( pc ) ] ) {
				this.settings.users[ user ].priv = order;
			}
			return true;
		} else {
			return false;
		}
	},
};

var Command = function ( name, priv ) {
	this.module = Command.caller.arguments[0];
	this.name = name;
	this.priv = priv || 25;
	this.help_msg = 'There is no help for this command.  Sucks to be you.  Go bitch at the coder.';
	Bot.modules[this.module.name].cmds.push({
		'type': 'command',
		'name': this.name,
		'priv': this.priv,
	});
	this.bind = function ( func ) {
		this.func = func;
		fn = (function( chat, from, msg ) {
			if ( Users.getPriv( from ) >= this.priv ) {
				var args = msg.slice( Bot.trigger.length ).split(" ");
				var argsE = new Array();
				for(var key in args){
					argsE.push( msg.slice( Bot.trigger.length ).split(" ").slice(key).join(" ") );
				}
				console.log( '"' + args[1] + '"' );
				if ( args[1] == '?' || args[1].toLowerCase() == 'help' ) {
					dAmn.say( chat, this.help_msg.replace( '{from}', from ).replace( '{trig}', Bot.trigger ) );
				} else {
					// Command events recieve the following 5 arguments: chat, from, message, args, argsE
					this.func.call( {	'c': c,
										'process': process,
										'dAmn': dAmn,
										'Bot': Bot,
										'Command': Command,
										'Event': Event,
										'Modules': Modules,
										'Users': Users,
										'info': {}
									}, chat, from, msg, args, argsE );
				}
			} else {
				cmd_events.emit( 'nopriv', chat, from, this.name, this.priv, Users.getPriv( from ) );
			}
		}).bind(this);
		cmd_events.on( 'c_' + this.name, fn );
	};
	this.help = function ( txt ) {
		this.help_msg = txt;
	};
};

var Event = function ( event, name, priv ) {
	this.module = Event.caller.arguments[0];
	this.event = event;
	this.name = name;
	this.priv = priv || false;
	Bot.modules[this.module.name].events.push({
		'event': this.event,
		'name':  this.name,
		'priv':  this.priv,
	});
	this.bind = function ( func ) {
		this.func = func;
		fn = (function( chat, from ) {
			if ( this.priv == false || Users.getPriv( from ) >= this.priv ) {
				// Command events recieve the following 5 arguments: chat, from, message, args, argsE
				this.func.apply( {	'c': c,
									'process': process,
									'dAmn': dAmn,
									'Bot': Bot,
									'Command': Command,
									'Event': Event,
									'Modules': Modules,
									'Users': Users,
									'info': {}
								}, arguments );
			}
		}).bind(this);
		dAmn.events.on( this.event, fn );
	};
	this.one = function ( func ) {
		this.func = func;
	};
};

var Modules = {
	dir: './modules',
	list: {},
	load: function(){
		var modules = fs.readdirSync( this.dir );
		c.info( 'Loading modules...' );
		for ( var i in modules ) {
			fs.readFile( this.dir + '/' + modules[i], 'utf8', (function( error, module ) {
				var envir = {	'c': c,
								'process': process,
								'dAmn': dAmn,
								'Bot': Bot,
								'Command': Command,
								'Event': Event,
								'Modules': Modules,
								'Users': Users,
								'info': {}
							};
				var res = Script.runInNewContext( module, envir );
				var headers = new Array();
				headers.name = envir.info.name;
				headers.version = envir.info.version;
				headers.about = envir.info.about;
				headers.status = envir.info.status;
				headers.author = envir.info.author;
				this.list[headers.name] = headers;
				this.list[headers.name].code = module;
				Bot.modules[headers.name] = {'cmds': [], 'events': []};
				if ( headers.status == true ) {
					c.info('Module [[@fg;dkcyan]]' + headers.name + '[[@fg;dkgreen]] Loaded!');
					envir.init( headers );
				}
			}).bind(this));
		}
	},
};

var dAmn;

var Console = function ( ) {
	if ( !path.existsSync( "logs", true ) ) fs.mkdirSync('logs', 0777);

	dAmn.events.on( 'recv.msg', function (chat, from, msg) {
		if ( msg.indexOf( Bot.username ) !== -1 ) {
			msg = msg.replace( Bot.username, c.bg.grey + c.fg.white + Bot.username + c.bg.reset + c.fg.ltgrey );
		}
		c.msg( dAmn.deformChat( chat ), from, msg );
	});

	dAmn.events.on( 'recv.action', function (chat, from, msg) {
		if ( msg.indexOf( Bot.username ) !== -1 ) {
			msg = msg.replace( Bot.username, c.bg.grey + c.fg.white + Bot.username + c.bg.reset + c.fg.ltgrey );
		}
		c.action( dAmn.deformChat( chat ), from, msg );
	});
	dAmn.events.on( 'recv.join', function (chat, from) {
		c.join( dAmn.deformChat( chat ), from );
	});
	dAmn.events.on( 'recv.part', function (chat, from, reason) {
		c.part( dAmn.deformChat( chat ), from, reason );
	});
	dAmn.events.on( 'recv.kicked', function (chat, kickee, kicker, msg) {
		c.kick( dAmn.deformChat( chat ), kickee, kicker, msg );
	});
	dAmn.events.on( 'recv.admin.remove', function (chat, p, by, name, num) {
		c.admin_remove( dAmn.deformChat( chat ), by, name, num );
	});
	dAmn.events.on( 'recv.admin.move', function (chat, p, by, prev, name, num ) {
		c.admin_move( dAmn.deformChat( chat ), by, prev, name, num );
	});
	dAmn.events.on( 'recv.privchg', function (chat, who, by, pc ) {
		c.privchg( dAmn.deformChat( chat ), who, by, pc );
	});
	dAmn.events.on( 'recv.admin.rename', function (chat, p, by, prev, name ) {
		c.admin_rename( dAmn.deformChat( chat ), by, prev, name );
	});
	dAmn.events.on( 'recv.admin.update', function (chat, p, by, name, privs) {
		c.admin_update( dAmn.deformChat( chat ), p, by, name, privs );
	});
	dAmn.events.on( 'recv.admin.create', function (chat, p, by, name, privs) {
		c.admin_create( dAmn.deformChat( chat ), by, name, privs );
	});
	dAmn.events.on( 'kicked', function (chat, kicker, msg) {
		c.kicked( dAmn.deformChat( chat ), kicker, msg );
	});
};

var Jitters = function ( username, password, trigger, owner ) {
	/* VERSION INFO */
	this.about = "Running <b><abbr title=\"{envir}\">{name} {version}</abbr></b><br /><sup>Owned by <b>:dev{owner}:</b> | Created by :dev{author}:</sup>";
	this.info = {
		name:		'Jitters',
		version:	'1.0a',
		status:		'alpha',
		release:	'1.0',
		author:		'nuckchorris0',
	};
	/* END VERSION INFO */
	this.username = username;
	this.password = password;
	this.trigger  = trigger;
	this.owner    = owner;
	
	this.modules = {};
	
	Users.load();
	Users.settings.users[ owner.toLowerCase() ] = { 'priv': 100, 'overrides': {} };
	Users.settings.pcs[ Users.getPcByOrder( 100 ) ].users[ owner.toLowerCase() ] = this.owner;
	Users.save();

	c.clrScr();
	
	// Construct new dAmnJS object and log in
	dAmn = new dAmnJS( this.username, this.password, {'trigger':this.trigger,'owner':this.owner,'authtoken':cfg.authtoken} );
	
	// Load console.
	Console();

	// Bind startup events
	dAmn.events.on( 'loggedin', function ( ) {
		for ( var i = 0; i < cfg.rooms.length; i++ ) {
			dAmn.join( cfg.rooms[i] );
		}
	} );
	
	// Load modules
	dAmn.events.on( 'sys_authtoken', function ( auth ) {
		cfg.authtoken = auth;
		config.save('Global', cfg);
		Modules.load();
	} );
	
	// Bind nopriv
	cmd_events.on( 'nopriv', function ( chat, from, cmd, need, have ) {
		dAmn.say( chat, from+': Sorry, but you are not priveleged for that command.' );
	} );

	// Command parser event hook.
	this.cmdParser = function ( chat, from, msg ) {
		if ( msg.slice( 0, Bot.trigger.length ) == Bot.trigger ) {
			var cmd = msg.slice( Bot.trigger.length ).split(" ")[0];
			cmd_events.emit( 'c_' + cmd, chat, from, msg );
		}
	};
	dAmn.events.on( 'recv.msg', this.cmdParser.bind(this) );
};

var cfg = config.load('Global');
var Bot = new Jitters( cfg.username, cfg.password, cfg.trigger, cfg.owner );