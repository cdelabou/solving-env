import { NodeAttr } from "../graph/attributes";
import { Graph } from "../graph/graph";

class Color {
	color: NodeAttr<number>;
	graph: Graph;

	constructor(g: Graph) {
		this.graph = g;
		this.color = new NodeAttr(g, "color", -1);
	}

	compute() {
		let nodes = new Array(this.graph.size()).fill(0).map((_, i) => i);

		nodes.sort((nodeA, nodeB) => {
			return this.graph.successors(nodeA).length +
				this.graph.predecessors(nodeA).length
				- this.graph.successors(nodeB).length -
				this.graph.predecessors(nodeB).length
		});

		this.color.reset(-1);
		
		while (nodes.length > 0) {
			let node = nodes.shift()!;
			let around = this.graph.successors(node).map(
				(successor) => this.color.get(successor)
			);
			let curr = 0;

			while(around.indexOf(curr) !== -1) {
				curr ++;
			}

			this.color.set(node, curr);		
		}
	}
}