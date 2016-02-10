// We are going to read the official morse code from the command line.
// However, to speed up troubleshooting efforts, I will read these
// inputs from a file using the line-by-line module from npm

// process.argv is an array that stores all command line arguments (variables)
var LineByLineReader = require('line-by-line'),
	// lr = new LineByLineReader('../data/removeOnceSample.txt');
	lr = new LineByLineReader('../data/removeOnceTest.txt');
	// lr = new LineByLineReader('../data/removeTwiceSample.txt');
	// lr = new LineByLineReader('../data/removeTwiceTest.txt');
var _ = require('underscore');
var my_http = require("http");
var answer = 42;
var originalmsg;
var firstcodemsg;
var secondcodemsg;
var firstpossibility = [];
var lastpossibility = [];
var possibilities = [];
var allpossibilities = [];
var sequences = [];
var count = 0;
var shortfirstcode;
var divisors = [];
var newpossibilities = [];
var dirtydot = [];
var dirtydash = [];



///////////////////////////////////////////////////////////////////
// 							functions							 //
///////////////////////////////////////////////////////////////////

// recursively calculate all permutations (messy and time consuming)
function getPermutation(array, prefix) {
    prefix = prefix || '';
    if (!array.length) {
        return prefix;
    }

    var result = array[0].reduce(function (result, value) {
        return result.concat(getPermutation(array.slice(1), prefix + value));
    }, []);
    return result;
}

// replace character with a ' '
String.prototype.removeit=function(index) {
    return this.substring(0, index) + " " + this.substring(index + 1);
}

// calculate a specific computation

// Pre-calculate divisors
function calculatedivisors(possibilities) {
	var divisors = [];
	for (var i = possibilities.length - 1; i >= 0; i--) {
	   divisors[i] = divisors[i + 1] ? divisors[i + 1] * possibilities[i + 1].length : 1;	
	}
	return divisors;
}

function getpermutation(n) {
   var result = [], curArray;

   for (var i = 0; i < possibilities.length; i++) {
      curArray = possibilities[i];
      result.push(curArray[Math.floor(n / divisors[i]) % curArray.length]);
   }

   return result;
}

function getnext(possibilities, start, end) {
	var unique = start.slice();
	var next = [];
	for (var i = possibilities.length; i >= 0; i--) {
		for (var j = start[i]; j <= end[i]; j++) {
			
			if (i == 0 && start[i] == 0) {
				unique.push(possibilities[i][j]);
				next.push(possibilities[i][j]);
				break;
			}	
			else if (!_.contains(unique,possibilities[i][j]) && possibilities[i][j] > _.last(next))  {
				unique.push(possibilities[i][j]);
				next.push(possibilities[i][j]);
			}
			else {
				continue;
			}
		}
	}
	return next;
}


///////////////////////////////////////////////////////////////////

lr.on('error', function (err) {
	// 'err' contains error object
	console.log(err);
});

lr.on('line', function (line) {
	// pause emitting of lines...
	lr.pause();
	// ...do your asynchronous line processing..
	setTimeout(function () {
		if (count == 0) {
			originalmsg = line;
		}

		if (count == 1) {
			firstcodemsg = line;
		}

		if (count == 2) {
			secondcodemsg = line;
		}

		count++;
		
		// ...and continue emitting lines.
		lr.resume();
	}, 100);
});

