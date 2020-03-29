import { Graph } from "../graph/graph";
import { Algorithm } from "./algorithm";
import { LinkAttr, NodeAttr } from "../graph/attributes";

export default class MaximumFlow extends Algorithm {
    graph: Graph;
    flow: LinkAttr<number>;

    /**
     * Precessessor mark
     */
    mark: NodeAttr<number | null>;

    constructor(g: Graph) {
        super();

        this.graph = g;
        this.flow = new LinkAttr(g, "flow", 0);
        this.mark = new NodeAttr(g, "mark", null);
    }

    /**
     * Seek an improving chain in current flow
     * @param source start node
     * @param target end node
     */
    seekChain(source: number, target: number): boolean {
        // Reset nodes marks
        this.mark.reset(null);
        this.mark.set(source, source);

        let stack: number[][] = [[source]];
        
        while(stack.length > 0) {
            if (stack[0].length === 0) {
                stack.shift();
            } else {
                const current: number = stack[0].shift()!;
                const depth = stack.length - 1;
        
                if (current === target) {
                    this.debug("Found improving chain : ", this.mark.values);
                    return true;
                }

                if (depth <= this.graph.size()) {
                    let layer: number[] = [];
                    
                    this.graph.successors(current).forEach((successor) => {
                        // If the given successor isn't already marked
                        if (this.mark.get(successor) === null) {
                            // Compute remaining flow available
                            let available = this.graph.weight(current, successor)
                                - this.flow.get(current, successor);
        
                            if (available > 0) {
                                // Set mark to node such as the successor is selected
                                this.mark.set(successor, current);
                                layer.push(successor);
                            }
                        }
                    });
        
                    this.graph.predecessors(current).forEach((predecessor) => {
                        // If predecessor isn't already marked
                        if (this.mark.get(predecessor) === null) {
                            // Get flow that we can free from this
                            let available = this.flow.get(predecessor, current);
        
                            if (available > 0) {
                                // Set mark to node such as the successor is selected
                                // (negative because we go against the flow)
                                this.mark.set(predecessor, -current - 1);
                                layer.push(predecessor);
                            }
                        }
                    });

                    stack.unshift(layer);
                }
            }
        }

        return false;
    }

    /**
     * Improve found chain in flow
     * @param source start node
     * @param target end node
     */
    improve(source: number, target: number) {
        let minimumFlow = Infinity;
        let stack: number[] = [target];
        
        while(stack.length - 1 <= this.graph.size()) {
            const node: number = stack[0];

            if (node === source) {
                break;
            }

            let pred = this.mark.get(node)!;
            let flow;

            if (pred >= 0) {
                flow = this.graph.weight(pred, node) - this.flow.get(pred, node);
            } else {
                pred = - pred - 1;
                flow = this.flow.get(node, pred);
            }

            minimumFlow = Math.min(minimumFlow, flow);
            stack.unshift(pred);
        }
        
        let pred = target;
        let succ = -1;

        for (let i = stack.length - 2; i >= 0; i--) {
            succ = pred;
            pred = stack[i];

            if (pred < 0) {
                pred = - pred - 1;
    
                let flow = this.flow.get(succ, pred);
                this.flow.set(succ, pred, flow - minimumFlow);
                this.debug("Set flow of", succ, "->", pred, "to", flow - minimumFlow, "from", flow);
            }
            
            // Otherwise
            else {
                let flow = this.flow.get(pred, succ);
                this.flow.set(pred, succ, flow + minimumFlow);
                this.debug("Set flow of", succ, "->", pred, "to", flow + minimumFlow, "from", flow);
            }
        }
    }

    /**
     * Compute maximal flow
     * @param source source node
     * @param target target node
     * @returns maximum flow in the graph
     */
    compute(source: number, target: number): number {
        this.flow.reset(0);

        while (this.seekChain(source, target)) {
            this.improve(source, target);
        }

        let maximumFlow = this.graph.predecessors(target).reduce((sum, pred) =>
            sum + this.flow.get(pred, target),
            0
        );

        this.debug("Found maximum flow of", maximumFlow);
        this.debug("Flow matrix :", this.flow.values);

        return maximumFlow;
    }
}