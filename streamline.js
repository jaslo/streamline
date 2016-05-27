var stream = require("stream"),
	Q = require("q"),
	util = require('util');

// this is a writeable stream
// to use
// open readable stream and supply to constructor
// readstrm = getreadstream(...)
// sl = new streamLine(readstrm, optional delimeter string!);
// sl.readLine().then(function(line) { process line })
//

function streamLine(instream, delimiter) {
	var self = this;
	var delimit = '\n';
	if (delimiter) delimit = delimiter;

	var gotEnd = false;

	var bufqueue = [];
	var blockdfr = null;
	var extra = '';

	instream.on('end',function() {
//		process.stdout.write('/');
		if (extra.length) {
			if (bufqueue.length) {
				var lastbuf = bufqueue[bufqueue.length-1];
				lastbuf.push(extra);
			}
			else bufqueue.push([extra]);
		}
		extra = ''; // doesn't really matter!
		if (blockdfr) {
			resolveLine(blockdfr);
			blockdfr = null;
		}
		gotEnd = true;
	});

	instream.on('data', function(chunk) {
		// chunk is a buffer, look for a line end
//		process.stdout.write('>');
		var str = chunk.toString();
		var lines = str.split(delimit);
		lines[0] = extra + lines[0];
		extra = '';
		bufqueue.push(lines);
		var lastbuf = bufqueue[bufqueue.length-1];
		extra =  lastbuf[lastbuf.length-1];
		lastbuf.length = lastbuf.length-1;

		if (blockdfr) {
			resolveLine(blockdfr);
			blockdfr = null;
		}
	});

	function resolveLine(dfr) {
		if ((bufqueue.length == 0) || (bufqueue[0].length == 0)) {
			dfr.resolve(null);
			bufqueue = [];
			return;
		}
		var ret = bufqueue[0][0];
		if (bufqueue[0].length == 1) {
			bufqueue.splice(0,1);
		}
		else bufqueue[0].splice(0,1);
		// if the delimiter is \n, and \r is right before that, delete it.
		if (ret.length > 0 && (delimit == '\n') && ret[ret.length-1] == '\r') {
			ret = ret.substr(0,ret.length-1);
		}
		dfr.resolve(ret);
	}

	this.readLine = function() {
		var dfr = Q.defer();
		if (blockdfr) {
			Log.error("blockdfr is already set at readLine!!!");
			throw new Error("blockdfr already set at readLine!!!");
		}
		if (bufqueue.length || gotEnd) {
/*
			if (blockdfr) {
				resolveLine(blockdfr);
				blockdfr = null;
				process.stdout.write('<');
			}
*/
			resolveLine(dfr);
		}
		else {
//			process.stdout.write("|"); //  + extra);
			blockdfr = dfr;
		}
		return dfr.promise;
	}
}

module.exports = streamLine;

