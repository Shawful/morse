// We are going to read the official morse code from the command line.
// However, to speed up troubleshooting efforts, I will read these
// inputs from a file using the line-by-line module from npm

// process.argv is an array that stores all command line arguments (variables)
var LineByLineReader = require('line-by-line'),
	lr = new LineByLineReader('../data/removeOnceSample.txt');
	// lr = new LineByLineReader('../data/eliminationTest.txt');
	// lr = new LineByLineReader('../data/removeOnceTest.txt');
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



// Returns an array of characters with '_' removed
function removeUnderscores(withUnderscores) {
	var noUnderscores = [];
	for (var i = 0; i < withUnderscores.length; i++) {
		if (withUnderscores[i] != '_') {
			noUnderscores.push(withUnderscores[i]);
		}
	}
	return noUnderscores;
}

function greaterThanCurrentRowValue() {}

function endOfRowCheck(current, end) {
	if (current == end) {
		return true;
	}
	else {
		return false;
	}
}

function findNextCombination(currentCombination, possibilities) {
	// start current row under consideration at the end of the possibilities
	var currentRow = possibilities.length - 1;

	// call function to check currentRow for the next value which is greater than
	// value at currentCombination's row value
	// check if current row's value is at end of row

	console.log(possibilities[currentRow])

	console.log(currentCombination[currentRow])

	console.log(currentRow);

	console.log(possibilities[currentRow][currentCombination[currentRow]])

	// push current row up for every end of the row
	for (; currentRow >= 0; currentRow--) {
		if (endOfRowCheck(currentCombination[currentRow], possibilities[currentRow].length - 1)) {
			// at end of row
			console.log('end of row');
		}
		else {
			currentCombination[currentRow] += 1;
			sequences.push(currentCombination); 
			break;
		}
	}
	
	// find the next possibile conbination on every row on the way back down until on the last row
	for (; currentRow <= possibilities.length - 1; currentRow++) {
		if (endOfRowCheck(currentCombination[currentRow], possibilities[currentRow].length - 1)){
			// start at beginning of row and find the next assending value based on the previous row's value
			for (var i = 0; i < possibilities[currentRow].length - 1; i++){
				if (possibilities[currentRow][i] > possibilities[currentRow - 1][currentCombination[currentRow]]) {
					currentCombination[currentRow] = i;
				}
			}

		}
		else {
			// increment current row's index
			currentCombination[currentRow] += 1;
		}
	}
	
	// when on the last row, push entire combination
	sequences.push(currentCombination);


	// check if end of current row
	// if (endOfRowCheck(possibilities[currentRow].length - 1, currentCombination[currentRow])) {
	// 	currentRow--;
	// }
	// else {
	// 	// increment index to next viable combination on row
	// 	currentCombination[currentRow] += 1;
	// 	sequences.push(currentCombination); 
	// }

	// if (_.findIndex(possibilities[currentRow], greaterThanCurrentRowValue) != -1){

	// }
}

// Function receives removal array and single row from possibilities 2D array
// Returns a row with index values stored in removal array removed
function indexRemoval(removalIndex, possibilities) {
	for (var i = removalIndex.length - 1; i >= 0; i--) {
		possibilities.splice(removalIndex[i], 1);
	}
	return possibilities;
}

// remove consecutive numbers after start of row
function startIndexRemoval(possibilities) {
	var removalIndex = [];
	for (var i = 0; i < possibilities.length; i++) {
		if (possibilities[i].length > 1) {
			for(var j = 0; j < possibilities[i].length - 1; j++) {
				if (possibilities[i][j] == possibilities[i][j+1] - 1) {
					removalIndex.push(j+1);
				}
				else if (possibilities[i][j] != possibilities[i][j+1] - 1) {
					break;
				}
			}	

			// remove specific indexes
			if (removalIndex.length > 0) {
				possibilities[i] = indexRemoval(removalIndex, possibilities[i]);
			}
			
			// clear removalIndex array for next row
			removalIndex = [];
		}
	}
	return possibilities;
}

// remove consecutive numbers before end of row
function endIndexRemoval(possibilities) {
	var removalIndex = [];
	for (var i = 0; i < possibilities.length; i++) {
		if (possibilities.length > 1) {
			for(var j = possibilities[i].length - 1; j >= 0; j--) {
				// console.log(possibilities[i][j]);
				// console.log(possibilities[i][j+1] + 1)
				if (possibilities[i][j] == possibilities[i][j-1] + 1) {
					removalIndex.push(j-1);
				}
				else if (possibilities[i][j] != possibilities[i][j-1] + 1) {
					break;
				}
			}	

			// reverse removalIndex
			removalIndex = removalIndex.reverse();
			
			// remove specific indexes
			if (removalIndex.length > 0) {
				possibilities[i] = indexRemoval(removalIndex, possibilities[i]);
			}
			
			// clear removalIndex array for next row
			removalIndex = [];
		}
	}
	return possibilities;
}

