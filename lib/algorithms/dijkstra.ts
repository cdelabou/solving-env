import { Graph } from "../graph/graph";
import { Algorithm } from "./algorithm";
import { NodeAttr } from "../graph/attributes";


export default class Dijkstra extends Algorithm {
    cost: NodeAttr<number>;
    predecessor: NodeAttr<number | null>;
    beginNodeCost: number;
    graph: Graph;

    constructor(graph: Graph) {
        super();

        this.graph = graph;
        this.cost = new NodeAttr(graph, "cost", Infinity);
        this.predecessor = new NodeAttr(graph, "pred", null);
        this.beginNodeCost = 0;
    }

    selectCost(old: number, newW: number) {
        return newW < old;
    }

    nodeSortFunction(n1: number, n2: number) {
        return this.cost.get(n1) - this.cost.get(n2);
    }

    compute(begin: number, goal?: number) {
        let stack: number[] = [begin];
        let current: number;

        this.cost.reset(Infinity);
        this.predecessor.reset(null);

        this.cost.set(begin, this.beginNodeCost);

        while(stack.length > 0) {
            // Fetch most fitted node
            current = stack.shift()!;

            if (goal === current) {
                break;
            }

            // add nodes to explore
            this.graph.successors(current).forEach((successor) => {
                let newCost = this.cost.get(current) + this.graph.weight(current, successor);

                if (this.selectCost(this.cost.get(successor), newCost)) {
                    // set new weight and link
                    this.cost.set(successor, newCost);
                    this.predecessor.set(successor, current);

                    this.debug("Setting cost to visit", successor, "from", current, "to", newCost);

                    // and add to queue
                    stack.push(successor);
                }
            });

            // Sort node according to their path
            stack.sort((a, b) => this.nodeSortFunction(a, b));
        }
    }
}