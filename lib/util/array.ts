export function removeDuplicates<M>(array: M[]): M[] {
	return array.filter(function(elem, pos) {
		return array.indexOf(elem) == pos;
	});
};

/**
 * Create a new matrix
 * @param lines number of lines
 * @param columns number of columns
 * @param content values to fill the matrix with
 */
export function createMat<N>(lines: number, columns: number, content: N | ((line: number, column: number) => N)) {
	return new Array(lines).fill(0).map(
		(v, line) => new Array(columns).fill(0).map((k, col) => {
			if (content instanceof Function) {
				return content(line, col);
			} else {
				return content;
			}
		})
	);
}


export function mapMat<N, M>(array: N[][], cb: (val: N, i: number, j: number) => M): M[][] {
	let mapped = new Array();
	for (let i = 0; i < array.length; i++) {
		let line = [];
		for (let j = 0; j < array[i].length; j++) {
			const v = array[i][j];
			line.push(cb(v, i, j));
		}
		mapped.push(line);
	}
	return mapped;
}