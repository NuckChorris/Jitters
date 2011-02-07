var spawn = require('child_process').spawn;
var Script = process.binding('evals').Script;
var http = require('http');
var net = require('net');
var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var utils = require('./utils.js');
var c = require('./cli.js');

function isArray(obj) {
   if (obj.constructor.toString().indexOf("Array") == -1)
      return false;
   else
      return true;
}

exports.dAmnJS = function ( username, password, etc ) {
	this.username = username || '';
	this.password = password || '';
	this.authtoken = etc.authtoken || null;
	this.version = 0.2;
	this.server = {
		chat: {
			host: 'chat.deviantart.com',
			version: '0.3',
			port: 3900
		},
		login: {
			transport: 'https://',
			host: 'www.deviantart.com',
			file: '/users/login',
			port: 443
		}
	};
	this.client = 'dAmnJS';
	this.agent = 'dAmnJS/0.2';
	this.owner = 'nuckchorris0';
	this.trigger = '!';
	if (etc){
		for (var key in etc){
			this[key] = etc[key];
		}
	}
	this.buffer = '';
	this.chats = [];
	this.events = new EventEmitter();
	this.disconnects = 0;
	this.tablumps = [
		{
			"":				/&abbr\tcolors\:[0-9A-F]{6}\:[0-9A-F]{6}\t&\/abbr\t/g,
			"<b>":			/&b\t/g,
			"</b>":			/&\/b\t/g,
			"<i>":			/&i\t/g,
			"</i>":			/&\/i\t/g,
			"<u>":			/&u\t/g,
			"</u>":			/&\/u\t/g,
			"<s>":			/&s\t/g,
			"</s>":			/&\/s\t/g,
			"<sup>":		/&sup\t/g,
			"</sup>":		/&\/sup\t/g,
			"<sub>":		/&sub\t/g,
			"</sub>":		/&\/sub\t/g,
			"<code>":		/&code\t/g,
			"</code>":		/&\/code\t/g,
			"<br />":		/&br\t/g,
			"<ul>":			/&ul\t/g,
			"</ul>":		/&\/ul\t/g,
			"<ol>":			/&ol\t/g,
			"</ol>":		/&\/ol\t/g,
			"<li>":			/&li\t/g,
			"</li>":		/&\/li\t/g,
			"<bcode>":		/&bcode\t/g,
			"</bcode>":		/&\/bcode\t/g,
			"</a>":			/&\/a\t/g,
			"</acrnym>":	/&\/acro\t/g,
			"</abbr>":		/&\/abbr\t/g,
			"<p>":			/&p\t/g,
			"</p>":			/&\/p\t/g,
		},
		{
			"&emote\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t":						"$1",
			"&a\t([^\t]+)\t([^\t]*)\t":															"<a href=\"$1\" title=\"$2\">",
			"&link\t([^\t]+)\t&\t":																"$1",
			"&link\t([^\t]+)\t([^\t]+)\t&\t":													"$1 ($2)",
			"&dev\t[^\t]?\t([^\t]+)\t":															":dev$1:",
			"&avatar\t([^\t]+)\t([^\t]+)\t":													":icon$1:",
			"&thumb\t([0-9]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+)\t":	":thumb$1:",
			"&img\t([^\t]+)\t([^\t]*)\t([^\t]*)\t":												"<img src=\"$1\" alt=\"$2\" title=\"$3\" />",
			"&iframe\t([^\t]+)\t([0-9%]*)\t([0-9%]*)\t&\/iframe\t":								"<iframe src=\"$1\" width=\"$2\" height=\"$3\" />",
			"&acro\t([^\t]+)\t":																"<acronym title=\"$1\">",
			"&abbr\t([^\t]+)\t":																"<abbr title=\"$1\">",
		},
	];
	this.getCookie = function ( username, password ) {
		if ( process.version == 'v0.3.1' ) {
			var login = http.createClient( this.server.login.port, this.server.login.host, true );
			postdata  = 'ref=' + encodeURI( this.server.login.transport + this.server.login.host + this.server.login.file );
			postdata += '&username=' + encodeURI( username );
			postdata += '&password=' + encodeURI( password );
			postdata += '&reusetoken=1';
			
			var headers = ({});
			headers['Host'] = this.server.login.host;
			headers['User-Agent'] = this.agent;
			headers['Accept'] = "text/html";
			headers['Cookie'] = "skipintro=1";
			headers['Content-Type'] = "application/x-www-form-urlencoded";
			headers['Content-Length'] = postdata.length;

			var request = login.request('POST', this.server.login.file, headers);
			request.write(postdata);
			request.end();
			request.on('response', (function( response ) {
				this.cookie = decodeURI( response.headers["set-cookie"] );
				this.authtoken = utils.unserialize( unescape( this.cookie.slice( 9, this.cookie.indexOf(";") ) ) ).authtoken;
				this.events.emit( 'sys_authtoken', this.authtoken );
				c.info( 'Got Authtoken!' );
			}).bind(this));
		} else {
			postdata  = 'ref=' + encodeURI( this.server.login.transport + this.server.login.host + this.server.login.file );
			postdata += '&username=' + encodeURI( username );
			postdata += '&password=' + encodeURI( password );
			postdata += '&reusetoken=1';
			
			var headers = ({});
			headers['Host']				= this.server.login.host;
			headers['User-Agent']		= this.agent;
			headers['Accept']			= "text/html";
			headers['Cookie']			= "skipintro=1";
			headers['Content-Type']		= "application/x-www-form-urlencoded";
			headers['Content-Length']	= postdata.length;
			
			var options = ({});
			options.port	= this.server.login.port;
			options.host	= this.server.login.host;
			options.method	= 'POST';
			options.headers	= headers;
		
			var request = require('https').request( options, (function( response ) {
				this.cookie = decodeURI( response.headers["set-cookie"] );
				this.authtoken = utils.unserialize( unescape( this.cookie.slice( 9, this.cookie.indexOf(";") ) ) ).authtoken;
				this.events.emit( 'sys_authtoken', this.authtoken );
				c.info( 'Got Authtoken!' );
			}).bind(this) );
			request.write(postdata);
			request.end();
		}
		return this;
	};
	this.connect = function ( ) {
		c.info( 'Connecting to dAmnServer.' );
		this.socket = net.createConnection( this.server.chat.port, this.server.chat.host );
		var onconnect = function(){
			data  = 'dAmnClient ' + this.server.chat.version + "\n";
			data += 'agent=' + this.agent + "\n";
			data += 'bot=' + this.client + "\n";
			data += 'owner=' + this.owner + "\n";
			data += 'trigger=' + this.trigger + "\n";
			data += 'creator=nuckchorris0/peter.lejeck@gmail.com'+"\n\0";
			this.socket.write( data );
			this.events.emit( 'sys_connected', this );
		};
		this.socket.setEncoding( 'utf8' );
		this.socket.on( 'data', this.sockRecv.bind(this) );
		this.socket.on( 'connect', onconnect.bind(this) );
		this.socket.on( 'error', (function( ){
			c.error('Could not open connection with ' + this.server.chat.host + '.');
		}).bind(this));
		return this;
	};
	this.login = function ( ) {
		c.info( 'Logging in to dAmnServer.' );
		this.socket.write( 'login ' + this.username + '\npk=' + this.authtoken + "\n\0" );
		this.events.once( 'login', ( function( e ) {
			if ( e == 'ok' ) {
				this.events.emit( 'loggedin' );
			} else {
				this.disconnect();
				this.events.emit( 'authfail' );
			}
		} ).bind( this ) );
		return this;
	};
	this.deformChat = function (chat, discard) {
		if ( chat ) {
			if ( isArray( chat ) ) {
				var out = [];
				for ( var i = 0, l = chat.length; i < l; i++ ) {
					out.push( arguments.callee( chat[i], discard ) );
				}
			} else {
				var discard = discard || this.username;
				var parsed = /(chat|pchat|#|@|)\:?(.*)/g.exec( chat );
				var out = "";
				switch( parsed[1] ) {
					case 'chat':
					case '#':
					case '':
						out = '#' + parsed[2];
						break;
					case 'pchat':
						var pchatters = parsed[2].split( ':' ).sort();
						if ( pchatters[1].toLowerCase() == discard.toLowerCase() ){
							out = '@' + pchatters[2];
						} else {
							out = '@' + pchatters[1];
						}
						break;
					case '@':
						out = '@' + parsed[2];
						break;
					default:
						out = chat;
				}
			}
			return out;
		} else {
			return false;
		}
	};
	this.formatChat = function ( chat, me ) {
		if ( chat ) {
			if ( isArray( chat ) ) {
				var out = [];
				for ( var i = 0, l = chat.length; i < l; i++ ) {
					out.push( arguments.callee( chat[i], me ) );
				}
			} else {
				var me = me || this.username;
				var parsed = /(chat|pchat|#|@|)\:?(.*)/g.exec( chat );
				var out = '';
				switch( parsed[1] ) {
					case 'pchat':
						var pchatters = parsed[2].split( ':' ).sort();
						out = 'pchat:' + pchatters[0] + ':' + pchatters[1];
						break;
					case '@':
						var pchatters = [ parsed[2], me ].sort();
						out = 'pchat:' + pchatters[0] + ':' + pchatters[1];
						break;
					case 'chat':
					case '#':
					default:
						out = 'chat:' + parsed[2];
						break;
				}
			}
			return out;
		} else {
			return false;
		}
	};
	this.join = function ( chan ) {
		this.socket.write( 'join ' + chan + "\n\0" );
		c.info( 'Joined [[@fg;dkcyan]]' + this.deformChat(chan) + '[[@fg;dkgreen]].' );
		return this;
	};
	this.part = function ( chan ) {
		if ( chan.toLowerCase() == 'chat:datashare' ) return false;
		this.socket.write( 'part ' + chan + "\n\0" );
		c.info( 'Left [[@fg;dkcyan]]' + this.deformChat(chan) + '[[@fg;dkgreen]].' );
		return this;
	};
	this.say = function( chan, msg, datashare ) {
		if ( chan.toLowerCase() == 'console' );
		if ( !msg || !chan || chan.toLowerCase() == 'chat:irpg' || ( chan.toLowerCase() == 'chat:datashare' && datashare !== true ) ) return false;
		if ( typeof ( msg ) == "array" ) {
			msg = msg.toString();
		} else if ( typeof ( msg ) !== "string" ) {
			msg = JSON.stringify( msg );
		}
		var type = 'msg';
		if ( msg.indexOf( '/' ) == 0 ) {
			type = msg.slice( 1, msg.indexOf(' ') );
			msg =  msg.slice( type.length + 2 );
		}
		this.socket.write( 'send ' + chan + "\n\n" + type + " main\n\n" + msg + "\n\0");
		return this;
	};
	this.action = function ( chan, msg, datashare ) {
		if ( !msg || !chan || chan.toLowerCase() == 'chat:irpg' || ( chan.toLowerCase() == 'chat:datashare' && datashare !== true ) ) return false;
		this.say( chan, '/me ' + msg, datashare || false );
		return this;
	};
	this.npmsg = function ( chan, msg, datashare ) {
		if ( !msg || !chan || chan.toLowerCase() == 'chat:irpg' || ( chan.toLowerCase() == 'chat:datashare' && datashare !== true ) ) return false;
		this.say( chan, '/npmsg ' + msg, datashare || false );
		return this;
	};
	this.promote = function ( chan, user, pc ) {
		if ( !chan ) return false;
		var pc = pc || '';
		var user = user || this.username;
		this.socket.write( 'send ' + chan + "\n\n" + 'promote ' + user + "\n\n" + pc + "\n\0" );
		return this;
	};
	this.demote = function ( chan, user, pc ) {
		if ( !chan ) return false;
		var pc = pc || '';
		var user = user || this.username;
		this.socket.write( 'send ' + chan + "\n\n" + 'promote ' + user + "\n\n" + pc + "\n\0" );
		return this;
	};
	this.kick = function ( chan, user, reason ) {
		if ( !chan || !user ) return false;
		var reason = "\n" + reason + "\n" || '';
		this.socket.write( 'kick ' + chan + "\n" + 'u=' + user + "\n" + reason + "\n\0");
		return this;
	};
	this.ban = function ( chan, user ) {
		if ( !chan || !user ) return false;
		this.socket.write( 'send ' + chan + "\n\n" + 'ban ' + user + "\n\0");
		return this;
	};
	this.unban = function ( chan, user ) {
		if ( !chan || !user ) return false;
		this.socket.write( 'send ' + chan + "\n\n" + 'unban ' + user + "\n\0");
		return this;
	};
	this.get = function ( chan, property ) {
		if ( !chan || !property ) return false;
		this.socket.write( 'get ' + chan + "\n" + 'p=' + property + "\n\0");
		return this;
	};
	this.set = function ( chan, property, value ) {
		if ( !chan || !property || !value ) return false;
		this.socket.write( 'set ' + chan + "\n" + 'p=' + property + "\n\n" + value + "\n\0");
		return this;
	};
	this.admin = function ( chan, command ) {
		if ( !chan || !command ) return false;
		this.socket.write( 'send ' + chan + "\n\n" + 'admin' + "\n\n" + command + "\n\0");
		return this;
	};
	this.disconnect = function ( ) {
		this.socket.write( 'disconnect' + "\n\0");
	};
	this.sockRecv = function( data ) {
		if ( data == "ping\n\0" ) {
			this.socket.write( "pong\n\0" );
		}
		if( data !== false && data !== '' ) {
			this.buffer += data;
			var parts = this.buffer.split( "\0" );
			this.buffer = ( parts[parts.length - 1] !== '' ) ? parts.pop() : '';
		} else {
			var parts = ["disconnect\ne=socket closed\n\n"];
		}
 		for( var packet in parts ) {
			if ( parts[ packet ] !== '' ) {
				var eventData = this.eventArgs( parts[ packet ] );
				var p = eventData.params;
				p.unshift( eventData.event );
				this.events.emit.apply( this.events, p );
			}
		}
	};
	this.parseTablumps = function (msg){
		if (msg){
			for(var tablumpA in this.tablumps[0]){
				msg = msg.replace(this.tablumps[0][tablumpA],tablumpA);
			}
			for(var tablumpB in this.tablumps[1]){
				msg = msg.replace(new RegExp(tablumpB,"g"), this.tablumps[1][tablumpB]);
			}
		}
		return msg;
	}
	this.parsePacket = function (rpkt, depth) {
		try {
			rpkt = rpkt.toString();
			depth = depth || 0;
			var i;
			var ppkt = {
				cmd: null,
				param: null,
				args: {},
				body: null,
				sub: [],
				depth: depth,
				raw: rpkt
			};
			var parts = rpkt.split("\n\n");
			var head = parts.shift().split('\n');
			var cmd  = head.shift().split(' ');
			ppkt.cmd = cmd.shift();
			ppkt.param = cmd.join(' ');
			
			for (i in head) {
				if (head.hasOwnProperty(i)) {
					var val = head[i].split('=');
					ppkt.args[ val.shift() ] = val.join('=');
				}
			}
			ppkt.body = parts.join('\n\n') || null;
			if (parts.length >= 1) {
				i = parts.length - 1;
				if (i === 1) {
					ppkt.sub.push( arguments.callee(ppkt.body, depth + 1) );
				} else {
					for (i; i >= 0; i--) { ppkt.sub.push( arguments.callee(parts[i], depth + 1) ); }
				}
			}
			
			return ppkt;
		} catch (e) {
			c.error( 'Died in Packet Parser' );
		}
	}
	this.isChannel = function ( chan ) {
		for( var ns in this.chats ) {
			if ( chan.toLowerCase() == ns.toLowerCase() ) return chan;
		}
		return false;
	};
	this.eventArgs = function ( packet ) {
		packet = this.parsePacket( this.parseTablumps( packet ) );
		var data = {
			event:  'packet',
			params: [],
			packet: packet,
		};
		data.params.push( packet.param );
		if ( packet.param.slice( 0, 6 ) == 'login:' ) {
			data.event = 'whois';
			data.params[0] = packet.raw;
			return data;
		}
		switch( packet.cmd ) {
			case 'dAmnServer':
				data.event = 'connected';
				break;
			case 'login':
				data.event     = 'login';
				data.params[0] = packet.args.e;
				break;
			case 'join':
			case 'part':
				data.event     = packet.cmd;
				data.params[1] = packet.args.e;
				if ( 'r' in packet.args ) data.params[2] = packet.args.r;
				break;
			case 'property':
				data.event     = 'property';
				data.params[1] = packet.args.p;
				data.params[2] = packet.raw;
				break;
			case 'recv':
				data.event = 'recv.' + packet.sub[0].cmd;
				switch ( packet.sub[0].cmd ) {
					case 'msg':
					case 'action':
						data.params[1] = packet.sub[0].args.from;
						data.params[2] = packet.sub[0].body;
						break;
					case 'join':
					case 'part':
						data.params[1] = packet.sub[0].param;
						if ( 'r' in packet.sub[0].args )   data.params[2] = packet.sub[0].args.r;
						if ( packet.sub[0].cmd == 'join' ) data.params[2] = packet.sub[0].body;
						break;
					case 'privchg':
					case 'kicked':
						data.params[1] = packet.sub[0].param;
						data.params[2] = packet.sub[0].args.by;
						if ( packet.sub[0].cmd == 'privchg' ) data.params[3] = packet.sub[0].args.pc;
						if ( packet.sub[0].body ) data.params[3] = packet.sub[0].body;
						break;
					case 'admin':
						data.event += '.' + packet.sub[0].param;
						data.params = [ packet.param, packet.sub[0].args.p ];
						if ( 'by' in packet.sub[0].args ) data.params[2] = packet.sub[0].args.by;
						switch ( packet.sub[0].param ) {
							case 'create':
							case 'update':
								data.params[3] = packet.sub[0].args.name;
								data.params[4] = packet.sub[0].args.privs;
								break;
							case 'rename':
							case 'move':
								data.params[3] = packet.sub[0].args.prev;
								data.params[4] = packet.sub[0].args.name;
								if ( 'n' in packet.sub[0].args ) data.params[5] = packet.sub[0].args.n;
								break;
							case 'remove':
								data.params[3] = packet.sub[0].args.name;
								data.params[4] = packet.sub[0].args.n;
								break;
							case 'show':
								data.params[2] = packet.sub[0].body;
								break;
							case 'privclass':
								data.params[2] = packet.sub[0].args.e;
								if ( packet.sub[0].body ) data.params[3] = packet.sub[0].body;
								break;
						}
						break;
				}
				break;
			case 'kicked':
				data.event     = 'kicked';
				data.params[1] = packet.args.by;
				if ( packet.body ) data.params[2] = packet.body;
				break;
			case 'ping':
				data.event     = 'ping';
				data.params[0] = false;
				break;
			case 'disconnect':
				data.event     = 'disconnect';
				data.params[0] = packet.args.e;
				break;
			case 'send':
			case 'kick':
			case 'get':
			case 'set':
				data.event      = packet.cmd;
				data.params[1]  = ( ( 'u' in packet.args ) ? packet.args.u : ( packet.args.p || false ) );
				id = data.params[1] == false ? 1 : 2;
				data.params[id] = packet.args.e;
				break;
			case 'kill':
				data.event     = 'kill';
				data.params[1] = packet.args.e;
				data.params[2] = packet.cmd + ' ' + packet.param;
			case '':
				break;
			default:
				data.event     = 'unknown';
				data.params[0] = packet;
				break;
		}
		return data;
	};
	if ( this.authtoken ) {
		c.info( 'Attempting to use stored authtoken.' );
		this.events.once( 'login', (function( e ){
			if ( e == 'authentication failed' ) {
				c.info( 'Stored authtoken refused, getting new authtoken...' );
				this.events.once( 'sys_authtoken', this.connect.bind(this) );
				this.events.once( 'sys_connected', this.login.bind(this) );
				this.getCookie( this.username, this.password );
			} else {
				this.events.emit( 'sys_authtoken', this.authtoken );
			}
		}).bind(this));
		this.connect.call( this );
	} else {
		this.getCookie( this.username, this.password );
		this.events.once( 'sys_authtoken', this.connect.bind(this) );
	}
	this.events.once( 'sys_connected', this.login.bind(this) );
};
