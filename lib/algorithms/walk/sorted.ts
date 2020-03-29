/**
 * Walk through layers using sorted stack
 * @param startValue 
 * @param maxDepth 
 * @param sort 
 */
export function* walkSorted<M>(startValue: M, maxDepth: number, sort: (a: M, b: M) => number): IterableIterator<M> {
	let stack: M[] = [startValue];

	while(stack.length > 0) {
		const current: M = stack.shift()!;
		const depth = stack.length - 1;

		if (depth <= maxDepth) {
			stack = stack.concat(yield current);
			stack.sort(sort);
		}
	}
}

/* === Associated snippet: ===
"let stack: ${1:number}[] = [${2:initialValue}];",
"",
"while(stack.length > 0) {",
"\tconst current: ${1:number} = stack.shift()!;",
"\tconst depth = stack.length - 1;",
"",
"\tif (depth <= ${3:maxDepth}) {",
"\t\tstack.push(${0:[]});",
"",
"\t\tstack.sort(sort);",
"\t}",
"}"
*/