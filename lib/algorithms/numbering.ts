import { Graph } from "../graph/graph";
import { Algorithm } from "./algorithm";
import { StronglyConnectedGroups } from "./scc";
import { NodeAttr } from "../graph/attributes";

export class Numbering extends Algorithm {
	nodeNumber: NodeAttr<number>;
	groups: StronglyConnectedGroups;
	graph: Graph;

	constructor(g: Graph) {
		super();
		this.graph = g;
		this.nodeNumber = new NodeAttr<number>(g, "number", -1);
		this.groups = new StronglyConnectedGroups(g);
	}

	number() {
		this.groups.verbose = this.verbose;

		let simpleGraph = this.groups.simplify();

		// Get all of simple graph nodes index
		let nodes = new Array(simpleGraph.size()).fill(0).map((_, i) => i);

		// Number index
		let index = 0;

		// Add number attribute
		this.nodeNumber.reset(-1);

		while (nodes.length > 0) {
			nodes = nodes.filter((nodeGroup: number) => {
				let preds = simpleGraph.predecessors(nodeGroup)
					.filter(pred => nodes.indexOf(pred) > 0);
				
				// If this node has no predecessor
				if (preds.length === 0) {
					// Mark all containeds nodes in main graph
					let content = this.groups.content!.get(nodeGroup);

					content.forEach((node) => {
						this.nodeNumber.set(node, index);
						this.debug(`Set number of ${node} to ${index}`);
					});

					index += 1;
					return false;
				}

				// Keep non numbered nodes
				return true;
			});
		}
	}
}