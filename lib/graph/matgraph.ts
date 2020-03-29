import { Graph } from "./graph";

/**
 * Matrix as a graph with nodes an links. Contains weight by default
 * 
 * graph[i][j] != 0 mean that i is the predecessor of j
 */
export class MatrixGraph extends Array<number[]> implements Graph {
	oriented: boolean;

	constructor(values: number[][]) {
		super(...values);

		// Generate default labels
		this.oriented = true;
	}

	size() {
		return this.length;
	}

	/**
	 * Return the weight of a link
	 * @param source 
	 * @param dest 
	 */
	weight(source: number, dest: number): number {
		return this[source][dest];
	}

	islinked(source: number, dest: number) {
		return this[source][dest] > 0;
	}

	/**
	 * Link 2 nodes together, if the graph is not oriented if
	 * link in both ways with same weight
	 * @param source Source node id
	 * @param dest Destination node id
	 * @param weight Weight of the node if different that one
	 */
	link(source: number, dest: number, weight: number = 1) {
		// Check if they are valid
		if (source < 0 || source > this.size()) {
			throw `${source} does not match with any node (out of bound or no matching label)`;
		} else if (dest < 0 || dest > this.size()) {
			throw `${dest} does not match with any node (out of bound or no matching label)`;
		}

		// Apply weight
		this[source][dest] = weight;

		// In both ways if non oriented
		if (!this.oriented) {
			this[dest][source] = weight;
		}
	}

	/**
	 * Return a list of successors (having m[j][i] != 0 for all j)
	 * @param i node id
	 */
	successors(i: number): number[] {
		let succs = [];

		for (let line = 0; line < this.size(); line++) {
			if (this[i][line] !== 0) {
				succs.push(line);
			}
		}

		return succs;
	}

	/**
	 * Return a list of predecessors (having m[i][j] != 0 for all j)
	 * @param i node id
	 */
	predecessors(i: number): number[] {
		let succs = [];

		for (let col = 0; col < this.size(); col++) {
			if (this[col][i] !== 0) {
				succs.push(col);
			}
		}

		return succs;
	}

	forEachNode(callback: (source: number) => any): void {
		this.forEach((_, i) => callback(i));
	}

	forEachLink(callback: (source: number, dest: number) => any): void {
		this.forEach((node, source) => {
			node.forEach((weight, dest) => {
				if (weight !== 0) {
					callback(source, dest);
				}
			});
		})
	}
}