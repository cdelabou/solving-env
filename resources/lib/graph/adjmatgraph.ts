import { Graph } from "./graph";
import { LinkAttr } from "./attributes";

/**
 * Simple adjacency matrix to have graphs
 */
export class AdjacencyMatrixGraph extends Array<number[]> implements Graph {
	_weight: LinkAttr<number>;

	constructor(size: number) {
		super(...new Array(size).fill(0).map(() => []));

		this._weight = new LinkAttr<number>(this, "_weight", 0);
		this._weight.reset(0);
	}

	size() {
		return this.length;
	}
	
	islinked(source: number, dest: number) {
		return this[source].indexOf(dest) === -1;
	}

	link(source: number, dest: number, weight: number = 1) {
		this[source].push(dest);
		this._weight.set(source, dest, weight);
	}

	unlink(source: number, dest: number) {
		this[source] = this[source].filter(a => a != dest);
	}

	weight(source: number, dest: number) {
		if (this.islinked(source, dest)) {
			return this._weight.get(source, dest);
		} else {
			return 0;
		}
	}

	successors(i: number): number[] {
		return this[i];
	}

	predecessors(i: number): number[] {
		let preds: number[] = [];
		
		this.forEach((succs, j) => {
			if (succs.indexOf(i) !== -1) {
				preds.push(j);
			}
		});

		return preds;
	}

	forEachNode(callback: (source: number) => any): void {
		this.forEach((_, i) => callback(i));
	}

	forEachLink(callback: (source: number, dest: number) => any): void {
		this.forEach((node, source) => {
			node.forEach((dest) => callback(source, dest));
		})
	}
}