// remove consecutive numbers in the middle of row
function middleIndexRemoval(possibilities) {
	var removalIndex = [];
	for (var i = 0; i < possibilities.length; i++) {
		if (possibilities.length > 1) {	
			for(var j = possibilities[i].length - 1; j >= 1; j--) {
				// console.log(possibilities[i][j]);
				// console.log(possibilities[i][j+1] + 1)
				if (possibilities[i][j] == possibilities[i][j-1] + 1) {
					removalIndex.push(j-1);
				}
				else if (possibilities[i][j] != possibilities[i][j-1] + 1) {
					// break;
				}
			}	

			// reverse removalIndex
			removalIndex = removalIndex.reverse();
			
			// remove specific indexes
			if (removalIndex.length > 0) {
				possibilities[i] = indexRemoval(removalIndex, possibilities[i]);
			}
			
			// clear removalIndex array for next row
			removalIndex = [];
		}
	}
	return possibilities;
}

function removeConsecutives(largePossibilities) {

	var reducedPossibilities = [];

	reducedPossibilities = endIndexRemoval(largePossibilities);
	reducedPossibilities = startIndexRemoval(reducedPossibilities);
	reducedPossibilities = middleIndexRemoval(reducedPossibilities);

	return reducedPossibilities;
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
			
			// TODO:  Add code here to check for consecutive numbers
			// and grab push the last index if consecutive numbers exist
			
			temp = _.indexOf(originalmsg, firstcodemsg[i], searchindex);
			firstpossibility.push(temp);
			searchindex = temp + 1;
		}
	}
	temp = [];

	//	find last possibility -> place indexes of each character in array
	searchindex = originalmsg.length - 1;
	for (var i = firstcodemsg.length - 1; i >= 0 ; i--) {
		if (firstcodemsg[i] == '_') { /* do nothing */ } 
		else {
			temp = _.lastIndexOf(originalmsg, firstcodemsg[i], searchindex)
			lastpossibility.push(temp);
			// lastpossibility[firstcodemsg.length - 1 - i] = _.lastIndexOf(originalmsg, firstcodemsg[i], searchindex);
			searchindex = temp - 1;
		}
	}
	lastpossibility = lastpossibility.reverse();
	temp = [];


	//	use start and finish to calculate all "in between" possible indexes
	//	 -> push those indexes into a 2D array (possibilities)
		
	console.log(firstpossibility);
	console.log(lastpossibility);
	
	// Remove underscores from first code
	var shortfirstcode = removeUnderscores(firstcodemsg);

	// Iterate through all characters of removal string
	// to populate the possibilities 2D array.
	// The possibilities array stores the range of indexes
	// for each '*' or '-' that could be removed from a message
	for (var i = 0; i < firstpossibility.length; i++ ) {
		start = firstpossibility[i];
		end = lastpossibility[i];
		for (; start <= end; start++ ) {
			if (originalmsg[start] == shortfirstcode[i]) {
				temp.push(start);
				// console.log("PUSHED!");

			}
		}

		// check if temp row has any consecutive indexes

		possibilities[i] = temp;
		temp = [];
	}

	// Remove consecutive numbers from rows of possibilities 2D array
	possibilities = removeConsecutives(possibilities);

	console.log(possibilities);


	// variables necessary to solution
	var start = [];
	var end = [];
	var	temp = [];

	for (var i = 0; i < firstpossibility.length; i++) {
		start.push(0);
		end.push(possibilities[i].length - 1);
	}

	// clear sequences
	sequences = [];

	// push start into sequences array
	sequences.push(start);

	// current variable stores the index of the latest legit sequence
	current = start;
	
	var once = 0;
	do {
		// find index values for the next legit sequence
		current = findNextCombination(current, possibilities);
		once++;
		console.log(sequences);
	} while(once < 2); // current != end


	var total = 1;
	for (var i = 0; i < newpossibilities.length; i++){
		total *= newpossibilities[i].length;
	}
	console.log("TOTAL COMPUTATIONS: " + total);
	console.log("Time: " + Math.floor(total/151000/6) + " minutes")
	console.log("I'm done running now.  The answer is: " + answer + ".");
});



/*

Outer loop is only concerned with whether the current position is the end position.  If it’s not, then iterate through the inner loop.
	In the inner loop, I should get a copy of the array possibilities (2D array)... ooh ooh, I can send this copy off to a function with the current combination, which will return the next loop iteration.  This function can also call other functions... and possibly add to the possibilities array as well.
	Functions needed:
Check for next possibility that is valid, unique
Address issue of eliminating unecessary iterations.
Function which counts up correctly

*/





