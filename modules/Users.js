this.info.name = 'Users';
this.info.version = 1;
this.info.about = 'User management for Jitters';
this.info.status = true;
this.info.author = 'nuckchorris0';

this.init = function(){
	var users = new Command( "users", 99 );
	users.bind( this.c_users );
	users.help( 'Manage users on the bot.' );
};

this.c_users = function( chat, from, msg, args, argsE ) {
	switch (args[1].toLowerCase()){
		case "list":
			var userlist = this.Users.settings.pcs;
			var out = "<abbr title=\"-away\"></abbr><u><b>User list:</b></u><sub><br/>";
			var users = [];
			var keys = [];
			for (var key in userlist){
				keys.push(key);
			}
			keys.sort( function ( a, b ) {
				if ( userlist[ a ].order > userlist[ b ].order )
					return -1;
				if ( userlist[ a ].order < userlist[ b ].order )
					return 1;
				return 0;
			} );
			for (var key in keys){
				var val = userlist[keys[key]];
				users.push([keys[key], val]);
			}
			for( var i = 0; i < users.length; i++ ){
				var num = users[i][1].order;
				var pc = users[i][1].name;
				out += "<b>"+pc+"</b> ("+num+"): ";
				out += ( objLen( users[i][1].users ) == 0 ) ? " <i>None</i>" : "";
				var ii = 0;
				var members = [];
				for( var key in users[i][1].users ) {
					var user = users[i][1].users[key];
					ii++;
					members.push( ":dev" + user + ":" );
				}
				out += members.join(" <b>&middot;</b> ") + "<br />";
			}
			this.dAmn.say( chat, out.slice(0,out.length-6) + "</sub>" );
			break;
		case "add":
		case "new":
		case "change":
			var added = this.Users.setUserPc( args[2], args[3] );
			if ( added == true )
				this.dAmn.say( chat, "User " + args[2] + " added to privclass " + args[3] );
			else
				this.dAmn.say( chat, "Sorry, it failed. :bucktooth:" );
			break;
		case "del":
		case "rem":
		case "delete":
		case "remove":
			var baleeted = Users.resetPc( args[2] );
			if ( baleeted == true )
				this.dAmn.say( chat, "User " + args[2] + " has been removed from user list." );
			else
				this.dAmn.say( chat, "Sorry, it failed. :bucktooth:" );
			break;
		case "pc":
		case "priv":
		case "class":
		case "privclass":
			switch( args[2].toLowerCase() ) {
				case "rename":
					c.log("Rename Privclass");
					break;
				case "add":
				case "new":
				case "create":
					c.log("Add Privclass");
					break;
				case "del":
				case "rem":
				case "delete":
				case "remove":
					c.log("Remove Privclass");
					break;
				case "update":
				case "change":
				case "modify":
					c.log("Update Privclass");
					break;
			}
			break;
	}
};

/**
 * Utility functions
 */
 
function objLen(obj) {
  var len = obj.length ? --obj.length : 0;
	for (var k in obj){
		len++;
	}
  return len;
}
function sortAssoc(input,reverse){
	var out = [];
	var keys = [];
	for (var key in input){
		keys.push(key);
	}
	keys.sort(function(){
		return Number(arguments[0]) < Number(arguments[1]);
	});
	if (reverse !== true){
		keys = keys.reverse();
	}
	for (var key in keys){
		var val = input[keys[key]];

		out.push([keys[key], val]);
	}
	return out;
}
