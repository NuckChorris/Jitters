var sys = require("sys");
if ( process.version !== 'v0.3.1' ) {
	var tty = require("tty");
}
module.exports = {
	reset: '\x1B[0m',
	fx: {
		invert: '\x1B[7m',
		hidden: '\x1B[8m',
		default: '\x1B[9m',
	},
	fg: {
		black:    '\x1B[0;30m',
		dkred:    '\x1B[0;31m',
		dkgreen:  '\x1B[0;32m',
		dkyellow: '\x1B[0;33m',
		dkblue:   '\x1B[0;34m',
		purple:   '\x1B[0;35m',
		dkcyan:   '\x1B[0;36m',
		ltgrey:   '\x1B[0;37m',

		grey:     '\x1B[1;30m',
		red:      '\x1B[1;31m',
		green:    '\x1B[1;32m',
		yellow:   '\x1B[1;33m',
		blue:     '\x1B[1;34m',
		magenta:  '\x1B[1;35m',
		cyan:     '\x1B[1;36m',
		white:    '\x1B[1;37m',
	},
	bg: {
		reset:    '\x1B[49m',
		
		black:    '\x1B[40m',
		dkred:    '\x1B[41m',
		dkgreen:  '\x1B[42m',
		dkyellow: '\x1B[43m',
		dkblue:   '\x1B[44m',
		purple:   '\x1B[45m',
		dkcyan:   '\x1B[46m',
		ltgrey:   '\x1B[47m',

		grey:     '\x1B[5;40m',
		red:      '\x1B[5;41m',
		green:    '\x1B[5;42m',
		yellow:   '\x1B[5;43m',
		blue:     '\x1B[5;44m',
		magenta:  '\x1B[5;45m',
		cyan:     '\x1B[5;46m',
		white:    '\x1B[5;47m',
	},
	coords: function(x,y) {
		return '\033['+x+';'+y+'H';
	},
	width: function() {
		if ( process.version == 'v0.3.1' ) {
			return Number( process.binding('stdio').getColumns() );
 		} else {
			return Number( tty.getWindowSize(1)[1] );
		}
	},
	height: function() {
		if ( process.version == 'v0.3.1' ) {
			return Number( process.binding('stdio').getRows() );
 		} else {
			return Number( tty.getWindowSize(1)[0] );
		}
	},
	move: function(x,y) {
		sys.print('\033['+x+';'+y+'H');
	},
	up: function(x) {
		sys.print('\033['+x+'A');
	},
	down: function(x) {
		sys.print('\033['+x+'B');
	},
	right: function(x) {
		sys.print('\033['+x+'C');
	},
	left: function(x) {
		sys.print('\033['+x+'D');
	},
	clr: function() {
		sys.print('\x1B[2J');
	},
	clrScr: function() {
		sys.print('\x1B[2J');
	},
	clrLn: function() {
		sys.print('\033[K');
	},
	write: function(str) {
		sys.print(str);
	},
	log: function(str) {
		sys.print(this.parse(str)+"\x1B[0m\r\n");
	},
	ts: function() {
		d = new Date();
		h = d.getHours() + 1;
		hh = ( h < 10 ) ? "0" + h : h;
		m = d.getMinutes() + 1;
		mm = ( m < 10 ) ? "0" + m : m;
		s = d.getSeconds() + 1;
		ss = ( s < 10 ) ? "0" + s : s;
		return hh + ":" + mm + ":" + ss;
	},
	linestamp: function(chat){
		return this.fg.grey + this.ts() + ' [' + this.fg.ltgrey + chat + this.fg.grey + ']';
	},
	msg: function(chat, from, msg) {
		sys.print( this.linestamp( chat ) + '  <' + this.fg.white + from + this.fg.grey + '>' + this.fg.ltgrey + ' ' + msg + "\x1B[0m\r\n");
	},
	action: function(chat, from, msg) {
		sys.print( this.linestamp( chat ) + this.fg.ltgrey + ' * ' + this.fg.white + from + this.fg.ltgrey + ' ' + msg + "\x1B[0m\r\n");
	},
	join: function(chat, from) {
		sys.print( this.linestamp( chat ) + ' **' + this.fg.ltgrey + from + this.fg.grey + ' has joined.' + "\x1B[0m\r\n");
	},
	part: function(chat, from) {
		sys.print( this.linestamp( chat ) + ' **' + this.fg.ltgrey + from + this.fg.grey + ' has left.' + "\x1B[0m\r\n");
	},
	admin_remove: function( chat, by, name, num ) {
		sys.print( this.linestamp( chat ) + this.fg.dkblue + ' **privclass ' + this.fg.blue + name + this.fg.dkblue + ' has been removed by ' + this.fg.dkblue + by + this.fg.blue + ' (' + this.fg.blue + num + this.fg.dkblue + ( num == 1 ? ' member was' : ' members were' ) + ' affected)' + "\x1B[0m\r\n" );
	},
	admin_rename: function( chat, by, prev, name ) {
		sys.print( this.linestamp( chat ) + this.fg.dkblue + ' **privclass ' + this.fg.blue + prev + this.fg.dkblue + ' has been renamed to ' + this.fg.blue + name + this.fg.dkblue + ' by ' + this.fg.blue + by + this.fg.dkblue + '.' + "\x1B[0m\r\n" );
	},
	privchg: function( chat, who, by, pc ) {
		sys.print( this.linestamp( chat ) + this.fg.dkblue + '** ' + this.fg.blue + who + this.fg.dkblue + ' has been made a member of ' + this.fg.blue + pc + this.fg.dkblue + ' by ' + this.fg.blue + by + this.fg.dkblue + '.' + "\x1B[0m\r\n" );
	},
	admin_move: function( chat, by, prev, name, num ) {
		sys.print( this.linestamp( chat ) + this.fg.dkblue + ' **all members of ' + this.fg.blue + prev + this.fg.dkblue + ' have been made ' + this.fg.blue + name + this.fg.dkblue + ' by ' + this.fg.blue + by + this.fg.dkblue + ' (' + this.fg.blue + num + this.fg.dkblue + ( num == 1 ? ' member was' : ' members were' ) + ' affected)' + "\x1B[0m\r\n" );
	},
	admin_create: function( chat, by, name, privs ) {
		sys.print( this.linestamp( chat ) + this.fg.dkblue + ' **privclass ' + this.fg.blue + name + this.fg.dkblue + ' has been created by ' + this.fg.blue + by + this.fg.dkblue + ' with: ' + this.fg.blue + privs + "\x1B[0m\r\n" );
	},
	admin_update: function( chat, p, by, name, privs ) {
		if ( p == 'privclass' ) {
			sys.print( this.linestamp( chat ) + this.fg.dkblue + ' **privclass ' + this.fg.blue + name + this.fg.dkblue + ' has been updated by ' + this.fg.blue + by + this.fg.dkblue + ' with: ' + this.fg.blue + privs + "\x1B[0m\r\n" );
		} else {
			sys.print( this.linestamp( chat ) + this.fg.dkblue + ' **' + this.fg.blue + p + this.fg.dkblue + ' has been updated by ' + this.fg.blue + by + this.fg.dkblue + ' with: ' + this.fg.blue + privs + "\x1B[0m\r\n" );
		}
	},
	kick: function(chat, kickee, kicker, msg) {
		sys.print( this.linestamp( chat ) + this.fg.dkred + '***' + this.fg.red + kickee + this.fg.dkred + ' has been kicked by ' + this.fg.red + kicker + this.fg.dkred + ' *** ' + msg + "\x1B[0m\r\n");
	},
	kicked: function(chat, kicker, msg) {
		sys.print( this.linestamp( chat ) + this.fg.dkred + '***' + this.fg.red + 'You' + this.fg.dkred + ' have been kicked by ' + this.fg.red + kicker + this.fg.dkred + ' *** ' + msg + "\x1B[0m\r\n");
	},
	error: function(str) {
		sys.print(this.fg.red+" ! "+this.fg.dkred+this.parse(str)+"\x1B[0m\r\n");
	},
	info: function(str) {
		sys.print(this.fg.dkcyan+" # "+this.fg.dkgreen+this.parse(str)+"\x1B[0m\r\n");
	},
	parse: function(str) {
		str = str.toString().replace( "[[@reset]]", this.reset );
		for (var kFg in this.fg){
			str = str.replace( "[[@fg;"+kFg+"]]", this.fg[kFg] );
		}
		for (var kBg in this.bg){
			str = str.replace( "[[@bg;"+kBg+"]]", this.bg[kBg] );
		}
		for (var kFx in this.fx){
			str = str.replace( "[[@fx;"+kFx+"]]", this.bg[kFx] );
		}
		return str;
	},
};