/* Excess code


// calculate a specific computation

// Pre-calculate divisors
// function calculatedivisors(possibilities) {
// 	var divisors = [];
// 	for (var i = possibilities.length - 1; i >= 0; i--) {
// 	   divisors[i] = divisors[i + 1] ? divisors[i + 1] * possibilities[i + 1].length : 1;	
// 	}
// 	return divisors;
// }

// function getpermutation(n) {
//    var result = [], curArray;

//    for (var i = 0; i < possibilities.length; i++) {
//       curArray = possibilities[i];
//       result.push(curArray[Math.floor(n / divisors[i]) % curArray.length]);
//    }

//    return result;
// }

// function getnext(possibilities, start, end) {
// 	var unique = start.slice();
// 	var next = [];
// 	for (var i = possibilities.length; i >= 0; i--) {
// 		for (var j = start[i]; j <= end[i]; j++) {
			
// 			if (i == 0 && start[i] == 0) {
// 				unique.push(possibilities[i][j]);
// 				next.push(possibilities[i][j]);
// 				break;
// 			}	
// 			else if (!_.contains(unique,possibilities[i][j]) && possibilities[i][j] > _.last(next))  {
// 				unique.push(possibilities[i][j]);
// 				next.push(possibilities[i][j]);
// 			}
// 			else {
// 				continue;
// 			}
// 		}
// 	}
// 	return next;
// }

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
	// console.log("searchindex: " + searchindex + "\n" + 
	// 	"firstcodemsg[i]: " + firstcodemsg[i] + "\n" + 
	// 	"i: " + i);
	// console.log(_.indexOf(originalmsg, firstcodemsg[i], searchindex));

	// console.log("\n" + 
	// 	"start: " + start + "\n" +
	// 	"end:   " + end + "\n" +
	// 	"originalmsg[start]: " + originalmsg[start] + "\n" +
	// 	"shortfirstcode[i]: " + shortfirstcode[i]);

	// console.log("\nsearchindex: " + searchindex + "\n" + 
	// 	"code back to front: " + firstcodemsg[i] + "\n" + 
	// 	"i: " + i + "\n" );
	// 	// "firstcodemsg.length - 1 - i: " + (firstcodemsg.length - 1 - i).toString());
	// console.log("found location:                    " + _.lastIndexOf(originalmsg, firstcodemsg[i], searchindex));

	// get shortended version of the first removal message (with spaces removed)
	// removing the spaces improves execution time, but could lead to
	// future confusion (or additional code)

	// check length of firstpossibility against firstcodemsg
	// if (firstpossibility.length != firstcodemsg.length) {
	// 	// replace all '_' with ""

	// 	shortfirstcode = firstcodemsg.replace(/_/g, "");
	// 	// console.log("sanity");
	// }
	// else {
	// 	// store copy of firstcodemsg in shortfirstcode
	// 	shortfirstcode = firstcodemsg.split(0);
	// }
	// console.log(shortfirstcode);

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

	// console.log(possibilities.length;

	// console.log(firstpossibility);
	// console.log(start);


	// initialize start to be an array of 0s the length of possibilities
	// start = new Array(newpossibilities.length).fill(0);

	// initialize end to be an array with the length of each row ofpossibilities
	// for (i = 0; i < newpossibilities.length; i++) {
		// end.push(newpossibilities[i].length - 1);
	// }


	// generate all possibilities

	// while (!_.isEqual(start, end)) {
		// start = getnext(possibilities, firstpossibility, lastpossibility);
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

	/////////////////////////////////////////////////////////////

	// divisors = calculatedivisors(possibilities);


	//	traverse the array using every combination to calculate (allpossibilities)
	// allpossibilities = getPermutation(possibilities);
//////////////////////////////////////////////////////////////////////////////////
	// generate sequences
	// var copy = [];
	// for (var i = 0; i < allpossibilities.length; i++) {
		
	// 	copy = originalmsg.slice(0);
		
	// 	for (var j = 0; j < firstcodemsg.length; j++) {
	// 		// replace characters marked for removal with ' '						
	// 		copy = copy.removeit(Number(allpossibilities[i][j]));
	// 	}

	// 	// sequences.push(copy.split());
	// 	sequences.push(copy);
	// }

	// remove spaces from sequences
	// var temp;
	// for (var i = 0; i < sequences.length; i++) {
	// 	sequences[i] = sequences[i].replace(/ /g, "");
	// }

	// find unique versions of sequences
	// answer = _.uniq(sequences).length;
	
///////////////////////////////////////////////////////////////////////////////////////

	// OUTPUT 
	// console.log("first possibility: " + firstpossibility);			// check
	// console.log("last possibility:  " + lastpossibility); 			// check
	// console.log("possibilities:    \n ");				// check
	// console.log(newpossibilities);				// check

	// console.log("allpossibilities:  " + allpossibilities);			// check
	// console.log("sequences:         " + sequences);					// takes forever, but works
	// console.log("unique sequences:  " + _.uniq(sequences));			// check














*/
