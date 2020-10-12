
import { AdjacencyMatrixGraph } from "../graph/adjmatgraph";
import { Graph } from "../graph/graph";

/**
 * 2-SAT solver
 * Help determining whether a list of (x or y) equations
 * can all be fulfilled.
 */
export default class Kosaraju {
	graph: Graph;
	reverse: Graph;

	constructor(graph: Graph, reverse: Graph) {
		this.graph = graph;
		this.reverse = reverse;
	}

	satisfiable() {
		/*let walker = new Walker<number>(this.graph.size());
		let visited: (boolean)[] = [];

		walker.generateLayer = (node) => {
			if (visited[node] !== true) {
				visited[node] = true;

				let successors = this.graph.successors(node).filter((suc) => !visited[suc]);
			}

			return [];
		};*/
	}

	/**
	 * Create graph and init everything with the graph
	 * @param tuples list of boolean OR equations
	 * @param m number of variables
	 * 
	 * Each tuple is composed of 2 values i and j,
	 * and represent the boolean operation x(i) or x(j).
	 * 
	 * Negatives values represent the negation of the value.
	 * For example : [3, -2] mean x(3) or not x(2).
	 * 
	 * Zero can't be used and indexes starts from one.
	 */
	static fromTuples(tuples: number[][], m: number) {
		let n = tuples.length;
		let graph = new AdjacencyMatrixGraph(m * 2);
		let revGraph = new AdjacencyMatrixGraph(m * 2);

		tuples.forEach((tuple) => {
			if (tuple.length !== 2) {
				throw "invalid tuple of size != 2";
			}

			let a = tuple[0];
			let b = tuple[1];
			let nota = -tuple[0];
			let notb = -tuple[1];

			// Condition (a or b) true => (not a => b) and (not b => a)
			graph.link(this.xToIndex(notb, m), this.xToIndex(a, m));
			graph.link(this.xToIndex(nota, m), this.xToIndex(b, m));

			// Save the reverse into the reverse graph
			revGraph.link(this.xToIndex(a, m), this.xToIndex(notb, m));
			revGraph.link(this.xToIndex(b, m), this.xToIndex(nota, m));
		});

		return new Kosaraju(graph, revGraph);
	}

	/**
	 * Convert boolean integer value to it's index in graph nodes.
	 * -i match with "not x(i)" starting at index [size]
	 * i match with "x(i)" starting at index 0
	 * 
	 * @param x condition expressed as integer
	 * @param variables number of variables
	 */
	static xToIndex(x: number, variables: number) {
		if (x < 0) {
			return variables + x - 1;
		} else {
			return x - 1;
		}
	}
}