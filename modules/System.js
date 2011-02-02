this.info.name = 'System';
this.info.version = 1;
this.info.about = 'System Functions for Jitters';
this.info.status = true;
this.info.author = 'nuckchorris0';

this.init = function(){
	var join = new Command( "join", 75 );
	join.bind( this.c_join );
	join.help( 'Makes the bot join a room.' );
	
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
	
	var eval = new Command( "eval", 100 );
	eval.bind( this.c_eval );
	eval.help( 'Evaluates a piece of JavaScript.' );
	
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
};
this.c_join = function ( chat, from, msg, args ) {
	this.dAmn.join( this.dAmn.formatChat( args[1] ) );
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
//				case 'uptime':
//					var about = '<abbr title="'+from+'"></abbr>Uptime: '+time_length( getTime() - Bot.start )+'.';
//					break;
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
	say += 'You should thank all these people. Without them, Jitters would probably not exist.<br/>';
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
					output += '<abbr title="' + cmds[n].priv + '">' + cmds[n].name + '</abbr>' + ( ( n < cmds.length-1 ) ? ' &middot; ' : '' );
				}
			} else {
				linelen = cmds.length;
				output += '<br /><b>' + key + ': </b>';
				for ( var n = 0; n < cmds.length; n++ ) {
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
	if ( msg.indexOf("autokicked") == -1 ) {
		this.dAmn.join( chat );
	}
};