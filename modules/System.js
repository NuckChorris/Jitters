var fs = require('fs');

this.info.name = 'System';
this.info.version = 1;
this.info.about = 'System Functions for Jitters';
this.info.status = true;
this.info.author = 'nuckchorris0';

this.init = function(){
	var join = new Command( "join", 75 );
	join.bind( this.c_join );
	join.help( 'Makes the bot join a room.' );
	
	var chat = new Command( "chat", 75 );
	chat.bind( this.c_chat );
	chat.help( 'Makes the bot enter into pchat.' );
	
	var part = new Command( "part", 75 );
	part.bind( this.c_part );
	part.help( 'Makes the bot part a room.' );

	var say = new Command( "say", 75 );
	say.bind( this.c_say );
	say.help( 'Makes the bot say something.' );

	var exit = new Command( "exit", 99 );
	exit.bind( this.c_exit );
	exit.help( 'Makes the bot exit.' );
	
	var restart = new Command( "restart", 99 );
	restart.bind( this.c_restart );
	restart.help( 'Makes the bot restart.' );
	
	var eval = new Command( [ "e", "eval" ], 100 );
	eval.bind( this.c_eval );
	eval.help( 'Evaluates a piece of JavaScript.' );
	
	var aj = new Command( [ "aj", "autojoin" ], 99 );
	aj.bind( this.c_aj );
	aj.help( 'Manage the rooms that are joined when the bot starts up.' );
	
	var about = new Command( "about", 25 );
	about.bind( this.c_about );
	
	var commands = new Command( "commands", 25 );
	commands.bind( this.c_commands );
	
	var credits = new Command( "credits", 25 );
	credits.bind( this.c_credits );
	
	var trigcheck = new Event( "recv.msg", "trigcheck", 25 );
	trigcheck.bind( this.e_trigcheck );
	
	var autorejoin = new Event( "kicked", "autorejoin" );
	autorejoin.bind( this.e_autorejoin );

	var linecount = new Command( "linecount", 99 );
	linecount.bind( this.c_linecount );
};
this.c_join = function ( chat, from, msg, args ) {
	this.dAmn.join( this.dAmn.formatChat( args[1] ) );
};
this.c_chat = function ( chat, from, msg, args ) {
	this.dAmn.join( this.dAmn.formatChat( '@' + args[1] ) );
	this.dAmn.say( chat, 'Joining pchat with :dev' + args[1] + ':.' );
};
this.c_part = function ( chat, from, msg, args ) {
	this.dAmn.part( this.dAmn.formatChat( args[1] ) );
};
this.c_say = function ( chat, from, msg, args, argsE ) {
	if ( args[1].indexOf("chat:") > -1 || args[1].indexOf("#") > -1 || args[1].indexOf("pchat:") > -1 || args[1].indexOf("@") > -1 ) {
		this.dAmn.say( this.dAmn.formatChat( args[1] ), argsE[2] );
	} else {
		this.dAmn.say( chat, argsE[1] );
	}
};
this.c_exit = function ( chat, from, msg, args, argsE ) {
	this.dAmn.say( chat, "Bot is shutting down..." );
	process.exit(7);
};
this.c_restart = function ( chat, from, msg, args ) {
	this.dAmn.say(chat, "Restarting...");
	process.exit(5);
};
this.c_eval = function ( chat, from, msg, args, argsE ) {
	if (from.toLowerCase() == Bot.owner.toLowerCase()){
		eval(argsE[1]);
	}
};
this.c_about = function(chat, from, msg, args){
	part = args[1];
	cmd = args[0];
	if (part){
		if(cmd.toLowerCase() !== 'about'){
			part = cmd;
		}
		switch(part.toLowerCase()){
			case 'system':
				var about = '/npmsg '+from+': Running Node.JS '+process.version+' on '+process.platform+'.';
				break;
//			case 'uptime':
//				var about = '<abbr title="'+from+'"></abbr>Uptime: '+time_length( getTime() - Bot.start )+'.';
//				break;
			case 'about':
			case '':
			default:
				var about = Bot.about;
				about = about.replace('{name}', Bot.info.name);
				about = about.replace('{version}', Bot.info.version);
				about = about.replace('{status}', Bot.info.status);
				about = about.replace('{release}', Bot.info.release);
				about = about.replace('{owner}', Bot.owner);
				about = about.replace('{author}', Bot.info.author);
				about = about.replace('{envir}', "Node.JS " + process.version + " on " + process.platform );
				break;
		}
	} else {
		var about = Bot.about;
		about = about.replace('{name}', Bot.info.name);
		about = about.replace('{version}', Bot.info.version);
		about = about.replace('{status}', Bot.info.status);
		about = about.replace('{release}', Bot.info.release);
		about = about.replace('{owner}', Bot.owner);
		about = about.replace('{author}', Bot.info.author);
		about = about.replace('{envir}', "Node.JS " + process.version + " on " + process.platform );
	}
	this.dAmn.say( chat, about );
};
this.c_credits = function ( ns, from, msg ) {
	say  = '<b>Special Thanks</b><br/>';
	say += 'You should thank all these people. Without them, Jitters would probably not exist.<br/><sub>';
	say += ' &bull; :devphotofroggy: - Made dAmnPHP, which I studied extensively during development.<br/>';
	say += ' &bull; :devincluye: - Helped ensure that Jitters worked on Mac (and provided a binary of Node.JS), and lit a fire under my ass by releasing his Ruby bot, Participle.<br/>';
	say += ' &bull; :devjadenxtrinityx: - Checked that my bot could work on other computers than my own, and constantly asked me if I was done yet.<br/>';
	say += ' &bull; :devphilo23: - Created dAmnAIR library (which I use the packet parser from).<br/>';
	say += '</sub>';
	this.dAmn.say( ns, say );
};
this.c_commands = function ( ns, from, msg ) {
	var priv = Users.getPriv( from );
	var arr = [];
	for ( var key in Bot.modules ) {
		arr.push( [ key, Bot.modules[key].cmds.length ] );
	}
	var sorted = arr.sort( function ( a, b ) {
		if ( a[1].length < b[1].length )
			return -1;
		if ( a[1].length > b[1].length )
			return 1;
		return 0;
	} );
	var linelen = 0;
	var output = "<sub><b><u>Commands</u></b><br />";
	for ( var i = sorted.length-1; i >= 0; i-- ) {
		var key  = sorted[i][0];
		var cmdsA = Bot.modules[key].cmds;
		var cmds = [];
		
		if ( cmdsA.length > 0 ) {
			// iterate and remove non-privved stuff.
			for ( var a = 0; a < cmdsA.length; a++ ) {
				if ( priv >= cmdsA[a].priv ) {
					cmds.push( cmdsA[a] );
				}
			}
		}
		if ( cmds.length > 0 ) {
			if ( linelen + cmds.length < 15 ) {
				if ( linelen !== 0 ) output += " &nbsp; &bull; &nbsp; ";
				linelen += cmds.length;
				output += "<b>" + key + ": </b>";
				for ( var n = 0; n < cmds.length; n++ ) {
					if ( cmds[n].name.constructor.toString().indexOf("Array") !== -1 ) cmds[n].name = cmds[n].name.join( ' / ' );
					output += '<abbr title="' + cmds[n].priv + '">' + cmds[n].name + '</abbr>' + ( ( n < cmds.length-1 ) ? ' &middot; ' : '' );
				}
			} else {
				linelen = cmds.length;
				output += '<br /><b>' + key + ': </b>';
				for ( var n = 0; n < cmds.length; n++ ) {
					if ( cmds[n].name.constructor.toString().indexOf("Array") !== -1 ) cmds[n].name = cmds[n].name.join( ' / ' );
					output += '<abbr title="' + cmds[n].priv + '">' + cmds[n].name + '</abbr>' + ( ( n < cmds.length-1 ) ? ' &middot; ' : '' );
				}
			}
		}
	}
	output += "</sub>";
	this.dAmn.say( ns, output );
};
this.e_trigcheck = function ( chat, from, msg ) {
	if ( msg.slice( 0, this.Bot.username.length + 11 ).toLowerCase() == this.Bot.username + ": trigcheck" ) {
		this.dAmn.say( chat, from + ": My trigger is \"<code>" + this.Bot.trigger + "</code>\"." );
	}
};
this.e_autorejoin = function ( chat, by, msg ) {
//	c.log( JSON.stringify( arguments ) );
	if ( msg !== undefined && msg.indexOf("autokicked") == -1 ) {
		this.dAmn.join( chat );
	}
};
this.c_aj = function ( ns, from, msg, args, argsE ) {
	var rooms = config.load('autojoin').rooms;
	var orms = (function(){ var o = {}; for( var i = 0, l = rooms.length; i < l; i++ ) o[ rooms[i] ] = ''; return o })();
	switch ( args[1].toLowerCase() ) {
		case 'add':
		case '+':
		case 'new':
			var room = this.dAmn.formatChat( args[2] ).toLowerCase();
			if ( !( room in orms ) ) {
				rooms.push( room );
				config.save( 'autojoin', { 'rooms': rooms } );
				this.dAmn.say( ns, from + ': <b>' + this.dAmn.deformChat( room ) + '</b> added to autojoin.' );
			} else {
				this.dAmn.say( ns, from + ': <b>' + this.dAmn.deformChat( room ) + '</b> already in autojoin.' );
			}
			break;
		case '-':
		case 'rem':
		case 'remove':
		case 'del':
		case 'delete':
			var room = this.dAmn.formatChat( args[2] ).toLowerCase();
			if ( room in orms ) {
				for( var i = 0, l = rooms.length; i < l; i++ ) { 
					if( rooms[i] == room ) rooms.splice(i,1); 
				}
				config.save( 'autojoin', { 'rooms': rooms } );
				this.dAmn.say( ns, from + ': <b>' + this.dAmn.deformChat( room ) + '</b> removed from autojoin.' );
			} else {
				this.dAmn.say( ns, from + ': <b>' + this.dAmn.deformChat( room ) + '</b> not in autojoin.' );
			}
			break;
		case 'list':
		case 'show':
		case 'rooms':
		default:
			this.dAmn.say( ns, 'Autojoin rooms: ' + this.dAmn.deformChat( rooms ).join( ', ' ) );
			break;
	}
};
this.c_linecount = function ( ns, from, msg, args ) {
	try {
		var files = [];
		args[1] = args[1] || '';
		switch ( args[1] ) {
			case 'core':
				args[1] = 'everything';
				files.push( 'Bot.js', 'Start-Jitters.js', 'core/cli.js', 'core/dAmnJS.js', 'core/prompt.js', 'core/fileLog.js', 'core/utils.js' );
				break;
			case 'plugins':
				files.push( String('modules\/\{\/\.\*\/\}') );
				break;
			case 'everything':
			case '':
				files.push( 'Bot.js', 'Start-Jitters.js', 'modules\/\{\/\.\*\\.js\/\}', 'core\/\{\/\.\*\\.js\/\}' );
				break;
			default:
				files.push( args[1] );
		}
//		var lineCounts = {};
		var total = 0;
		var counts = [];
		var fout = [];
		for ( var i = 0, l = files.length; i < l; i++ ) {
			if ( /\{\/.*\/\}/g.test( files[i] ) ) {
				var re = /\{\/(.*)\/\}/g.exec( files[i] )[1];
				var d = files[i].replace( /\{\/.*\/\}/g, '' );
				var dir = fs.readdirSync( d );
				matches = dir.filter((function(item){
					return RegExp( re ).test( item );
				}).bind(this));
				for ( var ii = 0, ll = matches.length; ii < ll; ii++ ) {
					matches[ii] = d + matches[ii];
				}
				fout.push.apply( fout, matches );
//				files.splice.apply( files, [i, 1].concat(matches) );
//				c.log( JSON.stringify( files ) );
			} else {
				fout.push( files[i] );
			}
		}
		for ( var iii = 0, lll = fout.length; iii < lll; iii++ ) {
/* 			fs.readFile( files[i], 'utf8', (function( err, data ) {
				c.error( '[Line Counter] linecounts: ' + JSON.stringify( lineCounts ) );
				var len = data.split( "\n" ).length;
				lineCounts[ files[i] ] = len;
				total += len;
//				this.dAmn.say( ns, len );
//				data = lines[i];
			}).bind(this)); */
			var data = fs.readFileSync( fout[iii], 'utf8' );
//			c.error( '[Line Counter] linecounts: ' + JSON.stringify( lineCounts ) );
			var lines = data.replace( /\/\*.*\*\//g, '' ).split( "\n" );
			var len = lines.filter(function(item){
				return !( /^\s*$/.test( item ) && /^\s*\/\/.*$/.test( item ) );
			}).length;
//			var len = data.split( "\n" ).length;
//			lineCounts[ files[i] ] = len;
			counts.push( fout[iii] + ' ' + len );
			total += len;
		}
		var out = 'Total size of ' + ( args[1] || 'everything' ) + ': ' + total + ' lines<br /><sup>';
		this.dAmn.say( ns, out + counts.join( ' &middot; ' ) + '</sup>' );
	} catch (e) {
		c.error( e );
		this.dAmn.say( ns, 'lolfailed' );
	}
}
