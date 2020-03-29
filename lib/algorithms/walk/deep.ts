export function* walkDeep<M>(startValue: M, maxDepth: number): IterableIterator<M> {
	let stack: M[][] = [[startValue]];

	while(stack.length > 0) {
		if (stack[0].length === 0) {
			stack.shift();
		} else {
			const current: M = stack[0].shift()!;
			const depth = stack.length - 1;

			if (depth <= maxDepth) {
				stack.unshift(yield current);
			}
		}
	}
}