lr.on('end', function () {
	// All lines are read, let's solve the problem.

	// variables necessary to solution
	var start = [];
	var end = [];
	var temp = [];

	//	find first possibility  -> place indexes of each character in array
	var searchindex = 0;
	for (var i = 0; i < firstcodemsg.length; i++) {
		if (firstcodemsg[i] == '_') { /* do nothing */ }
		else {
			// console.log("searchindex: " + searchindex + "\n" + 
			// 	"firstcodemsg[i]: " + firstcodemsg[i] + "\n" + 
			// 	"i: " + i);
			// console.log(_.indexOf(originalmsg, firstcodemsg[i], searchindex));
			firstpossibility.push(_.indexOf(originalmsg, firstcodemsg[i], searchindex));
			searchindex = _.indexOf(originalmsg, firstcodemsg[i], searchindex) + 1;
		}
	}

	//	find last possibility -> place indexes of each character in array
	searchindex = originalmsg.length - 1;
	for (var i = firstcodemsg.length - 1; i >= 0 ; i--) {
		if (firstcodemsg[i] == '_') { /* do nothing */ } 
		else {
			lastpossibility.push(_.lastIndexOf(originalmsg, firstcodemsg[i], searchindex));
			searchindex = _.lastIndexOf(originalmsg, firstcodemsg[i], searchindex) - 1;
		}
	}
	lastpossibility = lastpossibility.reverse();

	// check length of firstpossibility against firstcodemsg
	if (firstpossibility.length != firstcodemsg.length) {
		shortfirstcode = firstcodemsg.replace(/_/g, "");
		// console.log("sanity");
	}
	else {
		shortfirstcode = firstcodemsg.split(0);
	}
	// console.log(shortfirstcode);


	//	use start and finish to calculate all "in between" possible indexes
	//	 -> push those indexes into a 2D array (possibilities)
	for (var i = 0; i < firstpossibility.length; i++ ) {
		start = firstpossibility[i];
		end = lastpossibility[i];
		for (; start <= end; start++ ) {
			if (originalmsg[start] == shortfirstcode[i]) {
				temp.push(start);
				// console.log("PUSHED!");
			}
		}
		possibilities[i] = temp;
		temp = [];
	}

	// simplify the number of possibilities
	// stars next to stars do not change the output, they only add to # of computations
	// same for dashes next to dashes
	// for (var i = 0; i < possibilities.length; i++) {
	// 	for (var j = 0; j < possibilities[i].length - 1; j++) {
	// 		if (possibilities[i][j] == possibilities[i][j+1] - 1) {
	// 			// using delete will leave a hole
	// 			delete possibilities[i][j];
	// 		}
	// 	}
	// }

	// remove holes with filter, push results into (newpossibilities) array
	// for (var i = 0; i < possibilities.length; i++) {
	// 	newpossibilities.push(possibilities[i].filter(function(x) {return Number(x)}));	
	// }
	
	console.log(possibilities);

	// variables necessary to solution
	start = firstpossibility.slice(0);
	end = [];
	temp = [];

	console.log(firstpossibility);
	console.log(start);
	
	// initialize start to be an array of 0s the length of possibilities
	// start = new Array(newpossibilities.length).fill(0);

	// initialize end to be an array with the length of each row ofpossibilities
	// for (i = 0; i < newpossibilities.length; i++) {
		// end.push(newpossibilities[i].length - 1);
	// }

	// console.log(end);

	// generate all possibilities

	do {
		// console.log('sanity');
	} while(false);


	// while (!_.isEqual(start, end)) {
		start = getnext(possibilities, firstpossibility, lastpossibility);
		// for (i = 0; i < possibilities.length; i++) {
		// 	for (j = 0; j < possibilities[i].length; j++) {
		// 		// is row dot or dash possibility?

		// 		// is position on dirty list?

		// 		// if not, push to temp, then add to dirty list
		// 		if (_.contains(dirtydot, possibilities[i][j])) {
		// 			continue;
		// 		}
		// 	}
		// 	// when 
		// }
	// }


	// calculate # of possible computations for shits ang giggles
	/////////////////////////////////////////////////////////////
	var total = 1;
	for (var i = 0; i < newpossibilities.length; i++){
		total *= newpossibilities[i].length;
	}
	console.log("TOTAL COMPUTATIONS: " + total);
	console.log("Time: " + Math.floor(total/151000/6/60) + " hours")
	/////////////////////////////////////////////////////////////

	divisors = calculatedivisors(possibilities);


	//	traverse the array using every combination to calculate (allpossibilities)
	// allpossibilities = getPermutation(possibilities);

	// generate sequences
	var copy = [];
	for (var i = 0; i < allpossibilities.length; i++) {
		
		copy = originalmsg.slice(0);
		
		for (var j = 0; j < firstcodemsg.length; j++) {
			// replace characters marked for removal with ' '						
			copy = copy.removeit(Number(allpossibilities[i][j]));
		}

		// sequences.push(copy.split());
		sequences.push(copy);
	}

	// remove spaces from sequences
	var temp;
	for (var i = 0; i < sequences.length; i++) {
		sequences[i] = sequences[i].replace(/ /g, "");
	}

	// find unique versions of sequences
	answer = _.uniq(sequences).length;
		
	// OUTPUT 
	// console.log("first possibility: " + firstpossibility);			// check
	// console.log("last possibility:  " + lastpossibility); 			// check
	// console.log("possibilities:    \n ");				// check
	// console.log(newpossibilities);				// check

	// console.log("allpossibilities:  " + allpossibilities);			// check
	// console.log("sequences:         " + sequences);					// takes forever, but works
	// console.log("unique sequences:  " + _.uniq(sequences));			// check
	console.log("I'm done running now.  The answer is: " + answer + ".");
});