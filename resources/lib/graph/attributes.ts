import { Graph } from "./graph";
import { createMat } from "../util/array";

export class LinkAttr<M> {
	graph: Graph;
	name: string;
	values: M[][];

	constructor(graph: Graph, name: string, defaultValue: M | (() => M)) {
		this.graph = graph;
		this.name = name;
		this.values = [];

		// Init with default value
		this.reset(defaultValue);
	}

	/**
	 * Reset attribute with given value or generator
	 * @param value value or generator
	 */
	reset(value: M | ((source: number, dest: number) => M)) {
		this.values = createMat(this.graph.size(), this.graph.size(), value);
	}

	/**
	 * Get attribute value from node or link
	 * 
	 * @param source source node
	 * @param dest destination node
	 */
	get(source: number, dest: number): M {
		if (source < 0 || source > this.values.length) {
			throw `source out of bounds, please reset attribute or review node index`;
		} else if (dest < 0 || dest > this.values[source].length) {
			throw `dest out of bounds, please reset attribute or review node index`;
		}

		return this.values[source][dest];
	}

	/**
	 * Set attribute value in link
	 * 
	 * @param source source node
	 * @param dest destination node
	 */
	set(source: number, dest: number, value: M) {
		if (source < 0 || source > this.values.length) {
			throw `source out of bounds, please reset attribute or review node index`;
		} else if (dest < 0 || dest > this.values[source].length) {
			throw `dest out of bounds, please reset attribute or review node index`;
		}

		this.values[source][dest] = value;
	}
}

export class NodeAttr<M> {
	graph: Graph;
	name: string;
	values: M[];

	constructor(graph: Graph, name: string, defaultValue: M | ((node: number) => M)) {
		this.graph = graph;
		this.name = name;
		this.values = [];

		this.reset(defaultValue);
	}

	/**
	 * Reset attribute with given value or generator
	 * @param value value or generator
	 */
	reset(value: M | ((node: number) => M)) {
		this.values = new Array(this.graph.size()).fill(0).map((_, i) => {
			if (value instanceof Function) {
				return value(i);
			} else {
				return value;
			}
		});
	}

	/**
	 * Get attribute value from node
	 * 
	 * @param node source node
	 */
	get(node: number): M {
		if (node < 0 || node > this.values.length) {
			throw `node out of bounds, please reset attribute or review node index`;
		}

		return this.values[node];
	}

	/**
	 * Set attribute value in node
	 * 
	 * @param node source node
	 * @param value new value
	 */
	set(node: number, value: M) {
		if (node < 0 || node > this.values.length) {
			throw `node out of bounds, please reset attribute or review node index`;
		}

		this.values[node] = value;
	}
}