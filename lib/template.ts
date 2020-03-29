declare var readline_object: any;
declare var log: Function;

// Compilé depuis des fichiers typescript :)

import input, { num, nums, numsMat, tuples } from "../../lib/util/input";


input(readline_object).then((data: string[]) => {
	// Your code here
	let n = num(data[0]);

	return n;
})
.then((result: any) => {
	if (result !== undefined) {
		console.log(result);
	}
});