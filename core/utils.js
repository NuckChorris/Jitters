exports.unserialize = function ( str ) {
	this.parseItem = function ( item ) {
		var splat = item.split(":");
		switch ( splat[0] ) {
			case 's':
				return splat[2].slice( 1, Number( splat[1] ) + 1 );
			case 'i':
			case 'd':
				return Number( splat[1] );
			case 'b':
				return ( splat[1] == 1 );
			case 'N':
				return null;
			default:
				return splat;
		}
	}
	this.splut = str.slice(str.indexOf("{")+1,str.lastIndexOf("}")-1).split(";");
	this.lastKey = "";
	this.out = {};
	for(var i = 0; i < this.splut.length; i++){
		if ( i % 2 == 0 ) {
			this.lastKey = this.parseItem( this.splut[i] );
		} else {
			this.out[this.lastKey] = this.parseItem( this.splut[i] );
		}
	}
	return this.out;
}

function toArray(enum) {
    return Array.prototype.slice.call(enum);
}

Function.prototype.curry = function() {
    if (arguments.length<1) {
        return this; //nothing to curry with - return function
    }
    var __method = this;
    var args = toArray(arguments);
    return function() {
        return __method.apply(this, args.concat(toArray(arguments)));
    }
}
exports.oc = oc = function(a) {
	var o = {};
	for(var i=0;i<a.length;i++) {
		o[a[i]]='';
	}
	return o;
}
String.prototype.repeat = function(n) {
	var s = "", t = this.toString();
	while (--n >= 0) {
		s += t
	}
	return s;
}
String.prototype.trim = function () {
	return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
};