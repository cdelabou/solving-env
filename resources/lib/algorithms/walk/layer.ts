/**
 * Walk layer by layer though yielded layers
 * 
 * 
 * @param startValue root of the tree
 * @param maxDepth max depth to reach (start value is at depth 0)
 */
export function* walkLayers<M>(startValue: M, maxDepth: number): Generator<M, void, M[]> {
	let previousLayer: M[] = [startValue];
	let currentLayer: M[] = [];
	let depth = 0;

	while(previousLayer.length > 0 && depth <= maxDepth) {
		// Generate new values from previous layer
		for(let value of previousLayer) {
			currentLayer = currentLayer.concat(yield value);
		}

		previousLayer = currentLayer;
		currentLayer = [];

		depth += 1;
	}
}

/* Associated snippet
"let previousLayer: ${1:number}[] = [${2:initialValue}];",
"let currentLayer: ${1:number}[] = [];",
"let depth = 0;",
"",
"while(previousLayer.length > 0 && depth <= ${3:maxDepth}) {",
"	for(let value of previousLayer) {",
"		currentLayer = currentLayer.concat(${0:[]});",
"	}",
"",
"	previousLayer = currentLayer;",
"	currentLayer = [];",
"",
"	depth += 1;",
"}"
*/