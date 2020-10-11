import { Graph } from "../graph/graph";
import { markPredecessors, markSuccessors } from "../graph/graph_tools";
import { NodeAttr } from "../graph/attributes";
import { Algorithm } from "./algorithm";
import { MatrixGraph } from "../graph/matgraph";
import { createMat } from "../util/array";

/**
 * Class managing connected groups in a graph
 */
export class StronglyConnectedGroups extends Algorithm {
	graph: Graph;

	group: NodeAttr<number>;
	succs: NodeAttr<number[] | null>;
	preds: NodeAttr<number[] | null>;
	content: NodeAttr<number[]> | null;

	constructor(g: Graph) {
		super();
		
		this.graph = g;

		this.group = new NodeAttr(g, "group", -1);
		this.succs = new NodeAttr(g, "suc", null);
		this.preds = new NodeAttr(g, "pred", null);
		this.content = null;
	}

	/**
	* Cluster all nodes in groups
	* @param graph graph to cluster
	* @param markPredsAndSuccs whether to mark successors and predecessors
	* or use already defined values
	* @returns number of groups
	*/
	cluster(markPredsAndSuccs: boolean = true): number {
		let n = this.graph.size();

		// If required to mark predecessors and successors
		if (markPredsAndSuccs) {
			this.preds.reset(null);
			this.succs.reset(null);

			// First find successors and predecessors
			this.graph.forEachNode((node) => {
				markPredecessors(this.graph, node, this.preds);
				markSuccessors(this.graph, node, this.succs);
			})
		}

		this.debug("[[[ Predecessors computed ]]]\n", this.preds.values);
		this.debug("[[[ Successors computed ]]]\n", this.succs.values);

		// Create group attribute
		this.group.reset(-1);

		let groupIndex = 0;

		this.debug("[[[ Creating groups ]]]");
		this.graph.forEachNode((node) => {
			let group = this.group.get(node);

			// If node not assigned to group yet
			if (group === -1) {
					// Add all common preds and succs in same group
					group = groupIndex ++;

					let preds = this.preds.get(node)!;
					let succs = this.succs.get(node)!;
					let members = preds.filter((pred: any) => succs.indexOf(pred) !== -1);

					members.forEach((member) => {
						// Do not add/deug twice :)
						if (member !== node) {
							this.group.set(member, group);
							this.debug("Adding", member, "to group", group);
						}
					});
					this.group.set(node, group);
					this.debug("Adding", node, "to group", group);
				}
		});

		// Return number of groups
		return groupIndex;
	}

	/**
	* Cluster nodes into groups, then return the simplified graph
	* with all connected groups as a single nodes
	*/
	simplify(contentName: string = "group-content"): Graph {
		let n = this.cluster();
		let simpleMatrixGraph = new MatrixGraph(createMat<number>(n, n, 0));
		let groupContent = new NodeAttr<number[]>(simpleMatrixGraph, contentName, () => []);

		this.graph.forEachNode((node) => {
			// Get successors and groups
			let successors = this.succs.get(node)!;
			let group = this.group.get(node);

			// For each successors not in group, 
			successors.forEach((successor) => {
				let sGroup = this.group.get(successor);

				if (sGroup !== group) {
					// Link both groups
					simpleMatrixGraph.link(group, sGroup);

					this.debug("Linking group", group, "with group", sGroup);
				}
			});

			// Save group content
			groupContent.get(group).push(node);
		});

		// Save attribute helper for further operations
		this.content = groupContent;

		return simpleMatrixGraph;
	}
}
