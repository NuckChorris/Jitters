var fs = require('fs');
var path = require("path");
var util = require("util");
var spawn = require('child_process').spawn;
var Prompt = require('./core/prompt.js');
var tty = require('tty');
var c = require('./core/cli.js');
require("./core/utils.js");

c.clr();
var Jitters;
var config = {};
var w = c.width();
var bar = {
	render: function(val, max){
		c.move(1,0);
		c.write("\x1B[0;37;44m" + " ".repeat(w) + c.reset);
		title = "Jitters Initial Configuration Tool";
		c.move(1,(w/2)-(title.length/2));
		c.write("\x1B[0;37;44m" + title + c.reset);
		c.move(2,0);
		l = Math.floor(w*(val/max));
		r = Math.ceil(w-(w*(val/max)));
		str = "Step "+val+" of "+max;
		loc = Math.floor((w/2)-(str.length/2));
		txtbkg = (l < loc) ? '\x1B[0;37;42m' : '\x1B[0;37;44m';
		c.write(c.bg.dkblue + " ".repeat(l) + c.bg.dkgreen + " ".repeat(r) + c.reset);
		c.move(2,loc+1);
		c.write(txtbkg + str + c.reset);
		c.move(3,1);
	}
};

path.existsSync = function( dir, isDir ) {
	try {
		stats = fs.lstatSync( dir );
		return true;
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

path.exists("./config/Global.json", function(exists){
	fs.readFile( "./config/Global.json", "utf8", function( err, data ){
		var stringthing = ( process.argv.length >= 3 ) ? process.argv[2].toLowerCase() : "";
		if ( !exists || stringthing == "cfg" || stringthing == "config" || stringthing == "configure" || data == "" ) {
			configure();
		} else {
			Start(6);
		}
	} );
});
var configure = function ( ) {
//	c.clr();
	bar.render(1,6);
	Prompt()
		.ask('Hello there! Welcome to the world of Bots! My name is Jitters!\nPeople call me the Bot Prof or "That Jittery Crack Addict."\n\nThis world is inhabited by creatures called Bots!\n\nFor some people, Bots are pets. Others use them for fights.\nMyself... I study Bots as a profession.\n\n\nFirst, what is your name? '+c.fg.grey+'(owner) '+c.reset+c.fg.dkgreen, 'owner')
		.tap(function (vars) {
			c.clr();
			bar.render(2,6);
			config.owner = vars.owner.toString().replace(/((\r|\n)|\u001b\[[ABCD])/g,"");
			c.log('Right! So your name is ' + c.fg.white + vars.owner.toString().replace(/((\r|\n)|\u001b\[[ABCD])/g,"") + c.reset + '!');
		})
		.ask('This is my grandson. He\'s been your bot since you were a baby.\n\n...Erm, what is his name again? '+c.fg.grey+'(bot username) '+c.reset+c.fg.dkgreen, 'user')
		.tap(function (vars) {
			c.clr();
			bar.render(3,6);
			config.username = vars.user.toString().replace(/((\r|\n)|\u001b\[[ABCD])/g,"");
			c.log('That\'s right! His name is ' + c.fg.white + vars.user.toString().replace(/((\r|\n)|\u001b\[[ABCD])/g,"") + c.reset + '!');
		})
		.ask('...Erm, and what was his password? '+c.fg.grey+'(bot password) '+c.fg.black+c.bg.black+c.fx.hidden, 'pass')
		.tap(function (vars) {
			c.clr();
			bar.render(4,6);
			config.password = vars.pass.toString().replace(/((\r|\n)|\u001b\[[ABCD])/g,"");
			c.log(c.reset+'Aha! I remember now! The password was ' + c.fg.white + vars.pass.toString().replace(/((\r|\n)|\u001b\[[ABCD])/g,"") + c.reset + '!');
		})
		.ask("Your very own bot legend is about to unfold! A world of dreams and adventures with bots awaits! Let's go!\n\nAh, but before we can start... what was your bot's " + c.fg.white + "trigger" + c.reset + " again? "+c.fg.dkgreen, 'trig')
		.tap(function (vars) {
			c.clr();
			bar.render(5,6);
			config.trigger = vars.trig.toString().replace(/((\r|\n)|\u001b\[[ABCD])/g,"");
			c.log("Ah, that's right, the trigger was " + c.fg.white + vars.trig.toString().replace(/((\r|\n)|\u001b\[[ABCD])/g,"") + c.reset + "!\n\n");
		})
		.ask("The Bot Prof leaves the room, then comes back, and asks where you want him to put your bot. "+c.fg.grey+'(autojoin rooms) '+c.reset + "" +c.fg.dkgreen, 'rooms')
		.tap(function (vars) {
			c.clr();
			bar.render(6,6);
			var rooms = vars.rooms.toString().replace(/((\r|\n)|\u001b\[[ABCD])/g,"").split(",");
			config.rooms = [];
			var formatChat = function ( chat, me ) {
				me = config.user || me;
				if ( chat ) {
					var parsed = /(chat|pchat|#|@)?\:?(.*)/g.exec( chat );
					var out = '';
					switch( parsed[1] ) {
						case 'chat':
						case '#':
							out = 'chat:' + parsed[2];
							break;
						case 'pchat':
							var pchatters = parsed[2].split( ':' ).sort();
							out = 'pchat:' + pchatters[0] + ':' + pchatters[1];
							break;
						case '@':
							var pchatters = [ parsed[2], me ].sort();
							out = 'pchat:' + pchatters[0] + ':' + pchatters[1];
							break;
						default:
							out = 'chat:' + parsed[2];
					}
					return out;
				} else {
					return false;
				}
			};
			for ( var i = 0; i < rooms.length; i++ ) {
				config.rooms.push( formatChat( rooms[i].trim() ) );
			}
			c.log('Is the following information correct?');
			c.log('Username: ' + c.fg.white + vars.user.toString().replace(/((\r|\n)|\u001b\[[ABCD])/g,"") + c.reset);
			c.log('Password: ' + c.fg.white + vars.pass.toString().replace(/((\r|\n)|\u001b\[[ABCD])/g,"") + c.reset);
			c.log('Owner: ' + c.fg.white + vars.owner.toString().replace(/((\r|\n)|\u001b\[[ABCD])/g,"") + c.reset);
			c.log('Trigger: ' + c.fg.white + vars.trig.toString().replace(/((\r|\n)|\u001b\[[ABCD])/g,"") + c.reset);
			c.log('Autojoin: ' + c.fg.white + vars.rooms.toString().replace(/((\r|\n)|\u001b\[[ABCD])/g,"") + c.reset);
		}).ask(c.fg.dkgreen,'correct')
		.tap(function (vars) {
			if ( vars.correct.toString().toLowerCase() == 'n' || vars.correct.toString().toLowerCase().indexOf( 'no' ) > -1 ) {
				c.log('Okay, we\'ll start again from the top...');
				configure();
			} else {
				c.log('Great!  The bot will start momentarily...\n\nIf you ever need to reconfigure the bot, run "start-bot.bat configure" to get back to this tool.');
				if ( !path.existsSync( "config", true ) ) fs.mkdirSync('config', 0777);
				fs.writeFileSync("./config/autojoin.json", JSON.stringify( { 'rooms': config.rooms } ), "utf8");
				delete config.rooms;
				fs.writeFileSync("./config/Global.json", JSON.stringify(config), "utf8");
				setTimeout(function(){
					Start(6);
				},1000);
			}
		}).end();
};

function Start(code){
	if (code == 5){
		c.clr();
		c.info('Jitters restarting by user request...');
	} else if (code == 6) {
		c.clr();
		c.info('Jitters is starting up...');
	} else if (code == 7) {
		c.info('Jitters has quit by user request...');
	} else {
		c.info('Jitters has crashed!');
	}
	if (code == 5 || code == 6){
		Jitters = spawn( process.execPath, ['Bot.js'] );
		Jitters.stdout.on('data', function (data) {
			util.print( data );
		});
		Jitters.stderr.on('data', function (data) {
			c.error( data );
		});
		Jitters.on('exit', Start);
	}
}