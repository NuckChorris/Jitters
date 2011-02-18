exports = function( dir, isDir ) {
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