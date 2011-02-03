var path = require("path");
var fs   = require("fs");

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

module.exports = {
	months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
	write: function( chat, str ) {
		var d = new Date();
		var p = ['.', 'logs', chat.toLowerCase(), d.getFullYear(), this.months[ d.getMonth() ], d.getFullYear() + '-' + this.months[ d.getMonth() ] + '-' + d.getDate() + '.txt' ];
		for ( var i = 1, l = p.length; i < l; i++ ) {
			var pp = p.slice( 0, i ).join( '/' );
			if ( !path.existsSync( pp, true ) ) fs.mkdirSync( pp, 0777);
		}
		var f = p.join( '/' );
		fs.readFile( f, ( function (err, old) {
			old = old || 'Session Start: ' + d.toString();
			fs.writeFile( f, old + str, function (err) {
				if (err) throw err;
			});
		}).bind(this));
	},
	log: function( str ) {
		this.write( chat, ts + ' ~ ' + str + "\r\n" );
	},
	get ts(){
		d = new Date();
		h = d.getHours() + 1;
		hh = ( h < 10 ) ? "0" + h : h;
		m = d.getMinutes() + 1;
		mm = ( m < 10 ) ? "0" + m : m;
		s = d.getSeconds() + 1;
		ss = ( s < 10 ) ? "0" + s : s;
		return hh + ":" + mm + ":" + ss;
	},
	msg: function( chat, from, msg ) {
		this.write( chat, this.ts + '  <' + from + '> ' + msg + "\r\n" );
	},
	action: function( chat, from, msg ) {
		this.write( chat, this.ts + ' * ' + from + ' ' + msg + "\r\n");
	},
	join: function( chat, from ) {
		this.write( chat, this.ts + ' **' + from + ' has joined.' + "\r\n");
	},
	part: function( chat, from ) {
		this.write( chat, this.ts + ' **' + from + ' has left.' + "\r\n");
	},
	admin_remove: function( chat, by, name, num ) {
		this.write( chat, this.ts + ' **privclass ' + name + ' has been removed by ' + by + ' (' + num + ( num == 1 ? ' member was' : ' members were' ) + ' affected)' + "\r\n" );
	},
	admin_rename: function( chat, by, prev, name ) {
		this.write( chat, this.ts + ' **privclass ' + prev + ' has been renamed to ' + name + ' by ' + by + '.' + "\r\n" );
	},
	privchg: function( chat, who, by, pc ) {
		this.write( chat, this.ts + '** ' + who + ' has been made a member of ' + pc + ' by ' + by + '.' + "\r\n" );
	},
	admin_move: function( chat, by, prev, name, num ) {
		this.write( chat, this.ts + ' **all members of ' + prev + ' have been made ' + name + ' by ' + by + ' (' + num + ( num == 1 ? ' member was' : ' members were' ) + ' affected)' + "\r\n" );
	},
	admin_create: function( chat, by, name, privs ) {
		this.write( chat, this.ts + ' **privclass ' + name + ' has been created by ' + by + ' with: ' + privs + "\r\n" );
	},
	admin_update: function( chat, p, by, name, privs ) {
		if ( p == 'privclass' ) {
			this.write( chat, this.ts + ' **privclass ' + name + ' has been updated by ' + by + ' with: ' + privs + "\r\n" );
		} else {
			this.write( chat, this.ts + ' **' + p + ' has been updated by ' + by + ' with: ' + privs + "\r\n" );
		}
	},
	kick: function( chat, kickee, kicker, msg ) {
		this.write( chat, this.ts + '***' + kickee + ' has been kicked by ' + kicker+ ' *** ' + msg + "\r\n" );
	},
	kicked: function( chat, kicker, msg ) {
		this.write( chat, this.ts + '***You have been kicked by ' + kicker + ' *** ' + msg + "\r\n" );
	},
	info: function(str) {
		this.write( chat, ' # ' + str + "\r\n" );
	},
};