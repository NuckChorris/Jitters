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