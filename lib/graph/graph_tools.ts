import { Graph } from "./graph";

import { NodeAttr } from "./attributes";
import { removeDuplicates } from "../util/array";

/**
 * Mark a node with all of it's successors, using their own mark
 * @param graph root graph
 * @param node node
 * @param attr attribute name
 */
export function markSuccessors(graph: Graph, node: number, attr: NodeAttr<number[] | null>) {
    markRecursively(graph, node, attr, (next) => graph.successors(next));
}

/**
 * Mark a node with all of it's predecessors, using their own mark
 * @param graph root graph
 * @param node node
 * @param attr attribute name
 */
export function markPredecessors(graph: Graph, node: number, attr: NodeAttr<number[] | null>) {
    markRecursively(graph, node, attr, (next) => graph.predecessors(next));
}

/**
 * Mark a node with related nodes recursively according to given generator.
 * If a mark is found on an other node, it is concatenated to the list.
 * @param graph root graph
 * @param node node
 * @param attr attribute name
 * @param generator generator for next search layer (example: successors)
 */
export function markRecursively(graph: Graph, node: number, attr: NodeAttr<number[] | null>, generator: (node: number) => number[]) {
    let previousLayer: number[] = [node];
    let currentLayer: number[] = [];
    let depth = 0;
    let marked: number[] = [];

    while(previousLayer.length > 0 && depth <= graph.size() + 1) {
        for(let next of previousLayer) {
            let computed = attr.get(next);

            // Add this node to successors if not the first turn
            if (depth !== 0) {
                marked.push(next);
            }

            if (computed !== null) {
                marked = marked.concat(computed);
            } else {
                // Explore non explored successors
                generator(next).forEach((value) => {
                    if (marked.indexOf(value) === -1) {
                        currentLayer.push(value);
                    }
                });
            }
        }
    
        previousLayer = currentLayer;
        currentLayer = [];
    
        depth += 1;
    }

    attr.set(node, removeDuplicates(marked));
}

